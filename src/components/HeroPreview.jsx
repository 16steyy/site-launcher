import { useEffect, useRef } from "react";
import heroPreviewVideo from "../../assets/launcher.mp4";

const MAX_TILT_DEG = 3.5;

export default function HeroPreview() {
  const videoRef = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      if (mediaQuery.matches) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    syncPlayback();
    mediaQuery.addEventListener("change", syncPlayback);
    return () => mediaQuery.removeEventListener("change", syncPlayback);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    let frame = 0;
    let point = null;

    function apply() {
      frame = 0;
      if (!point) {
        stage.style.setProperty("--tilt-x", "0deg");
        stage.style.setProperty("--tilt-y", "0deg");
        stage.style.setProperty("--glow-x", "50%");
        stage.style.setProperty("--glow-y", "50%");
        stage.classList.remove("is-tilting");
        return;
      }
      const rect = stage.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (point.x - rect.left) / rect.width));
      const y = Math.min(1, Math.max(0, (point.y - rect.top) / rect.height));
      stage.style.setProperty("--tilt-x", `${((0.5 - y) * MAX_TILT_DEG * 2).toFixed(2)}deg`);
      stage.style.setProperty("--tilt-y", `${((x - 0.5) * MAX_TILT_DEG * 2).toFixed(2)}deg`);
      stage.style.setProperty("--glow-x", `${(x * 100).toFixed(1)}%`);
      stage.style.setProperty("--glow-y", `${(y * 100).toFixed(1)}%`);
      stage.classList.add("is-tilting");
    }

    function schedule(nextPoint) {
      point = nextPoint;
      if (!frame) frame = window.requestAnimationFrame(apply);
    }

    const onMove = (event) => schedule({ x: event.clientX, y: event.clientY });
    const onLeave = () => schedule(null);

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      window.cancelAnimationFrame(frame);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="reveal mx-auto mt-12 max-w-5xl" style={{ animationDelay: "160ms" }}>
      <div ref={stageRef} className="hero-preview-stage">
        <div className="hero-preview-shell">
          <video
            ref={videoRef}
            src={heroPreviewVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="hero-preview-image"
          />
          <span className="hero-preview-glare" aria-hidden />
        </div>
      </div>
    </div>
  );
}
