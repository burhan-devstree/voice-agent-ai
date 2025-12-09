/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef, useState } from "react";
import { useStartConversationAuth } from "../services/api";
import {
  convertFloat32ToInt16Base64,
  downsampleBuffer,
} from "../services/audioUtils";
import { useAppStore } from "../store/useAppStore";

export type VoiceStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "speaking"
  | "error";

export function useVoiceSession() {
  const { token, addLog, isAuthenticated } = useAppStore();
  const [status, setStatus] = useState<VoiceStatus>("idle");

  // Refs for persistent objects across renders
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef<boolean>(false);

  // Initialize Audio Context lazily
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playNextChunk = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const buffer = audioQueueRef.current.shift()!;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => playNextChunk();
    source.start(0);
  }, []);

  const handleAudioMessage = useCallback(
    (base64Data: string) => {
      const ctx = getAudioContext();
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Try decoding (MP3/WAV container) or fallback to PCM
      ctx
        .decodeAudioData(bytes.buffer.slice(0))
        .then((buffer) => {
          audioQueueRef.current.push(buffer);
          if (!isPlayingRef.current) playNextChunk();
        })
        .catch((err) => {
          console.log("decodeAudioData failed, trying PCM fallback", err);
          try {
            // Ensure byte length is even for Int16Array
            const alignedBuffer =
              bytes.length % 2 === 0
                ? bytes.buffer
                : bytes.buffer.slice(0, bytes.length - 1);

            const int16Data = new Int16Array(alignedBuffer);
            const float32Data = new Float32Array(int16Data.length);
            for (let i = 0; i < int16Data.length; i++) {
              float32Data[i] = int16Data[i] / 32768.0;
            }
            const buffer = ctx.createBuffer(1, float32Data.length, 16000); // Assuming 16kHz from ElevenLabs
            buffer.getChannelData(0).set(float32Data);
            audioQueueRef.current.push(buffer);
            if (!isPlayingRef.current) playNextChunk();
          } catch (pcmError) {
            console.error("PCM decoding failed", pcmError);
          }
        });
    },
    [getAudioContext, playNextChunk]
  );

  const { refetch: fetchAuth } = useStartConversationAuth(token!, {
    enabled: false,
  });

  const connect = async () => {
    if (!token) return;
    setStatus("connecting");
    addLog("Initializing session...", "info");

    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") await ctx.resume();

      // 1. Get Signed URL
      const { data: authData } = await fetchAuth();
      if (!authData) throw new Error("Failed to get auth data");
      const { signed_url, agent_id } = authData as any;
      addLog(`Authenticated. Agent: ${agent_id.substring(0, 8)}...`, "success");

      // 2. Get Mic
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 3. Connect WS
      const ws = new WebSocket(signed_url);
      wsRef.current = ws;

      ws.onopen = () => {
        addLog("Connected to ElevenLabs AI", "success");
        setStatus("connected");

        // Send Init
        ws.send(
          JSON.stringify({ type: "conversation_initiation_client_data" })
        );

        // Start streaming mic
        startMicStreaming(ctx, stream, ws);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "audio" && data.audio_event?.audio_base_64) {
          setStatus("speaking");
          handleAudioMessage(data.audio_event.audio_base_64);
        } else if (data.type === "agent_response") {
          addLog(
            `Agent: ${data.agent_response_event?.agent_response}`,
            "agent"
          );
          setStatus("connected"); // Back to connected/listening
        } else if (data.type === "user_transcript") {
          addLog(`You: ${data.user_transcript?.transcript}`, "user");
        }
      };

      ws.onerror = (e) => {
        console.error(e);
        addLog("WebSocket Error", "error");
        disconnect();
      };

      ws.onclose = (e) => {
        addLog(`Session closed: ${e.code}`, "info");
        disconnect();
      };
    } catch (err: any) {
      addLog(`Connection failed: ${err.message}`, "error");
      setStatus("error");
    }
  };

  const startMicStreaming = (
    ctx: AudioContext,
    stream: MediaStream,
    ws: WebSocket
  ) => {
    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(8192, 1, 1);
    inputProcessorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;

      const inputData = e.inputBuffer.getChannelData(0);
      const downsampled = downsampleBuffer(inputData, ctx.sampleRate, 16000);
      const base64 = convertFloat32ToInt16Base64(downsampled);

      if (!base64) {
        console.warn("Audio processing produced empty base64 string");
      }

      // console.log("Sending audio chunk, length:", base64.length);
      ws.send(JSON.stringify({ user_audio_chunk: base64 }));
    };

    source.connect(processor);
    const muteNode = ctx.createGain();
    muteNode.gain.value = 0;
    processor.connect(muteNode);
    muteNode.connect(ctx.destination);
  };

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (inputProcessorRef.current) {
      inputProcessorRef.current.disconnect();
      inputProcessorRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setStatus("idle");
  }, []);

  return { status, connect, disconnect };
}
