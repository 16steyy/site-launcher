import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Чем меньше LERP, тем дольше страница «докатывается» после прокрутки колесом.
const WHEEL_LERP = 0.06;
// Сколько от обычного шага колеса проходит страница за одно деление.
const WHEEL_MULTIPLIER = 0.7;

const MIN_JUMP_DURATION = 0.9;
const MAX_JUMP_DURATION = 2.4;
const JUMP_PX_PER_SECOND = 3000;
// Картинки без размеров (новости, документация) догружаются по пути и сдвигают
// цель, поэтому по окончании прокрутки проверяем позицию ещё раз.
const JUMP_CORRECTIONS = 2;

let lenis = null;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

// Модалки блокируют страницу через body overflow: hidden, а Lenis скроллит
// программно и такую блокировку не видит. Отдаём колесо браузеру.
function isPageLocked(node) {
  return node === document.body && node.style.overflow === "hidden";
}

export function initSmoothScroll() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  lenis = new Lenis({
    autoRaf: true,
    lerp: WHEEL_LERP,
    wheelMultiplier: reducedMotion ? 1 : WHEEL_MULTIPLIER,
    allowNestedScroll: true,
    prevent: isPageLocked,
  });

  return () => {
    lenis?.destroy();
    lenis = null;
  };
}

/** Плавно прокручивает к элементу или к координате Y. */
export function smoothScrollTo(target, { immediate = false, corrections = JUMP_CORRECTIONS } = {}) {
  if (!lenis || target == null) return;

  const distance =
    typeof target === "number"
      ? Math.abs(target - window.scrollY)
      : Math.abs(target.getBoundingClientRect().top);

  lenis.scrollTo(target, {
    immediate,
    duration: Math.min(
      MAX_JUMP_DURATION,
      MIN_JUMP_DURATION + distance / JUMP_PX_PER_SECOND
    ),
    easing: easeInOutCubic,
    onComplete: () => {
      if (typeof target === "number" || corrections === 0) return;
      // Элемент могли пересоздать за время прокрутки.
      const node = target.isConnected ? target : document.getElementById(target.id);
      if (node) smoothScrollTo(node, { corrections: corrections - 1 });
    },
  });
}
