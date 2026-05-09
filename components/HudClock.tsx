"use client";
import { useEffect, useState } from "react";

export default function HudClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return (
      <span className="text-white/40 text-xs font-mono tabular-nums tracking-wider">
        --:--:--
      </span>
    );
  }
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return (
    <span className="text-white/60 text-xs font-mono tabular-nums tracking-wider">
      {hh}:{mm}:{ss}
    </span>
  );
}
