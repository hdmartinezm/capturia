"use client";
import { useId } from "react";
import { useNumberArrayTween } from "@/hooks/useNumberTween";

interface Props {
  data: number[];
  chartType: "line" | "bar";
  label: string;
}

export default function FloatingChart({ data, chartType, label }: Props) {
  const safeData = Array.isArray(data) ? data.filter((n) => typeof n === "number" && Number.isFinite(n)) : [];
  const tweened = useNumberArrayTween(safeData, 600);
  const max = Math.max(...safeData, 1);
  const W = 160;
  const H = 56;
  const gradId = useId();

  const points = tweened.map((v, i) => {
    const x = tweened.length === 1 ? W / 2 : (i / (tweened.length - 1)) * W;
    const y = H - (v / max) * H;
    return { x, y, v };
  });
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? `M${points[0].x},${H} L${points.map((p) => `${p.x},${p.y}`).join(" L")} L${
          points[points.length - 1].x
        },${H} Z`
      : "";
  const last = points[points.length - 1];
  const lastValue = tweened[tweened.length - 1] ?? 0;

  return (
    <div className="bg-black/70 backdrop-blur-md border border-white/20 rounded-xl p-3 min-w-[200px] border-breathe">
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-white/50 text-xs font-mono uppercase tracking-wider">{label}</p>
        <p className="text-cyan-300 text-sm font-bold tabular-nums">
          {Math.round(lastValue).toLocaleString()}
        </p>
      </div>
      {chartType === "bar" ? (
        <div className="flex items-end gap-1 h-14">
          {tweened.map((v, i) => {
            const isLast = i === tweened.length - 1;
            return (
              <div key={i} className="relative flex-1 h-full">
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-t-sm transition-transform duration-500 ease-out origin-bottom"
                  style={{
                    height: "100%",
                    transform: `scaleY(${Math.max(0.001, v / max)})`,
                    background: "linear-gradient(180deg, #c084fc 0%, #38bdf8 100%)",
                    boxShadow: isLast ? "0 0 10px #c084fc" : "0 0 4px rgba(56,189,248,0.4)",
                  }}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <svg width={W} height={H} className="overflow-visible">
          <defs>
            <linearGradient id={`${gradId}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${gradId}-line`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          {points.length >= 2 && (
            <path d={areaPath} fill={`url(#${CSS.escape(gradId)}-area)`} />
          )}
          <polyline
            points={polyline}
            fill="none"
            stroke={`url(#${CSS.escape(gradId)}-line)`}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 4px #c084fc)" }}
          />
          {last && (
            <circle
              cx={last.x}
              cy={last.y}
              r="3"
              fill="white"
              style={{ filter: "drop-shadow(0 0 6px #c084fc)" }}
            />
          )}
        </svg>
      )}
    </div>
  );
}
