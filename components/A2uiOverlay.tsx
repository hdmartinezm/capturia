"use client";
import { useLayoutEffect, useMemo } from "react";
import { A2UIRenderer, useA2UI } from "@copilotkit/a2ui-renderer";
import type { OverlaySpec } from "@/lib/types";
import { overlayAnimProps } from "@/components/overlays";
import Letterbox from "@/components/overlays/Letterbox";
import {
  buildOverlayCreate,
  buildOverlayUpdate,
  buildOverlayDelete,
} from "@/lib/a2ui-scene";

interface Props {
  overlay: OverlaySpec;
  exiting?: boolean;
  enterIndex?: number;
}

/**
 * Surface Mode leaf renderer: renders ONE overlay through the genuine A2UI v0.9
 * pipeline (its own surface, rooted at the overlay's catalog component) instead
 * of the direct React switch. The shared A2UIProvider (mounted by
 * A2uiOverlayLayer) owns the MessageProcessor + capturiaCatalog; this host just
 * pushes create/update/delete messages for its surface and mounts an
 * <A2UIRenderer> for it. The enter/exit/stagger wrapper is identical to the
 * direct path so the two render modes look the same.
 */
export default function A2uiOverlay({ overlay, exiting = false, enterIndex = 0 }: Props) {
  const { processMessages, getSurface } = useA2UI();

  // Letterbox is a full-screen cinematic effect, not a positioned card. Its
  // slide in/out is driven by an `exiting` flag that the A2UI catalog
  // passthrough would drop (only declared props survive), so, exactly like the
  // direct renderer, it stays a direct component and manages no A2UI surface.
  // The other 11 overlays render through the real A2UI pipeline below.
  const isLetterbox = overlay.type === "Letterbox";

  // A stable signature of the renderable content, so prop/type edits re-push.
  const sig = useMemo(
    () => `${overlay.type}:${JSON.stringify(overlay.props)}`,
    [overlay.type, overlay.props]
  );

  // Create-or-update the surface synchronously before paint. createSurface
  // throws if the surface already exists, so guard with getSurface; the
  // provider also swallows processMessages errors, but guarding keeps the
  // console clean and is correct under StrictMode's double-invoke.
  useLayoutEffect(() => {
    if (isLetterbox) return;
    if (getSurface(overlay.id)) {
      processMessages([buildOverlayUpdate(overlay)]);
    } else {
      processMessages(buildOverlayCreate(overlay));
    }
    // overlay.id + sig capture every renderable change; processMessages/
    // getSurface are stable refs from the provider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay.id, sig, isLetterbox]);

  // Tear the surface down once this overlay is fully gone (OverlayLayer keeps
  // the node mounted through the exit animation, then unmounts → delete fires).
  useLayoutEffect(() => {
    if (isLetterbox) return;
    return () => {
      processMessages([buildOverlayDelete(overlay.id)]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay.id, isLetterbox]);

  if (overlay.type === "Letterbox") {
    return <Letterbox {...overlay.props} exiting={exiting} />;
  }

  const { className, style } = overlayAnimProps(overlay.type, exiting, enterIndex);

  return (
    <div className={className} style={style}>
      <A2UIRenderer surfaceId={overlay.id} />
    </div>
  );
}
