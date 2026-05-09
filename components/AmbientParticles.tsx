"use client";
import { useEffect, useState } from "react";

const PARTICLE_COUNT = 24;
const PALETTE = ["#67e8f9", "#c084fc", "#f472b6", "#fbbf24", "#34d399", "#a5b4fc"];

interface Particle {
  left: number;
  size: number;
  dur: number;
  delay: number;
  dx: number;
  color: string;
}

interface Props {
  active: boolean;
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    left: Math.random() * 100,
    size: 2 + Math.random() * 3,
    dur: 7 + Math.random() * 9,
    delay: -Math.random() * 12,
    dx: (Math.random() - 0.5) * 90,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
  }));
}

export default function AmbientParticles({ active }: Props) {
  // Generate particles only after client mount — keeps Math.random out of render
  // and avoids any SSR/CSR mismatch.
  const [particles, setParticles] = useState<Particle[] | null>(null);
  useEffect(() => {
    if (particles === null) setParticles(generateParticles());
  }, [particles]);

  if (!active || !particles) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle absolute bottom-0 rounded-full"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 2.5}px ${p.color}`,
              "--dx": `${p.dx}px`,
              "--dur": `${p.dur}s`,
              "--delay": `${p.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
