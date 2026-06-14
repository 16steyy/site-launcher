import { useEffect } from "react";

import { applyPageSeo } from "../seo/applyPageSeo";

export function usePageSeo(seoConfig) {
  useEffect(() => {
    if (!seoConfig) return;
    applyPageSeo(seoConfig);
  }, [seoConfig]);
}
