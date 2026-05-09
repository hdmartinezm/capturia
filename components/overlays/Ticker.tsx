"use client";

interface Props {
  items: string[];
  accent?: string;
}

export default function Ticker({ items, accent = "#38bdf8" }: Props) {
  if (items.length === 0) return null;
  // Duplicate items so the marquee can scroll seamlessly via -50% transform
  const sequence = [...items, ...items];
  return (
    <div className="relative w-full overflow-hidden bg-black/85 backdrop-blur-md border-y border-white/15 py-2 border-breathe">
      <div className="ticker-scroll flex shrink-0 whitespace-nowrap" style={{ width: "max-content" }}>
        {sequence.map((item, i) => (
          <span key={i} className="flex items-center gap-3 mx-6 text-white/90 text-sm font-mono tracking-wide">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
            />
            {item}
          </span>
        ))}
      </div>
      {/* Edge fades */}
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/85 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/85 to-transparent pointer-events-none" />
    </div>
  );
}
