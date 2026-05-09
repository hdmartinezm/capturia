"use client";
import type { CSSProperties } from "react";

type Keyword = string | { text?: string; label?: string; word?: string; value?: string };

interface Props {
  keywords: Keyword[];
  color: string;
}

const PALETTE = ["#67e8f9", "#c084fc", "#f472b6", "#fbbf24", "#34d399", "#fb7185"];

function toText(kw: Keyword): string {
  if (typeof kw === "string") return kw;
  return kw.text ?? kw.label ?? kw.word ?? kw.value ?? String(kw);
}

function isAutoColor(c: string): boolean {
  const v = c?.toLowerCase().trim();
  return !v || v === "auto" || v === "rainbow" || v === "palette" || v === "mixed";
}

export default function KeywordHighlight({ keywords, color }: Props) {
  const auto = isAutoColor(color);
  const safeKeywords = Array.isArray(keywords) ? keywords : [];
  if (safeKeywords.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {safeKeywords.map((kw, i) => {
        const chipColor = auto ? PALETTE[i % PALETTE.length] : color;
        return (
          <span
            key={`${toText(kw)}-${i}`}
            className="overlay-enter-scale relative overflow-hidden px-3 py-1 rounded-full text-sm font-bold uppercase tracking-widest border"
            style={
              {
                color: chipColor,
                borderColor: chipColor,
                boxShadow: `0 0 12px ${chipColor}80, inset 0 0 8px ${chipColor}20`,
                backgroundColor: `${chipColor}15`,
                animationDelay: `${i * 70}ms`,
                "--shimmer-color": `${chipColor}55`,
              } as CSSProperties & { "--shimmer-color": string }
            }
          >
            <span
              aria-hidden
              className="kw-shimmer absolute inset-0 rounded-full"
              style={{ animationDelay: `${i * 70 + 1200}ms` }}
            />
            <span
              className="relative inline-block idle-bob"
              style={{ animationDelay: `${800 + i * 230}ms` }}
            >
              {toText(kw)}
            </span>
          </span>
        );
      })}
    </div>
  );
}
