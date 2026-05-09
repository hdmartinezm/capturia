"use client";
import { useEffect, useRef, useState } from "react";

const BAR_COUNT = 4;

// Returns an array of BAR_COUNT values (0–1) representing mic energy per frequency band.
// Uses a separate getUserMedia stream from the SpeechRecognition one — browsers allow
// multiple simultaneous consumers of the same mic.
export function useMicLevel(isActive: boolean): number[] {
  const [levels, setLevels] = useState<number[]>(new Array(BAR_COUNT).fill(0));
  const rafRef = useRef<number>(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isActive) {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      ctxRef.current?.close();
      streamRef.current = null;
      ctxRef.current = null;
      setLevels(new Array(BAR_COUNT).fill(0));
      return;
    }

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const audioCtx = new AudioContext();
        ctxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256; // 128 frequency bins
        analyser.smoothingTimeConstant = 0.6;
        source.connect(analyser);

        const freqData = new Uint8Array(analyser.frequencyBinCount);
        const groupSize = Math.floor(40 / BAR_COUNT); // use first 40 bins (~0–5 kHz, voice range)

        const tick = () => {
          if (cancelled) return;
          analyser.getByteFrequencyData(freqData);
          setLevels(
            Array.from({ length: BAR_COUNT }, (_, i) => {
              let sum = 0;
              const start = 1 + i * groupSize;
              for (let j = start; j < start + groupSize; j++) sum += freqData[j];
              // 200 ≈ typical speech amplitude — clamp to 0–1
              return Math.min(1, sum / groupSize / 200);
            })
          );
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      })
      .catch(() => {
        /* mic denied or unavailable — levels stay at 0 */
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      ctxRef.current?.close();
      streamRef.current = null;
      ctxRef.current = null;
    };
  }, [isActive]);

  return levels;
}
