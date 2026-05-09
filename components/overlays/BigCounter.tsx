"use client";
import { useNumberTween } from "@/hooks/useNumberTween";

interface Props {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  color?: string;
}

export default function BigCounter({ value, label, prefix = "", suffix = "", color = "#ffffff" }: Props) {
  const tweened = useNumberTween(value, 900);
  const display = formatNumber(tweened);
  return (
    <div className="bg-black/70 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4 border-breathe">
      <p className="text-white/50 text-[10px] uppercase tracking-[0.25em] font-mono mb-1">{label}</p>
      <p
        className="font-bold tabular-nums text-5xl leading-none"
        style={{
          color,
          textShadow: `0 0 20px ${color}80`,
        }}
      >
        {prefix}
        {display}
        {suffix}
      </p>
    </div>
  );
}

function formatNumber(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (Math.abs(n) >= 10_000) return (n / 1_000).toFixed(1) + "K";
  if (Number.isInteger(n)) return Math.round(n).toLocaleString();
  return n.toFixed(0);
}
