"use client";
import { useNumberTween } from "@/hooks/useNumberTween";

interface Props {
  progress: number;
  label?: string;
  indeterminate?: boolean;
}

export default function ProgressBar({ progress, label, indeterminate }: Props) {
  const target = Math.max(0, Math.min(100, progress));
  const tweened = useNumberTween(target, 700);
  const displayPct = Math.round(tweened);
  const isComplete = !indeterminate && target >= 100;

  return (
    <div className="bg-black/70 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3 w-full border-breathe">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/70 text-sm font-mono">{label}</span>
          <span className="text-white font-bold tabular-nums">
            {indeterminate ? "…" : `${displayPct}%`}
          </span>
        </div>
      )}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        {indeterminate ? (
          <div
            className="h-full stripe-march rounded-full"
            style={{
              width: "100%",
              backgroundImage:
                "repeating-linear-gradient(45deg, #38bdf8 0 8px, rgba(56,189,248,0.25) 8px 16px)",
              backgroundSize: "24px 24px",
              boxShadow: "0 0 8px #38bdf8",
            }}
          />
        ) : (
          <div
            className={`h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-[width] duration-700 ease-out shadow-[0_0_8px_#38bdf8] ${
              isComplete ? "progress-pulse" : ""
            }`}
            style={{ width: `${tweened}%` }}
          />
        )}
      </div>
    </div>
  );
}
