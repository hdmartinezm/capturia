"use client";

interface Props {
  text: string;
  lastSent: string;
  speechStatus: string;
  lastError: string;
  isListening: boolean;
}

export default function LiveCaptions({ text, lastSent, speechStatus, lastError, isListening }: Props) {
  if (!isListening) return null;

  const isError = speechStatus.startsWith("error:");
  const isSent = speechStatus === "sent ✓";

  return (
    <div className="absolute bottom-20 left-0 right-0 z-20 flex flex-col items-center gap-2 px-6 pointer-events-none select-none">
      {/* Status line — always visible when listening */}
      <div className="flex items-center gap-2">
        {!isError && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        )}
        <span
          className={`text-[11px] font-mono uppercase tracking-widest ${
            isError ? "text-red-400" : isSent ? "text-green-400" : "text-white/50"
          }`}
        >
          {speechStatus}
        </span>
      </div>

      {/* Interim transcript — what you're saying right now */}
      {text && (
        <div className="bg-black/80 backdrop-blur-lg border border-white/10 rounded-2xl px-6 py-3 max-w-2xl w-full text-center">
          <p className="text-white text-xl font-medium leading-snug">
            {text}
            <span className="inline-block w-0.5 h-5 bg-white/50 ml-1 animate-pulse align-middle" />
          </p>
        </div>
      )}

      {/* Persistent error — survives rapid restarts */}
      {lastError && (
        <div className="bg-red-950/80 border border-red-500/40 rounded-xl px-4 py-1.5 max-w-xl w-full text-center">
          <p className="text-red-400 text-xs font-mono">error: {lastError}</p>
        </div>
      )}

      {/* Last phrase sent to agent */}
      {lastSent && !text && !lastError && (
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 max-w-xl w-full text-center">
          <p className="text-white/40 text-xs font-mono">
            sent: &ldquo;{lastSent}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
