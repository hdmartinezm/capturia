"use client";
import { A2UIProvider } from "@copilotkit/a2ui-renderer";
import OverlayLayer from "@/components/OverlayLayer";
import A2uiOverlay from "@/components/A2uiOverlay";
import { capturiaCatalog } from "@/lib/a2ui-catalog";
import type { OverlaySpec } from "@/lib/types";

interface Props {
  overlays: OverlaySpec[];
}

/**
 * Surface Mode entry point. Drop-in alternative to <OverlayLayer> that renders
 * the SAME overlays state through the real A2UI runtime: one A2UIProvider holds
 * the MessageProcessor + the registered capturiaCatalog, and each overlay is an
 * independent A2UI surface (see A2uiOverlay). The overlays array stays the
 * single source of truth, so every existing path (the 6 AG-UI tools, deck cue
 * matching, compose_scene, voice) drives both render modes unchanged.
 *
 * This module statically imports the A2UIProvider/A2UIRenderer render path,
 * which is client-only (createContext at module load), so the studio loads it
 * via next/dynamic ssr:false; the renderer never executes on the server and is
 * not in the marketing bundle. (The catalog object itself is built at module
 * load in lib/a2ui-catalog.tsx and is imported by the studio regardless of
 * Surface Mode; that is harmless, since nothing in it touches the DOM and
 * createContext is server-safe in React 19.)
 */
export default function A2uiOverlayLayer({ overlays }: Props) {
  return (
    <A2UIProvider catalog={capturiaCatalog}>
      <OverlayLayer
        overlays={overlays}
        renderItem={(overlay, { exiting, enterIndex }) => (
          <A2uiOverlay overlay={overlay} exiting={exiting} enterIndex={enterIndex} />
        )}
      />
    </A2UIProvider>
  );
}
