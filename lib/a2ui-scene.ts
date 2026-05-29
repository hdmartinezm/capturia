// Translation from Capturia's OverlaySpec state into A2UI v0.9 protocol messages
// (the @a2ui/web_core wire format consumed by MessageProcessor.processMessages).
//
// Surface Mode renders each overlay through the REAL A2UI pipeline instead of the
// direct React switch in components/overlays. One surface per overlay keeps the
// model simple: the surface id IS the overlay id, and the single root component
// (id "root", required by the @copilotkit/a2ui-renderer adapter) is the overlay
// itself. Props ride as sibling keys of `component`/`id` (the envelope is
// passthrough), exactly matching what each catalog renderer receives via adapt().
//
// This file is pure data (no React, no package import) so it is safe to import
// from anywhere and trivial to unit-reason about.

import type { OverlaySpec } from "./types";

// Must match the catalogId passed to createCatalog() in lib/a2ui-catalog.tsx,
// which becomes the Catalog id the MessageProcessor looks up on createSurface.
export const CATALOG_ID = "capturia";

type A2uiMessage = Record<string, unknown>;

// The single component node for an overlay. id is fixed to "root" because the
// renderer mounts the surface entry point at id "root"; `component` is the
// catalog type name; every other key is a literal prop resolved straight to the
// React renderer (our schemas use plain values, so no data binding needed).
function rootComponent(overlay: OverlaySpec): A2uiMessage {
  return {
    id: "root",
    component: overlay.type,
    ...(overlay.props as Record<string, unknown>),
  };
}

// Create the surface and populate its root in one batch (order matters:
// createSurface must precede updateComponents for the same surfaceId).
export function buildOverlayCreate(overlay: OverlaySpec): A2uiMessage[] {
  return [
    {
      version: "v0.9",
      createSurface: { surfaceId: overlay.id, catalogId: CATALOG_ID },
    },
    {
      version: "v0.9",
      updateComponents: {
        surfaceId: overlay.id,
        components: [rootComponent(overlay)],
      },
    },
  ];
}

// Replace the root component's props in place (the processor updates an existing
// id in place, or recreates it if the `component` type changed).
export function buildOverlayUpdate(overlay: OverlaySpec): A2uiMessage {
  return {
    version: "v0.9",
    updateComponents: {
      surfaceId: overlay.id,
      components: [rootComponent(overlay)],
    },
  };
}

export function buildOverlayDelete(surfaceId: string): A2uiMessage {
  return { version: "v0.9", deleteSurface: { surfaceId } };
}
