"use client";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { POSITION_CLASSES } from "@/lib/positions";
import { OverlayComponent } from "@/components/overlays";
import type { OverlaySpec } from "@/lib/types";

interface Props {
  overlays: OverlaySpec[];
  // Optional leaf renderer. When provided, each overlay's inner content is
  // rendered by this instead of the direct React <OverlayComponent>. Surface
  // Mode passes a renderer that routes through the real A2UI pipeline. All
  // positioning / enter-exit / FLIP / stagger machinery below stays the same.
  renderItem?: (
    overlay: OverlaySpec,
    opts: { exiting: boolean; enterIndex: number }
  ) => React.ReactNode;
}

const EXIT_MS = 320;

type Tracked = { overlay: OverlaySpec; exiting: boolean; enterIndex: number };

export default function OverlayLayer({ overlays, renderItem }: Props) {
  const [tracked, setTracked] = useState<Tracked[]>(() =>
    overlays.map((o, i) => ({ overlay: o, exiting: false, enterIndex: i }))
  );
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    setTracked((prev) => {
      const incomingIds = new Set(overlays.map((o) => o.id));
      const prevIds = new Set(prev.map((p) => p.overlay.id));

      // Walk previous in order, deciding fate of each
      const next: Tracked[] = [];
      for (const p of prev) {
        const stillThere = incomingIds.has(p.overlay.id);
        if (stillThere) {
          // Cancel any pending exit (the overlay came back)
          const t = timeoutsRef.current.get(p.overlay.id);
          if (t) {
            clearTimeout(t);
            timeoutsRef.current.delete(p.overlay.id);
          }
          const fresh = overlays.find((o) => o.id === p.overlay.id)!;
          next.push({ overlay: fresh, exiting: false, enterIndex: p.enterIndex });
        } else if (!p.exiting) {
          // Newly removed: schedule unmount after exit animation
          next.push({ ...p, exiting: true });
          if (!timeoutsRef.current.has(p.overlay.id)) {
            const timeout = setTimeout(() => {
              setTracked((curr) => curr.filter((c) => c.overlay.id !== p.overlay.id));
              timeoutsRef.current.delete(p.overlay.id);
            }, EXIT_MS);
            timeoutsRef.current.set(p.overlay.id, timeout);
          }
        } else {
          // Already exiting, keep until its scheduled removal fires
          next.push(p);
        }
      }

      // Append brand-new items, with batch-local enter index for stagger
      let staggerIndex = 0;
      for (const o of overlays) {
        if (!prevIds.has(o.id)) {
          next.push({ overlay: o, exiting: false, enterIndex: staggerIndex++ });
        }
      }
      return next;
    });
  }, [overlays]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      for (const t of timeouts.values()) clearTimeout(t);
      timeouts.clear();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {tracked.map(({ overlay, exiting, enterIndex }) => {
        const inner = renderItem ? (
          renderItem(overlay, { exiting, enterIndex })
        ) : (
          <OverlayComponent overlay={overlay} exiting={exiting} enterIndex={enterIndex} />
        );
        if (overlay.type === "Letterbox") {
          return <Fragment key={overlay.id}>{inner}</Fragment>;
        }
        const posClass = POSITION_CLASSES[overlay.position] ?? "top-4 left-4";
        return (
          <PositionedOverlay key={overlay.id} posClass={posClass} exiting={exiting}>
            {inner}
          </PositionedOverlay>
        );
      })}
    </div>
  );
}

/**
 * FLIP-style position transition: when posClass changes, the outer wrapper
 * jumps to its new position, then the inner div animates from the previous
 * position via a transient `transform: translate(...)`. The outer's own
 * transform (e.g. `-translate-x-1/2`) is preserved on the outer wrapper.
 */
function PositionedOverlay({
  posClass,
  exiting,
  children,
}: {
  posClass: string;
  exiting: boolean;
  children: React.ReactNode;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const prevRectRef = useRef<DOMRect | null>(null);
  const prevPosRef = useRef<string>(posClass);

  useLayoutEffect(() => {
    if (exiting) return;
    const el = innerRef.current;
    if (!el) return;
    const newRect = el.getBoundingClientRect();
    if (prevPosRef.current !== posClass && prevRectRef.current) {
      const dx = prevRectRef.current.left - newRect.left;
      const dy = prevRectRef.current.top - newRect.top;
      if (dx !== 0 || dy !== 0) {
        el.style.transition = "none";
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        requestAnimationFrame(() => {
          el.style.transition = "transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1)";
          el.style.transform = "translate(0, 0)";
        });
      }
    }
    prevPosRef.current = posClass;
    prevRectRef.current = newRect;
  }, [posClass, exiting]);

  return (
    <div className={`absolute ${posClass}`}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
