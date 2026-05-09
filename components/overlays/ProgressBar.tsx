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
          <span
            className={`tabular-nums font-bold text-sm px-2 py-0.5 rounded-md transition-all ${
              isComplete
                ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40 progress-pulse"
                : "text-white/90"
            }`}
          >
            {indeterminate ? "…" : `${displayPct}%`}
          </span>
        </div>
      )}
      <div className="relative h-2.5 bg-white/10 rounded-full overflow-hidden">
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
          <>
            <div
              className="h-full hue-cycle rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${tweened}%`,
                boxShadow: "0 0 12px rgba(167, 139, 250, 0.55)",
              }}
            />
            {/* Glowing leading bead */}
            {tweened > 1 && tweened < 100 && (
              <span
                className="absolute top-1/2 w-3 h-3 rounded-full bg-white pointer-events-none"
                style={{
                  left: `${tweened}%`,
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 0 10px white, 0 0 20px #c084fc, 0 0 4px white inset",
                  transition: "left 700ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
