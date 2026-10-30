import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "../i18n/config";
import {
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  JSON_LD_ID,
  OG_LOCALE_MAP,
  SITE_NAME,
} from "./config";
import { buildJsonLd } from "./jsonLd";
import { absoluteUrl, hreflangLinks, localizedUrl } from "./urls";

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

function upsertLink(rel, href, extra = {}) {
  const selector = `link[rel="${rel}"]${extra.hreflang ? `[hreflang="${extra.hreflang}"]` : ""}`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
  Object.entries(extra).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

function removeStaleHreflangLinks(keepHrefs) {
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((element) => {
    const href = element.getAttribute("href");
    if (!keepHrefs.has(href)) {
      element.remove();
    }
  });
}

function upsertJsonLd(id, data) {
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement("script");
    element.id = id;
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
}

function applyHreflang(pathname) {
  const keepHrefs = new Set();
  hreflangLinks(pathname).forEach(({ hreflang, href }) => {
    keepHrefs.add(href);
    upsertLink("alternate", href, { hreflang });
  });
  removeStaleHreflangLinks(keepHrefs);
}

function applyOpenGraph({
  title,
  description,
  url,
  image,
  locale,
  ogType,
}) {
  const imageUrl = absoluteUrl(image || DEFAULT_OG_IMAGE_PATH);
  const ogLocale = OG_LOCALE_MAP[locale] || OG_LOCALE_MAP[DEFAULT_LOCALE];

  upsertMeta('meta[property="og:site_name"]', {
    property: "og:site_name",
    content: SITE_NAME,
  });
  upsertMeta('meta[property="og:type"]', { property: "og:type", content: ogType });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
  upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
  upsertMeta('meta[property="og:description"]', {
    property: "og:description",
    content: description,
  });
  upsertMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
  if (!image) {
    upsertMeta('meta[property="og:image:width"]', {
      property: "og:image:width",
      content: String(DEFAULT_OG_IMAGE_WIDTH),
    });
    upsertMeta('meta[property="og:image:height"]', {
      property: "og:image:height",
      content: String(DEFAULT_OG_IMAGE_HEIGHT),
    });
  } else {
    document.head.querySelector('meta[property="og:image:width"]')?.remove();
    document.head.querySelector('meta[property="og:image:height"]')?.remove();
  }
  upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: ogLocale });

  document.head.querySelectorAll('meta[property="og:locale:alternate"]').forEach((node) => {
    node.remove();
  });
  SUPPORTED_LOCALES.filter((code) => code !== locale).forEach((code) => {
    const alternate = document.createElement("meta");
    alternate.setAttribute("property", "og:locale:alternate");
    alternate.setAttribute("content", OG_LOCALE_MAP[code]);
    document.head.appendChild(alternate);
  });
}

function applyTwitterCard({ title, description, image }) {
  const imageUrl = absoluteUrl(image || DEFAULT_OG_IMAGE_PATH);
  upsertMeta('meta[name="twitter:card"]', {
    name: "twitter:card",
    content: "summary_large_image",
  });
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
  upsertMeta('meta[name="twitter:description"]', {
    name: "twitter:description",
    content: description,
  });
  upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });
}

export function applyPageSeo({
  locale,
  pathname = "/",
  title,
  description,
  image,
  ogType = "website",
  canonicalPath,
  jsonLdType = "software",
  releaseVersion,
  article,
  faq,
  breadcrumbs,
  noindex = false,
}) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const canonicalUrl = localizedUrl(canonicalPath ?? normalizedPath, locale);

  document.title = title;

  upsertMeta('meta[name="description"]', { name: "description", content: description });
  upsertMeta('meta[name="robots"]', {
    name: "robots",
    content: noindex ? "noindex, nofollow" : "index, follow",
  });

  upsertLink("canonical", canonicalUrl);
  applyHreflang(normalizedPath);

  applyOpenGraph({
    title,
    description,
    url: canonicalUrl,
    image,
    locale,
    ogType,
  });
  applyTwitterCard({ title, description, image });

  const jsonLd = buildJsonLd(
    { locale, jsonLdType, article, description, image, releaseVersion, faq, breadcrumbs },
    canonicalUrl
  );
  if (jsonLd) {
    upsertJsonLd(JSON_LD_ID, jsonLd);
  } else {
    document.getElementById(JSON_LD_ID)?.remove();
  }
}
