"use client";
import { useState, useRef } from "react";
import { useCopilotChat } from "@copilotkit/react-core";
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";
import { useMicLevel } from "@/hooks/useMicLevel";

interface Props {
  overlays: { id: string; type: string }[];
  onClear: () => void;
  isListening: boolean;
  onToggleVoice: () => void;
  isVoiceSupported: boolean;
}

export default function CommandBar({
  overlays,
  onClear,
  isListening,
  onToggleVoice,
  isVoiceSupported,
}: Props) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { appendMessage, isLoading: chatLoading } = useCopilotChat();
  // AudioContext only when NOT listening — running both simultaneously
  // causes the Speech Recognition service to lose the audio stream and restart.
  const micLevels = useMicLevel(!isListening);

  const busy = isLoading || chatLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd || busy) return;
    setInput("");
    setIsLoading(true);
    try {
      await appendMessage(
        new TextMessage({ content: cmd, role: MessageRole.User })
      );
    } finally {
      setIsLoading(false);
    }
    inputRef.current?.focus();
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-black/75 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2.5 shadow-[0_0_40px_rgba(0,0,0,0.6)]"
      >
        {/* Active overlays indicator */}
        {overlays.length > 0 && (
          <div className="flex gap-1.5 items-center shrink-0">
            {overlays.slice(0, 4).map((o) => (
              <span
                key={o.id}
                className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full font-mono"
              >
                {o.type.replace(/([A-Z])/g, " $1").trim().split(" ")[0]}
              </span>
            ))}
            {overlays.length > 4 && (
              <span className="text-[10px] text-white/40 font-mono">
                +{overlays.length - 4}
              </span>
            )}
            <div className="w-px h-4 bg-white/20 mx-1" />
          </div>
        )}

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isListening
              ? "Listening to your voice…"
              : busy
              ? "Agent thinking..."
              : 'Try: "Add a lower third with my name" or "Remove all"'
          }
          disabled={busy}
          className="flex-1 bg-transparent text-white placeholder:text-white/30 text-sm outline-none font-mono"
          autoFocus
        />

        {overlays.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-white/30 hover:text-white/70 text-xs font-mono transition-colors shrink-0"
          >
            clear
          </button>
        )}

        {/* Voice toggle */}
        {isVoiceSupported && (
          <button
            type="button"
            onClick={onToggleVoice}
            title={isListening ? "Stop listening" : "Start voice mode"}
            className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isListening
                ? "bg-green-500/20 text-green-400 border border-green-500/40"
                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 border border-white/10"
            }`}
          >
            {isListening ? (
              // CSS-animated bars while listening (no AudioContext — avoids Speech API conflict)
              <div className="flex items-end justify-center gap-px w-full h-full py-1.5">
                {[14, 8, 18, 10].map((max, i) => (
                  <div
                    key={i}
                    className="w-[3px] bg-green-400 rounded-full"
                    style={{
                      height: `${max}px`,
                      animation: `voice-bar ${0.7 + i * 0.13}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
              </svg>
            )}
          </button>
        )}

        {/* Send */}
        <button
          type="submit"
          disabled={!input.trim() || busy}
          className="shrink-0 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-1.5 rounded-xl transition-colors"
        >
          {busy ? (
            <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            "→"
          )}
        </button>
      </form>
    </div>
  );
}
