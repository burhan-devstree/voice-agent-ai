/* eslint-disable @typescript-eslint/no-explicit-any */
import { useStartConversation } from "@/hooks/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  convertFloat32ToInt16Base64,
  downsampleBuffer,
} from "../services/audioUtils";
import { useAppStore } from "../store/useAppStore";
import { GET_HISTORY } from "./api/use-history";

export type VoiceStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "speaking"
  | "error";

interface VoiceSessionContextType {
  status: VoiceStatus;
  isConnected: boolean;
  isUserSpeaking: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const VoiceContext = createContext<VoiceSessionContextType | null>(null);

function useVoiceSessionInternal() {
  const queryClient = useQueryClient();
  const { token, addLog, clearLogs } = useAppStore();
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);

  // Refs for persistent objects across renders
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

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
      setStatus((prev) => (prev === "speaking" ? "connected" : prev));
      return;
    }

    isPlayingRef.current = true;
    setStatus("speaking");
    const buffer = audioQueueRef.current.shift()!;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    currentSourceRef.current = source;
    source.onended = () => {
      currentSourceRef.current = null;
      playNextChunk();
    };
    source.start(0);
  }, []);

  const stopAudio = useCallback(() => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {
        console.warn("Failed to stop audio source", e);
      }
      currentSourceRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
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

  const { refetch: fetchAuth } = useStartConversation(token!, {
    enabled: false,
  });

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
    stopAudio();
    clearLogs(); // Clear logs on disconnect
    queryClient.invalidateQueries({
      queryKey: [GET_HISTORY],
    });
    setStatus("idle");
    setIsConnected(false);
    setIsUserSpeaking(false);
  }, [stopAudio, clearLogs, queryClient]);

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

      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);

      // Update user speaking state
      if (rms > 0.1) {
        setIsUserSpeaking(true);
      } else {
        setIsUserSpeaking(false);
      }

      // Increased threshold to 0.2 to prevent background noise interruptions
      if (rms > 0.2 && isPlayingRef.current) {
        console.log("Local VAD Interruption Triggered", rms);
        stopAudio();
      }
      if (!base64) {
        console.warn("Audio processing produced empty base64 string");
      }

      // console.log("Sending audio chunk, length:", isPlayingRef.current);
      ws.send(JSON.stringify({ user_audio_chunk: base64 }));
    };

    source.connect(processor);
    const muteNode = ctx.createGain();
    muteNode.gain.value = 0;
    processor.connect(muteNode);
    muteNode.connect(ctx.destination);
  };

  const connect = async () => {
    if (!token) return;
    setStatus("connecting");
    // addLog("Initializing session...", "info");

    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") await ctx.resume();

      // 1. Get Signed URL
      const { data: authData } = await fetchAuth();
      if (!authData) throw new Error("Failed to get auth data");
      const { signed_url, agent_id } = authData as any;
      // addLog(`Authenticated. ${agent_id.substring(0, 8)}...`, "success");

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
        addLog("Connected Successfully", "success");
        setStatus("connected");

        // Send Init
        ws.send(
          JSON.stringify({ type: "conversation_initiation_client_data" })
        );

        // Start streaming mic
        startMicStreaming(ctx, stream, ws);
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "audio" && data.audio_event?.audio_base_64) {
          setStatus("speaking");
          handleAudioMessage(data.audio_event.audio_base_64);
        } else if (data.type === "agent_response") {
          addLog(`${data.agent_response_event?.agent_response}`, "agent");
          // setStatus("connected"); // REMOVED to prevent premature status toggle before audio ends
        } else if (data.type === "user_transcript") {
          addLog(`${data.user_transcription_event?.user_transcript}`, "user");
          stopAudio();
        }
      };

      ws.onerror = (e) => {
        setIsConnected(false);
        console.error(e);
        addLog("Error in Connection", "error");
        disconnect();
      };

      ws.onclose = (e) => {
        setIsConnected(false);
        // addLog(`Session closed: ${e.code}`, "info");
        disconnect();
      };
    } catch (err: any) {
      setIsConnected(false);
      addLog(`Error in Connection`, "error");
      setStatus("error");
    }
  };

  return { status, isConnected, isUserSpeaking, connect, disconnect };
}

export function VoiceSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useVoiceSessionInternal();

  return (
    <VoiceContext.Provider value={session}>{children}</VoiceContext.Provider>
  );
}

export function useVoiceSession() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error(
      "useVoiceSession must be used within a VoiceSessionProvider"
    );
  }
  return context;
}
