"use client";
import { useNumberTween } from "@/hooks/useNumberTween";

interface Props {
  value: number;
  label: string;
  color?: string;
  size?: number;
}

export default function StatRing({ value, label, color = "#38bdf8", size = 84 }: Props) {
  const target = Math.max(0, Math.min(100, value));
  const tweened = useNumberTween(target, 800);
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (tweened / 100) * c;

  return (
    <div className="bg-black/70 backdrop-blur-md border border-white/20 rounded-xl p-3 flex items-center gap-3 border-breathe">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{
              filter: `drop-shadow(0 0 6px ${color})`,
              transition: "stroke-dashoffset 80ms linear",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-lg tabular-nums">{Math.round(tweened)}%</span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-white/50 text-[10px] uppercase tracking-widest font-mono">Stat</span>
        <span className="text-white text-sm font-medium leading-tight">{label}</span>
      </div>
    </div>
  );
}
