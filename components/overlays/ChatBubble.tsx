"use client";
import { useTypewriter } from "@/hooks/useTypewriter";

interface Props {
  text: string;
  author?: string;
}

export default function ChatBubble({ text, author }: Props) {
  const typed = useTypewriter(text, 26);
  const isTyping = typed.length < text.length;
  return (
    <div className="max-w-xs">
      <div className="relative bg-black/75 backdrop-blur-md border border-white/20 rounded-2xl rounded-bl-sm px-4 py-3 border-breathe">
        {author && (
          <p className="text-blue-300 text-xs font-bold mb-1 uppercase tracking-wide">{author}</p>
        )}
        <p className="text-white text-sm leading-snug">
          {typed}
          {isTyping && <span className="inline-block w-[1px] h-3 bg-white/80 ml-0.5 align-middle animate-pulse" />}
        </p>
        {/* bubble tail */}
        <div className="absolute -bottom-2 left-4 w-4 h-4 bg-black/75 border-r border-b border-white/20 rotate-45 rounded-br-sm" />
      </div>
    </div>
  );
}
