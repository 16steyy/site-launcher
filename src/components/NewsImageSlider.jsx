import { useRef, useState } from "react";

import { useI18n } from "../i18n/I18nProvider";

export default function NewsImageSlider({ images, onOpenImage }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const current = images[index];

  if (!current) return null;

  const goTo = (nextIndex) => {
    const total = images.length;
    setIndex(((nextIndex % total) + total) % total);
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX == null) return;
    const delta = event.changedTouches[0]?.clientX - startX;
    if (delta > 48) goTo(index - 1);
    if (delta < -48) goTo(index + 1);
  };

  return (
    <div
      className="news-image-slider"
      role="region"
      aria-roledescription="carousel"
      aria-label={t("news.sliderLabel")}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        className="news-image-slider-frame"
        onClick={() => onOpenImage?.(current.src, images)}
      >
        <img src={current.src} alt={current.alt || ""} />
      </button>

      <button
        type="button"
        className="news-image-slider-nav is-prev"
        aria-label={t("news.sliderPrev")}
        onClick={() => goTo(index - 1)}
      >
        ‹
      </button>
      <button
        type="button"
        className="news-image-slider-nav is-next"
        aria-label={t("news.sliderNext")}
        onClick={() => goTo(index + 1)}
      >
        ›
      </button>

      <div className="news-image-slider-footer">
        <p className="news-image-slider-counter">
          {t("news.sliderCounter", { current: index + 1, total: images.length })}
        </p>
        <div className="news-image-slider-dots">
          {images.map((image, imageIndex) => (
            <button
              key={`${image.src}-${imageIndex}`}
              type="button"
              className={`news-image-slider-dot${imageIndex === index ? " is-active" : ""}`}
              aria-label={t("news.sliderGoTo", { current: imageIndex + 1 })}
              aria-current={imageIndex === index ? "true" : undefined}
              onClick={() => goTo(imageIndex)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
