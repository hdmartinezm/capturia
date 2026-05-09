"use client";
import { useEffect, useState } from "react";
import { useTypewriter } from "@/hooks/useTypewriter";

interface Props {
  text: string;
  author?: string;
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #67e8f9 0%, #c084fc 100%)",
  "linear-gradient(135deg, #f472b6 0%, #fbbf24 100%)",
  "linear-gradient(135deg, #34d399 0%, #67e8f9 100%)",
  "linear-gradient(135deg, #c084fc 0%, #f472b6 100%)",
  "linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)",
];

const TYPING_DELAY_MS = 550;

export default function ChatBubble({ text, author }: Props) {
  const [showTyping, setShowTyping] = useState(true);
  useEffect(() => {
    setShowTyping(true);
    const t = setTimeout(() => setShowTyping(false), TYPING_DELAY_MS);
    return () => clearTimeout(t);
  }, [text]);

  const typed = useTypewriter(showTyping ? "" : text, 26);
  const isTyping = !showTyping && typed.length < text.length;
  const initial = (author?.[0] ?? "•").toUpperCase();
  const gradient = AVATAR_GRADIENTS[hashIndex(author ?? text) % AVATAR_GRADIENTS.length];

  return (
    <div className="flex items-end gap-2 max-w-xs">
      <div
        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
        style={{ background: gradient, boxShadow: "0 0 12px rgba(192, 132, 252, 0.4)" }}
      >
        {initial}
      </div>
      <div className="relative bg-black/75 backdrop-blur-md border border-white/20 rounded-2xl rounded-bl-sm px-4 py-3 border-breathe">
        {author && (
          <p
            className="text-xs font-bold mb-1 uppercase tracking-wide gradient-text"
            style={{ "--g-from": "#67e8f9", "--g-to": "#c084fc" } as React.CSSProperties}
          >
            {author}
          </p>
        )}
        {showTyping ? (
          <div className="flex items-center gap-1 py-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/70 typing-dot"
                style={{ animationDelay: `${i * 160}ms` }}
              />
            ))}
          </div>
        ) : (
          <p className="text-white text-sm leading-snug">
            {typed}
            {isTyping && (
              <span className="inline-block w-[1px] h-3 bg-white/80 ml-0.5 align-middle animate-pulse" />
            )}
          </p>
        )}
        {/* bubble tail */}
        <div className="absolute -bottom-2 left-4 w-4 h-4 bg-black/75 border-r border-b border-white/20 rotate-45 rounded-br-sm" />
      </div>
    </div>
  );
}

function hashIndex(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
