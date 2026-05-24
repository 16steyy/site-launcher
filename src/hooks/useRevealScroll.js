import { useEffect } from "react";

export function useRevealScroll(deps = []) {
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      document.querySelectorAll(".reveal-scroll").forEach((el) => {
        el.classList.add("is-in-view");
      });
      return;
    }

    function markVisibleInViewport() {
      document.querySelectorAll(".reveal-scroll:not(.is-in-view)").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
          el.classList.add("is-in-view");
        }
      });
    }

    markVisibleInViewport();

    const nodes = document.querySelectorAll(".reveal-scroll:not(.is-in-view)");
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, deps);
}
