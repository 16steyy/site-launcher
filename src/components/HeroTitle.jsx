import { useEffect, useState } from "react";

const TITLE = "16Launcher";
const TYPING_MS = 38;

export default function HeroTitle({ className = "" }) {
  const [typedCount, setTypedCount] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setTypedCount(TITLE.length);
      return;
    }

    setTypedCount(0);
    let count = 0;
    const intervalId = window.setInterval(() => {
      count += 1;
      setTypedCount(count);
      if (count >= TITLE.length) {
        window.clearInterval(intervalId);
      }
    }, TYPING_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <h1 className={`hero-title ${className}`.trim()} aria-label={TITLE}>
      <span
        className="hero-title-gradient"
        style={{ "--char-count": TITLE.length }}
        aria-hidden="true"
      >
        {TITLE.slice(0, typedCount).split("").map((char, index) => (
          <span
            key={`${index}-${char}`}
            className="hero-title-char"
            style={{ "--char-index": index }}
          >
            {char}
          </span>
        ))}
      </span>
    </h1>
  );
}
