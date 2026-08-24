import { useCallback, useEffect, useState } from "react";

import { useI18n } from "../i18n/I18nProvider";

export function useImageLightbox() {
  const [lightbox, setLightbox] = useState(null);

  const openImage = (src, gallery) => {
    const items =
      Array.isArray(gallery) && gallery.length
        ? gallery.map((item) =>
            typeof item === "string" ? { src: item, alt: "" } : { src: item.src, alt: item.alt || "" }
          )
        : [{ src, alt: "" }];
    const foundIndex = items.findIndex((item) => item.src === src);
    setLightbox({
      items,
      index: foundIndex >= 0 ? foundIndex : 0,
    });
  };

  const closeImage = useCallback(() => setLightbox(null), []);

  const showPrev = useCallback(() => {
    setLightbox((current) => {
      if (!current?.items?.length) return current;
      const nextIndex = (current.index - 1 + current.items.length) % current.items.length;
      return { ...current, index: nextIndex };
    });
  }, []);

  const showNext = useCallback(() => {
    setLightbox((current) => {
      if (!current?.items?.length) return current;
      const nextIndex = (current.index + 1) % current.items.length;
      return { ...current, index: nextIndex };
    });
  }, []);

  const current = lightbox?.items?.[lightbox.index] || null;

  return {
    image: current?.src || null,
    alt: current?.alt || "",
    hasGallery: (lightbox?.items?.length || 0) > 1,
    openImage,
    closeImage,
    showPrev,
    showNext,
  };
}

export default function ImageLightbox({
  image,
  alt = "",
  onClose,
  onPrev,
  onNext,
  hasGallery = false,
}) {
  const { t } = useI18n();

  useEffect(() => {
    if (!image) return;
    function onKey(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev?.();
      if (event.key === "ArrowRight") onNext?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [image, onClose, onPrev, onNext]);

  if (!image) return null;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
        <img src={image} alt={alt} className="lightbox-image" />
        {hasGallery ? (
          <>
            <button
              type="button"
              className="lightbox-nav is-prev"
              aria-label={t("news.sliderPrev")}
              onClick={(event) => {
                event.stopPropagation();
                onPrev?.();
              }}
            >
              ‹
            </button>
            <button
              type="button"
              className="lightbox-nav is-next"
              aria-label={t("news.sliderNext")}
              onClick={(event) => {
                event.stopPropagation();
                onNext?.();
              }}
            >
              ›
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
