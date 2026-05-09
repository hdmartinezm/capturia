"use client";

interface Props {
  label?: string;
  color?: string;
}

export default function LiveBadge({ label = "LIVE", color = "#ef4444" }: Props) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-md backdrop-blur-md"
      style={{
        backgroundColor: `${color}f0`,
        boxShadow: `0 0 16px ${color}80`,
      }}
    >
      <span
        className="w-2 h-2 rounded-full bg-white live-dot-pulse"
        style={{ boxShadow: "0 0 6px white" }}
      />
      <span className="text-white text-xs font-bold tracking-[0.25em] uppercase">{label}</span>
    </div>
  );
}
