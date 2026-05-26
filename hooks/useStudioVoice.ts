"use client";
import { useVoiceCapture, type VoiceCaptureState } from "./useVoiceCapture";
import { useDesktopVoiceCapture } from "./useDesktopVoiceCapture";

// Voice-capture façade for the studio. Picks the correct backend based on
// whether we're in the Electron renderer:
//   - Desktop (window.capturia exists): local whisper.cpp via IPC
//   - Web browser: Web Speech API (Chrome/Edge only)
//
// Both hooks are called unconditionally to satisfy Rules of Hooks. The unused
// one is inert (its isSupported flips to false, startListening is never
// invoked through the studio because we return the other hook's state).
export function useStudioVoice(
  onFinalResult: (text: string) => void
): VoiceCaptureState {
  const web = useVoiceCapture(onFinalResult);
  const desktop = useDesktopVoiceCapture(onFinalResult);

  const isDesktop =
    typeof window !== "undefined" && window.capturia?.isDesktop === true;

  return isDesktop ? desktop : web;
}
