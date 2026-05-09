"use client";
import type { CSSProperties } from "react";

type Keyword = string | { text?: string; label?: string; word?: string; value?: string };

interface Props {
  keywords: Keyword[];
  color: string;
}

function toText(kw: Keyword): string {
  if (typeof kw === "string") return kw;
  return kw.text ?? kw.label ?? kw.word ?? kw.value ?? String(kw);
}

export default function KeywordHighlight({ keywords, color }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((kw, i) => (
        <span
          key={`${toText(kw)}-${i}`}
          className="overlay-enter-scale relative overflow-hidden px-3 py-1 rounded-full text-sm font-bold uppercase tracking-widest border"
          style={
            {
              color,
              borderColor: color,
              boxShadow: `0 0 12px ${color}80, inset 0 0 8px ${color}20`,
              backgroundColor: `${color}15`,
              animationDelay: `${i * 70}ms`,
              "--shimmer-color": `${color}55`,
            } as CSSProperties & { "--shimmer-color": string }
          }
        >
          <span
            aria-hidden
            className="kw-shimmer absolute inset-0 rounded-full"
            style={{ animationDelay: `${i * 70 + 1200}ms` }}
          />
          <span className="relative">{toText(kw)}</span>
        </span>
      ))}
    </div>
  );
}
