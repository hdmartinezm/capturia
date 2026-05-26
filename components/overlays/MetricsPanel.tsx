"use client";
import { useEffect, useRef, useState } from "react";
import type { MetricRow } from "@/lib/types";
import { useNumberTween, parseNumeric, formatLikeOriginal } from "@/hooks/useNumberTween";

interface Props {
  title: string;
  metrics: MetricRow[];
}

const HISTORY_CAP = 6;

export default function MetricsPanel({ title, metrics }: Props) {
  // Agent props are untrusted at runtime. Guard against missing/non-array metrics
  // before any iteration. Filter to objects with at least a label.
  const safeMetrics: MetricRow[] = Array.isArray(metrics)
    ? metrics
        .filter((m): m is MetricRow => !!m && typeof m === "object" && typeof m.label === "string")
        .map((m) => ({
          label: m.label,
          value: typeof m.value === "string" ? m.value : String(m.value ?? ""),
          delta: m.delta == null ? undefined : typeof m.delta === "string" ? m.delta : String(m.delta),
        }))
    : [];
  const history = useMetricHistory(safeMetrics);
  return (
    <div className="bg-black/70 backdrop-blur-md border border-white/20 rounded-xl p-4 min-w-[240px] border-breathe">
      <div className="mb-3">
        <p className="text-white/60 text-xs uppercase tracking-widest font-mono">{title}</p>
        <div className="mt-1 h-px hue-cycle rounded-full" />
      </div>
      <div className="space-y-2">
        {safeMetrics.map((m, i) => (
          <MetricLine key={`${m.label}-${i}`} metric={m} history={history[m.label] ?? []} />
        ))}
      </div>
    </div>
  );
}

function MetricLine({ metric, history }: { metric: MetricRow; history: number[] }) {
  const flashClass = useFlashOnChange(metric.value, metric.delta);
  const direction =
    metric.delta?.startsWith("+") ? "up" : metric.delta?.startsWith("-") ? "down" : null;
  return (
    <div className={`flex items-center justify-between gap-3 rounded-md px-1 -mx-1 ${flashClass}`}>
      <span className="text-white/70 text-sm shrink-0">{metric.label}</span>
      <div className="flex items-center gap-2">
        {history.length >= 2 && <Sparkline values={history} direction={direction} />}
        <AnimatedValue raw={metric.value} />
        {metric.delta && (
          <span
            className={`flex items-center gap-0.5 text-xs font-mono ${
              direction === "up" ? "text-emerald-400" : direction === "down" ? "text-rose-400" : "text-white/60"
            }`}
          >
            {direction === "up" && <span className="arrow-bounce-up">▲</span>}
            {direction === "down" && <span className="arrow-bounce-down">▼</span>}
            <span>{metric.delta}</span>
          </span>
        )}
      </div>
    </div>
  );
}

function Sparkline({ values, direction }: { values: number[]; direction: "up" | "down" | null }) {
  const W = 40;
  const H = 14;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const stroke = direction === "down" ? "#fb7185" : direction === "up" ? "#34d399" : "#60a5fa";
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - ((v - min) / range) * H;
      return `${x},${y}`;
    })
    .join(" ");
  const last = values[values.length - 1];
  const lastX = W;
  const lastY = H - ((last - min) / range) * H;
  return (
    <svg width={W} height={H} className="overflow-visible opacity-90">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 3px ${stroke})` }}
      />
      <circle cx={lastX} cy={lastY} r="2" fill={stroke} style={{ filter: `drop-shadow(0 0 3px ${stroke})` }} />
    </svg>
  );
}

function AnimatedValue({ raw }: { raw: string }) {
  const parsed = parseNumeric(raw);
  if (!parsed) return <span className="text-white font-semibold tabular-nums">{raw}</span>;
  return <TweenedNumber raw={raw} />;
}

function TweenedNumber({ raw }: { raw: string }) {
  const parsed = parseNumeric(raw)!;
  const tweened = useNumberTween(parsed.num, 700);
  return (
    <span className="text-white font-semibold tabular-nums">
      {parsed.prefix}
      {formatLikeOriginal(tweened, raw.replace(parsed.prefix, "").replace(parsed.suffix, ""))}
      {parsed.suffix}
    </span>
  );
}

/** Tracks the last HISTORY_CAP numeric values per label for sparkline rendering. */
function useMetricHistory(metrics: MetricRow[]): Record<string, number[]> {
  const [history, setHistory] = useState<Record<string, number[]>>(() => {
    const init: Record<string, number[]> = {};
    metrics.forEach((m) => {
      const n = parseNumeric(m.value)?.num;
      if (n != null) init[m.label] = [n];
    });
    return init;
  });
  useEffect(() => {
    setHistory((prev) => {
      let changed = false;
      const next = { ...prev };
      metrics.forEach((m) => {
        const num = parseNumeric(m.value)?.num;
        if (num == null) return;
        const arr = next[m.label] ?? [];
        if (arr[arr.length - 1] !== num) {
          next[m.label] = [...arr, num].slice(-HISTORY_CAP);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [metrics]);
  return history;
}

function useFlashOnChange(value: string, delta?: string): string {
  const [flash, setFlash] = useState<"" | "delta-flash-up" | "delta-flash-down">("");
  const prevValueRef = useRef(value);
  const prevDeltaRef = useRef(delta);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevValueRef.current = value;
      prevDeltaRef.current = delta;
      return;
    }
    const valueChanged = prevValueRef.current !== value;
    const deltaChanged = prevDeltaRef.current !== delta;
    if (valueChanged || deltaChanged) {
      const direction = inferDirection(prevValueRef.current, value, delta);
      setFlash(direction === "up" ? "delta-flash-up" : direction === "down" ? "delta-flash-down" : "");
      prevValueRef.current = value;
      prevDeltaRef.current = delta;
      const timeout = setTimeout(() => setFlash(""), 750);
      return () => clearTimeout(timeout);
    }
  }, [value, delta]);

  return flash;
}

function inferDirection(prev: string, next: string, delta?: string): "up" | "down" | null {
  if (delta?.startsWith("+")) return "up";
  if (delta?.startsWith("-")) return "down";
  const prevNum = parseNumeric(prev)?.num;
  const nextNum = parseNumeric(next)?.num;
  if (prevNum != null && nextNum != null) {
    if (nextNum > prevNum) return "up";
    if (nextNum < prevNum) return "down";
  }
  return null;
}
