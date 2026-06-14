import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "../i18n/config";
import {
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  GITHUB_RELEASES_URL,
  JSON_LD_ID,
  OG_LOCALE_MAP,
  SITE_NAME,
  SITE_URL,
} from "./config";

function absoluteUrl(path = "/") {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

function buildLocalizedUrl(pathname, locale) {
  const url = new URL(pathname || "/", SITE_URL);
  url.searchParams.set("lang", locale);
  return url.toString();
}

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

function removeManagedLinks(rel, keepHrefs) {
  document.head.querySelectorAll(`link[rel="${rel}"]`).forEach((element) => {
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

function buildSoftwareApplicationJsonLd({ description, releaseVersion }) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "GameApplication",
    operatingSystem: "Windows, macOS, Linux",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description,
    url: SITE_URL,
    downloadUrl: GITHUB_RELEASES_URL,
    ...(releaseVersion ? { softwareVersion: releaseVersion } : {}),
  };
}

function buildNewsArticleJsonLd({ title, description, url, datePublished, version }) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    url,
    datePublished: datePublished || undefined,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
      },
    },
    ...(version ? { version } : {}),
  };
}

function parseArticleDate(dateStr) {
  if (!dateStr) return undefined;
  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) return undefined;
  return new Date(parsed).toISOString();
}

function applyHreflang(pathname) {
  const keepHrefs = new Set();
  SUPPORTED_LOCALES.forEach((locale) => {
    const href = buildLocalizedUrl(pathname, locale);
    keepHrefs.add(href);
    upsertLink("alternate", href, { hreflang: locale });
  });
  const xDefaultHref = buildLocalizedUrl(pathname, DEFAULT_LOCALE);
  keepHrefs.add(xDefaultHref);
  upsertLink("alternate", xDefaultHref, { hreflang: "x-default" });
  removeManagedLinks("alternate", keepHrefs);
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
  noindex = false,
}) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const canonicalUrl = buildLocalizedUrl(canonicalPath ?? normalizedPath, locale);

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

  if (jsonLdType === "article" && article) {
    upsertJsonLd(JSON_LD_ID, buildNewsArticleJsonLd({
      title: article.title,
      description: article.description || description,
      url: canonicalUrl,
      datePublished: parseArticleDate(article.date),
      version: article.version,
    }));
  } else if (jsonLdType === "software") {
    upsertJsonLd(JSON_LD_ID, buildSoftwareApplicationJsonLd({
      description,
      releaseVersion,
    }));
  } else {
    const node = document.getElementById(JSON_LD_ID);
    if (node) node.remove();
  }
}
