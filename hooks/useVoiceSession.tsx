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

// --- Types ---
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

  // --- State ---
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);

  // --- Refs ---
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputProcessorRef = useRef<ScriptProcessorNode | null>(null);

  // Audio Scheduling Refs
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isAIPlayingRef = useRef<boolean>(false);

  // Queue Refs
  const processingQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef<boolean>(false);

  // --- 1. Audio Context Helper ---
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    return audioContextRef.current;
  }, []);

  // --- 2. Kill Switch (Clear Audio) ---
  const stopAudioAndClearQueue = useCallback(() => {
    // Stop all playing sources
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        /* ignore */
      }
    });
    activeSourcesRef.current = [];

    // Reset State
    processingQueueRef.current = [];
    isProcessingRef.current = false;
    isAIPlayingRef.current = false;
    nextStartTimeRef.current = 0;

    setStatus((prev) => (prev === "speaking" ? "connected" : prev));
  }, []);

  // --- 3. Disconnect (Moved Up to fix ReferenceError) ---
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

    stopAudioAndClearQueue();
    clearLogs();
    queryClient.invalidateQueries({ queryKey: [GET_HISTORY] });

    setStatus("idle");
    setIsConnected(false);
    setIsUserSpeaking(false);
  }, [stopAudioAndClearQueue, clearLogs, queryClient]);

  // --- 4. Scheduler (Time-based playback) ---
  const scheduleBuffer = useCallback(
    (buffer: AudioBuffer) => {
      const ctx = getAudioContext();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      // Reset time if we lagged behind (clipping fix)
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime + 0.05;
      }

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;

      activeSourcesRef.current.push(source);
      isAIPlayingRef.current = true;
      setStatus("speaking");

      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter(
          (s) => s !== source
        );
        if (activeSourcesRef.current.length === 0) {
          isAIPlayingRef.current = false;
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            setStatus("connected");
          }
        }
      };
    },
    [getAudioContext]
  );

  // --- 5. Queue Processor (With PCM Fallback) ---
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || processingQueueRef.current.length === 0)
      return;

    isProcessingRef.current = true;
    const ctx = getAudioContext();

    try {
      const base64Data = processingQueueRef.current.shift();
      if (!base64Data) return;

      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Try Standard Decode (WAV/MP3)
      try {
        // We copy the buffer because decodeAudioData detaches it
        const bufferCopy = bytes.buffer.slice(0);
        const audioBuffer = await ctx.decodeAudioData(bufferCopy);
        scheduleBuffer(audioBuffer);
      } catch (decodeError) {
        // console.warn("Standard decode failed, trying Raw PCM fallback...", decodeError);

        // --- FALLBACK: RAW PCM DECODING ---
        // If decodeAudioData fails, the backend sent raw samples (Int16) without headers.
        try {
          // 1. Convert Uint8Array -> Int16Array
          // Handle potential alignment issues
          const int16Data = new Int16Array(
            bytes.buffer,
            bytes.byteOffset,
            bytes.byteLength / 2
          );

          // 2. Convert Int16 -> Float32 (Range -1.0 to 1.0)
          const float32Data = new Float32Array(int16Data.length);
          for (let i = 0; i < int16Data.length; i++) {
            float32Data[i] = int16Data[i] / 32768.0;
          }

          // 3. Create AudioBuffer manually
          // Note: Most WS backends send 16000Hz or 24000Hz.
          // If voices sound slow/deep, increase this number. If chipmunk, decrease it.
          const pcmBuffer = ctx.createBuffer(1, float32Data.length, 16000);
          pcmBuffer.getChannelData(0).set(float32Data);

          scheduleBuffer(pcmBuffer);
        } catch (pcmError) {
          console.error("Critical: Failed to decode audio data", pcmError);
        }
      }
    } catch (err) {
      console.error("Error processing audio queue", err);
    } finally {
      isProcessingRef.current = false;
      if (processingQueueRef.current.length > 0) {
        processQueue(); // Process next chunk
      }
    }
  }, [getAudioContext, scheduleBuffer]);

  const handleIncomingAudio = useCallback(
    (base64Data: string) => {
      if (isUserSpeaking) return; // Don't queue if interrupting
      processingQueueRef.current.push(base64Data);
      processQueue();
    },
    [isUserSpeaking, processQueue]
  );

  // --- 6. Mic & VAD ---
  const startMicStreaming = (
    ctx: AudioContext,
    stream: MediaStream,
    ws: WebSocket
  ) => {
    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    inputProcessorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;

      const inputData = e.inputBuffer.getChannelData(0);

      // Calculate RMS
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);

      if (rms > 0.1) {
        setIsUserSpeaking(true);
        if (isAIPlayingRef.current && rms > 0.15) {
          console.log("Interruption Triggered");
          stopAudioAndClearQueue();
        }
      } else {
        setIsUserSpeaking(false);
      }

      const downsampled = downsampleBuffer(inputData, ctx.sampleRate, 16000);
      const base64 = convertFloat32ToInt16Base64(downsampled);
      if (base64) ws.send(JSON.stringify({ user_audio_chunk: base64 }));
    };

    source.connect(processor);
    const muteNode = ctx.createGain();
    muteNode.gain.value = 0;
    processor.connect(muteNode);
    muteNode.connect(ctx.destination);
  };

  const { refetch: fetchAuth } = useStartConversation(token!, {
    enabled: false,
  });

  // --- 7. Connect ---
  const connect = async () => {
    if (!token) return;
    setStatus("connecting");

    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") await ctx.resume();

      const { data: authData } = await fetchAuth();
      if (!authData) throw new Error("Failed to get auth data");
      const { signed_url } = authData as any;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const ws = new WebSocket(signed_url);
      wsRef.current = ws;

      ws.onopen = () => {
        addLog("Connected", "success");
        setStatus("connected");
        ws.send(
          JSON.stringify({ type: "conversation_initiation_client_data" })
        );
        startMicStreaming(ctx, stream, ws);
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "audio" && data.audio_event?.audio_base_64) {
          handleIncomingAudio(data.audio_event.audio_base_64);
        } else if (data.type === "agent_response") {
          addLog(`${data.agent_response_event?.agent_response}`, "agent");
        } else if (data.type === "user_transcript") {
          addLog(`${data.user_transcription_event?.user_transcript}`, "user");
          stopAudioAndClearQueue();
        }
      };

      ws.onerror = (e) => {
        console.error(e);
        addLog("Connection Error", "error");
        disconnect(); // Disconnect is now defined above!
      };

      ws.onclose = () => {
        disconnect();
      };
    } catch (err: any) {
      console.error(err);
      addLog("Connection Failed", "error");
      setStatus("error");
      setIsConnected(false);
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
  if (!context)
    throw new Error(
      "useVoiceSession must be used within a VoiceSessionProvider"
    );
  return context;
}
