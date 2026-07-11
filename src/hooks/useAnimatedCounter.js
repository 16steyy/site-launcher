import { useEffect, useRef, useState } from "react";

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

export function useAnimatedCounter(target, { duration = 1400, startOnView = true } = {}) {
  const [value, setValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) return;

    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      setHasStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [startOnView, target]);

  useEffect(() => {
    if (!hasStarted) return;

    const safeTarget = Number.isFinite(target) ? Math.max(0, Math.round(target)) : 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || safeTarget === 0) {
      setValue(safeTarget);
      return;
    }

    let frameId = 0;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(easeOutCubic(progress) * safeTarget));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    }

    setValue(0);
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [hasStarted, target, duration]);

  return { value, ref };
}
