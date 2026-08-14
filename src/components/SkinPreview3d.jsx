import { useEffect, useRef, useState } from "react";
import { IdleAnimation, SkinViewer } from "skinview3d";
import {
  fetchSkinObjectUrl,
  resolveSkinUrlCandidates,
  userToProfile,
} from "../lib/avatar.js";

async function loadSkinWithFallbacks(viewer, profile) {
  const candidates = resolveSkinUrlCandidates(profile);

  for (const source of candidates) {
    if (viewer.disposed) return;

    let objectUrl = null;
    try {
      objectUrl = await fetchSkinObjectUrl(source);
      await viewer.loadSkin(objectUrl, { ears: false, model: "auto-detect" });
      if (viewer.disposed) return;
      viewer.playerObject.ears.visible = false;
      return;
    } catch (error) {
      console.debug("[skin] failed to load 3D preview from", source, error);
    } finally {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    }
  }
}

export default function SkinPreview3d({ user, className, interactive = true }) {
  const profile = userToProfile(user);
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [viewerReady, setViewerReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.className = "block h-full w-full";
    container.appendChild(canvas);

    const width = Math.max(container.clientWidth, 280);
    const height = Math.max(container.clientHeight, 360);

    const viewer = new SkinViewer({ canvas, width, height });
    viewer.autoRotate = interactive;
    viewer.autoRotateSpeed = 0.6;
    viewer.zoom = 0.82;
    viewer.animation = new IdleAnimation();
    viewer.playerObject.rotation.y = Math.PI * 0.22;

    if (!interactive) {
      viewer.controls.enableRotate = false;
      viewer.controls.enablePan = false;
      viewer.controls.enableZoom = false;
    }

    viewerRef.current = viewer;

    const resize = () => {
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;
      if (nextWidth > 0 && nextHeight > 0) {
        viewer.setSize(nextWidth, nextHeight);
      }
    };

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);
    resize();
    setViewerReady(true);

    return () => {
      resizeObserver.disconnect();
      viewer.dispose();
      viewerRef.current = null;
      canvas.remove();
      setViewerReady(false);
    };
  }, [interactive]);

  useEffect(() => {
    if (!viewerReady) return;

    const viewer = viewerRef.current;
    if (!viewer || viewer.disposed) return;

    let cancelled = false;

    const applySkin = async () => {
      await loadSkinWithFallbacks(viewer, profile);
      if (cancelled || viewer.disposed) return;
    };

    void applySkin();

    return () => {
      cancelled = true;
    };
  }, [
    viewerReady,
    profile?.nickname,
    profile?.ely_username,
    profile?.ely_uuid,
    profile?.mc_uuid,
  ]);

  return (
    <div
      className={
        className ??
        "relative flex h-[min(420px,50vh)] w-full flex-col overflow-hidden rounded-3xl border border-white/15 bg-black/40 shadow-xl"
      }
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.14),transparent_68%)]"
        aria-hidden
      />
      <div
        ref={containerRef}
        className={`relative z-10 min-h-[360px] min-w-0 flex-1 ${
          interactive ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
        }`}
      />
    </div>
  );
}
