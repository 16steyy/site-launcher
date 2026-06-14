import { useEffect, useState } from "react";

const TYPING_MS = 62;
const SELECT_DELAY_MS = 450;

export default function HeroTagline({ highlight, rest, className = "", style }) {
  const fullText = `${highlight}${rest}`;
  const [typedCount, setTypedCount] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setTypedCount(fullText.length);
      setIsSelecting(true);
      return;
    }

    setTypedCount(0);
    setIsSelecting(false);

    let count = 0;
    let selectTimeoutId = 0;
    const intervalId = window.setInterval(() => {
      count += 1;
      setTypedCount(count);
      if (count >= fullText.length) {
        window.clearInterval(intervalId);
        selectTimeoutId = window.setTimeout(() => setIsSelecting(true), SELECT_DELAY_MS);
      }
    }, TYPING_MS);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(selectTimeoutId);
    };
  }, [highlight, rest, fullText]);

  const highlightVisible = highlight.slice(0, Math.min(typedCount, highlight.length));
  const restVisible =
    typedCount > highlight.length ? rest.slice(0, typedCount - highlight.length) : "";
  const isTyping = typedCount < fullText.length;

  return (
    <p className={className} style={style} aria-label={fullText}>
      <span className={`hero-tagline-highlight${isSelecting ? " is-selected" : ""}`}>
        {highlightVisible}
      </span>
      <span>{restVisible}</span>
      {isTyping && (
        <span className="hero-tagline-cursor" aria-hidden>
          |
        </span>
      )}
    </p>
  );
}
