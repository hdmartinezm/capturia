"use client";

interface Props {
  items: string[];
  accent?: string;
}

const PALETTE = ["#67e8f9", "#c084fc", "#f472b6", "#fbbf24", "#34d399"];

export default function Ticker({ items, accent }: Props) {
  const safeItems = Array.isArray(items) ? items.filter((s) => typeof s === "string") : [];
  if (safeItems.length === 0) return null;
  // Duplicate items so the marquee can scroll seamlessly via -50% transform
  const sequence = [...safeItems, ...safeItems];
  return (
    <div className="relative w-full overflow-hidden bg-black/85 backdrop-blur-md border-y border-white/15 py-2 border-breathe">
      {/* Subtle breathing background sheen */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(192,132,252,0.18) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "hue-cycle 7s linear infinite",
        }}
      />
      <div
        className="ticker-scroll flex shrink-0 whitespace-nowrap relative"
        style={{ width: "max-content" }}
      >
        {sequence.map((item, i) => {
          const dotColor = accent ?? PALETTE[i % PALETTE.length];
          return (
            <span
              key={i}
              className="flex items-center gap-3 mx-6 text-white/90 text-sm font-mono tracking-wide"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: dotColor, boxShadow: `0 0 8px ${dotColor}` }}
              />
              {item}
            </span>
          );
        })}
      </div>
      {/* Edge fades */}
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/85 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/85 to-transparent pointer-events-none" />
    </div>
  );
}
