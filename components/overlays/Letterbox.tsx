"use client";

interface Props {
  enabled: boolean;
  exiting?: boolean;
}

export default function Letterbox({ enabled, exiting = false }: Props) {
  if (!enabled) return null;
  const topClass = exiting ? "letterbox-exit-top" : "letterbox-enter-top";
  const bottomClass = exiting ? "letterbox-exit-bottom" : "letterbox-enter-bottom";
  return (
    <>
      <div className={`${topClass} absolute top-0 left-0 right-0 h-[11vh] bg-black z-20`} />
      <div className={`${bottomClass} absolute bottom-0 left-0 right-0 h-[11vh] bg-black z-20`} />
    </>
  );
}
