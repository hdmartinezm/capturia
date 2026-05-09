"use client";
import { useEffect, useRef, useState } from "react";

interface Step {
  label: string;
}

interface Props {
  steps: Step[];
  currentStep: number;
}

export default function Timeline({ steps, currentStep }: Props) {
  const safeSteps = Array.isArray(steps) ? steps.filter((s) => s && typeof s.label === "string") : [];
  const safeCurrent = typeof currentStep === "number" ? currentStep : 0;
  const popKey = usePopKey(safeCurrent);
  if (safeSteps.length === 0) return null;
  return (
    <div className="bg-black/70 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3 border-breathe">
      <div className="flex items-center gap-0">
        {safeSteps.map((step, i) => {
          const active = i === safeCurrent;
          const done = i < safeCurrent;
          return (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="relative">
                  {/* Active halo ring */}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-full ring-ripple"
                      style={{
                        boxShadow: "0 0 0 2px #c084fc",
                      }}
                    />
                  )}
                  <div
                    key={active ? `active-${popKey}` : `dot-${i}`}
                    className={`relative w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300 ${
                      active
                        ? "text-white step-pop border-transparent"
                        : done
                        ? "bg-emerald-400/25 border-emerald-400/60 text-white"
                        : "bg-transparent border-white/20 text-white/30"
                    }`}
                    style={
                      active
                        ? {
                            background: "linear-gradient(135deg, #67e8f9 0%, #c084fc 50%, #f472b6 100%)",
                            boxShadow: "0 0 16px #c084fc, 0 0 4px white inset",
                          }
                        : undefined
                    }
                  >
                    {done ? "✓" : i + 1}
                  </div>
                </div>
                <span
                  className={`mt-1.5 text-xs max-w-[72px] text-center leading-tight transition-colors duration-300 ${
                    active ? "text-white font-medium" : done ? "text-emerald-300/80" : "text-white/30"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < safeSteps.length - 1 && (
                <div className="w-8 h-[2px] mt-[-12px] mx-1 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${
                      done ? "w-full" : "w-0"
                    }`}
                    style={{
                      background: done
                        ? "linear-gradient(90deg, #34d399 0%, #67e8f9 100%)"
                        : undefined,
                      boxShadow: done ? "0 0 6px #34d399" : undefined,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function usePopKey(currentStep: number): number {
  const [key, setKey] = useState(0);
  const prevRef = useRef(currentStep);
  useEffect(() => {
    if (prevRef.current !== currentStep) {
      prevRef.current = currentStep;
      setKey((k) => k + 1);
    }
  }, [currentStep]);
  return key;
}
