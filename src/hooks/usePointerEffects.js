import { useEffect } from "react";

const SPOTLIGHT_SELECTOR = "[data-spotlight], .card, .panel, .news-card, .shot-frame";
const MAGNET_RADIUS = 36;
const MAGNET_STRENGTH = 0.22;
const MAGNET_MAX = 7;

function clamp(value, limit) {
  return Math.max(-limit, Math.min(limit, value));
}

export function usePointerEffects() {
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches) return;

    let frame = 0;
    let lastEvent = null;
    let spotlit = null;
    const pulled = new Set();
    const glow = document.querySelector(".grid-glow");
    const glowRadius = glow ? glow.offsetWidth / 2 : 0;

    function releaseMagnets(keep) {
      pulled.forEach((el) => {
        if (el === keep) return;
        el.style.removeProperty("--magnet-x");
        el.style.removeProperty("--magnet-y");
        el.classList.remove("is-magnetized");
        pulled.delete(el);
      });
    }

    function update() {
      frame = 0;
      const event = lastEvent;
      if (!event) return;

      const target = event.target instanceof Element ? event.target : null;
      const card = target?.closest(SPOTLIGHT_SELECTOR) || null;
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }
      if (spotlit && spotlit !== card) {
        spotlit.classList.remove("is-spotlit");
      }
      card?.classList.add("is-spotlit");
      spotlit = card;

      if (glow) {
        const x = event.clientX - glowRadius;
        const y = event.clientY - glowRadius;
        glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        glow.style.backgroundPosition = `${-x}px ${-y}px`;
        glow.classList.add("is-visible");
      }

      if (reducedMotion.matches) return;

      let active = null;
      document.querySelectorAll("[data-magnetic]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        const inside =
          event.clientX > rect.left - MAGNET_RADIUS &&
          event.clientX < rect.right + MAGNET_RADIUS &&
          event.clientY > rect.top - MAGNET_RADIUS &&
          event.clientY < rect.bottom + MAGNET_RADIUS;
        if (!inside) return;
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        el.style.setProperty("--magnet-x", `${clamp(dx * MAGNET_STRENGTH, MAGNET_MAX)}px`);
        el.style.setProperty("--magnet-y", `${clamp(dy * MAGNET_STRENGTH, MAGNET_MAX)}px`);
        el.classList.add("is-magnetized");
        pulled.add(el);
        active = el;
      });
      releaseMagnets(active);
    }

    function onPointerMove(event) {
      if (event.pointerType && event.pointerType !== "mouse") return;
      lastEvent = event;
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    function onPointerLeave() {
      lastEvent = null;
      spotlit?.classList.remove("is-spotlit");
      spotlit = null;
      glow?.classList.remove("is-visible");
      releaseMagnets(null);
    }

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      onPointerLeave();
    };
  }, []);
}
