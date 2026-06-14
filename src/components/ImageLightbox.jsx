import { useEffect, useState } from "react";

export function useImageLightbox() {
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!image) return;
    function onKey(event) {
      if (event.key === "Escape") setImage(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [image]);

  return {
    image,
    openImage: setImage,
    closeImage: () => setImage(null),
  };
}

export default function ImageLightbox({ image, onClose }) {
  if (!image) return null;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
        <img src={image} alt="" className="lightbox-image" />
      </div>
    </div>
  );
}
