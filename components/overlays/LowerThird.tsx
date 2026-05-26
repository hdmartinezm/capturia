"use client";
import { useTypewriter } from "@/hooks/useTypewriter";

interface Props {
  name: string;
  subtitle: string;
}

export default function LowerThird({ name, subtitle }: Props) {
  const typedName = useTypewriter(name, 32);
  const isTyping = typedName.length < name.length;
  return (
    <div className="flex items-stretch">
      <div
        className="w-1 rounded-full mr-3"
        style={{
          background: "linear-gradient(180deg, #67e8f9 0%, #c084fc 50%, #f472b6 100%)",
          boxShadow: "0 0 10px #c084fc",
        }}
      />
      <div className="bg-black/80 backdrop-blur-md border border-white/20 px-5 py-3 rounded-r-xl border-breathe">
        <p className="text-white font-bold text-lg leading-tight tracking-tight min-h-[1.5rem]">
          {typedName}
          {isTyping && (
            <span className="inline-block w-[2px] h-4 bg-white/80 ml-0.5 align-middle animate-pulse" />
          )}
        </p>
        {/* Underline sweep: keyed to name so it restarts when the name changes */}
        {!isTyping && (
          <div
            key={name}
            className="h-[2px] mt-1 rounded-full underline-sweep"
            style={{
              background: "linear-gradient(90deg, #67e8f9, #c084fc, #f472b6)",
              boxShadow: "0 0 6px #c084fc",
            }}
          />
        )}
        <p
          className="text-sm mt-0.5 font-mono gradient-text"
          style={
            { "--g-from": "#a5b4fc", "--g-to": "#67e8f9" } as React.CSSProperties
          }
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
