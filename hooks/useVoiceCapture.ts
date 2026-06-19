"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export interface VoiceCaptureState {
  isListening: boolean;
  interimTranscript: string;
  speechStatus: string;
  lastError: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
}

// Check if we're in a browser with MediaRecorder support
function hasMediaRecorder(): boolean {
  return typeof window !== "undefined" && "MediaRecorder" in window;
}

export function useVoiceCapture(
  onFinalResult: (text: string) => void
): VoiceCaptureState {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [speechStatus, setSpeechStatus] = useState("idle");
  const [lastError, setLastError] = useState("");
  const [isSupported, setIsSupported] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const onFinalRef = useRef(onFinalResult);
  onFinalRef.current = onFinalResult;

  // Silence detection refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    // Check support
    if (!hasMediaRecorder()) {
      setIsSupported(false);
      setSpeechStatus("no soportado");
      return;
    }

    // Electron check - hide voice in desktop for now
    const inDesktop = (window as unknown as { capturia?: { isDesktop?: boolean } })
      .capturia?.isDesktop === true;
    if (inDesktop) {
      setIsSupported(false);
      setSpeechStatus("no soportado");
      return;
    }

    setIsSupported(true);

    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
      }
    };
  }, []);

  const sendToWhisper = useCallback(async (audioBlob: Blob) => {
    setSpeechStatus("transcribiendo…");
    setInterimTranscript("");

    try {
      const formData = new FormData();
      // Whisper works best with webm or mp3
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/whisper", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Transcription failed");
      }

      const data = await response.json();
      const text = data.text?.trim();

      if (text) {
        setSpeechStatus("enviado ✓");
        onFinalRef.current(text);
      } else {
        setSpeechStatus("sin audio detectado");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      setLastError(message);
      setSpeechStatus(`error: ${message}`);
    }
  }, []);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsListening(false);
  }, []);

  const checkSilence = useCallback(() => {
    if (!analyserRef.current || !isRecordingRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(dataArray);

    // Calculate RMS (root mean square) for volume level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const volume = Math.min(1, rms * 10); // Normalize to 0-1

    // Show volume indicator in interim transcript
    const bars = Math.round(volume * 10);
    setInterimTranscript("█".repeat(bars) + "░".repeat(10 - bars));

    // Silence threshold - more aggressive detection
    const SILENCE_THRESHOLD = 0.03; // Higher = more sensitive to silence
    const SILENCE_DURATION = 800; // 0.8 seconds of silence to stop (was 1.5s)

    if (volume < SILENCE_THRESHOLD) {
      // Show that we're detecting silence
      setInterimTranscript("░░░░░░░░░░ silencio...");
      if (!silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          if (isRecordingRef.current) {
            setSpeechStatus("enviando…");
            stopRecording();
          }
        }, SILENCE_DURATION);
      }
    } else {
      // Reset silence timer if sound detected
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }

    // Continue checking while recording
    if (isRecordingRef.current) {
      requestAnimationFrame(checkSilence);
    }
  }, [stopRecording]);

  const startRecording = useCallback(async () => {
    try {
      setSpeechStatus("solicitando micrófono…");
      setLastError("");
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Whisper prefers 16kHz
        },
      });
      streamRef.current = stream;

      // Set up audio analysis for silence detection
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > 0) {
          sendToWhisper(audioBlob);
        } else {
          setSpeechStatus("sin audio grabado");
        }
      };

      mediaRecorder.onerror = (event) => {
        setLastError("Error de grabación");
        setSpeechStatus("error de grabación");
        stopRecording();
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      isRecordingRef.current = true;
      setIsListening(true);
      setSpeechStatus("escuchando… (pausa para enviar)");

      // Start silence detection
      checkSilence();

      // Max recording duration fallback (15 seconds)
      maxDurationTimerRef.current = setTimeout(() => {
        if (isRecordingRef.current) {
          setSpeechStatus("tiempo máximo alcanzado…");
          stopRecording();
        }
      }, 15000);

    } catch (error) {
      const message = error instanceof Error ? error.message : "Error de micrófono";
      setLastError(message);
      setSpeechStatus(`error: ${message}`);
      setIsListening(false);
    }
  }, [sendToWhisper, stopRecording, checkSilence]);

  const startListening = useCallback(() => {
    if (!isListening) {
      startRecording();
    }
  }, [isListening, startRecording]);

  const stopListening = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  return {
    isListening,
    interimTranscript,
    speechStatus,
    lastError,
    isSupported,
    startListening,
    stopListening,
  };
}
