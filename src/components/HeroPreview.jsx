import { useEffect, useRef } from "react";
import heroPreviewVideo from "../../assets/launcher.mp4";

const TILT_X = 4;
const TILT_Y = 5;

export default function HeroPreview() {
  const videoRef = useRef(null);
  const canTiltRef = useRef(true);

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
    const tiltQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce), (hover: none), (pointer: coarse)"
    );
    const syncTilt = () => {
      canTiltRef.current = !tiltQuery.matches;
    };

    syncTilt();
    tiltQuery.addEventListener("change", syncTilt);
    return () => tiltQuery.removeEventListener("change", syncTilt);
  }, []);

  function handleTilt(event) {
    if (!canTiltRef.current) return;

    const frame = event.currentTarget;
    const tilt = frame.querySelector(".hero-preview-tilt");
    if (!tilt) return;

    const rect = frame.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) * 2 - 1) * TILT_X;
    const rotateY = ((x / rect.width) * 2 - 1) * -TILT_Y;

    tilt.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
    tilt.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
    tilt.classList.add("is-tilting");
  }

  function resetTilt(event) {
    const tilt = event.currentTarget.querySelector(".hero-preview-tilt");
    if (!tilt) return;

    tilt.style.setProperty("--rx", "0deg");
    tilt.style.setProperty("--ry", "0deg");
    tilt.classList.remove("is-tilting");
  }

  return (
    <div
      className="hero-preview reveal mx-auto mt-10 max-w-4xl"
      style={{ animationDelay: "200ms" }}
    >
      <div
        className="hero-preview-frame relative block w-full"
        onMouseMove={handleTilt}
        onMouseLeave={resetTilt}
      >
        <div className="hero-preview-tilt relative">
          <div className="hero-preview-glow pointer-events-none absolute -inset-4 rounded-[2rem] opacity-70" aria-hidden />
          <div className="hero-preview-glow-secondary pointer-events-none absolute -inset-8 rounded-[2.5rem]" aria-hidden />
          <div className="glass hero-preview-shell relative overflow-hidden rounded-2xl p-2 shadow-[0_24px_80px_rgba(0,0,0,0.5)] md:rounded-3xl md:p-3">
            <video
              ref={videoRef}
              src={heroPreviewVideo}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="hero-preview-image block w-full rounded-xl object-cover object-top"
            />
            <div className="hero-preview-shine pointer-events-none absolute inset-2 rounded-xl md:inset-3" aria-hidden />
            <div className="hero-preview-vignette pointer-events-none absolute inset-2 rounded-xl md:inset-3" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
