import { useMemo } from "react";

import { usePageSeo } from "../hooks/usePageSeo";
import { useI18n } from "../i18n/I18nProvider";
import { buildSeoConfig } from "./seoConfig";

export default function AppSeo({ path, news, releaseVersion }) {
  const { locale, messages } = useI18n();

  const seoConfig = useMemo(
    () => buildSeoConfig({ path, locale, messages, news, releaseVersion }),
    [path, news, locale, messages, releaseVersion]
  );

  usePageSeo(seoConfig);
  return null;
}
