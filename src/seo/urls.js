import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../i18n/config.js";
import { localizePath } from "../routing.js";
import { SITE_URL } from "./config.js";

export function absoluteUrl(path = "/") {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function localizedUrl(pathname, locale = DEFAULT_LOCALE) {
  return `${SITE_URL}${localizePath(pathname, locale)}`;
}

export function xDefaultUrl(pathname) {
  return localizedUrl(pathname, DEFAULT_LOCALE);
}

export function hreflangLinks(pathname) {
  return [
    ...SUPPORTED_LOCALES.map((locale) => ({
      hreflang: locale,
      href: localizedUrl(pathname, locale),
    })),
    { hreflang: "x-default", href: xDefaultUrl(pathname) },
  ];
}
