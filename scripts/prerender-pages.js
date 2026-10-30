import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { SUPPORTED_LOCALES } from "../src/i18n/config.js";
import { STATIC_ROUTES } from "../src/routing.js";
import {
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_WIDTH,
  JSON_LD_ID,
  OG_LOCALE_MAP,
  SITE_NAME,
} from "../src/seo/config.js";
import { buildJsonLd } from "../src/seo/jsonLd.js";
import { buildSeoConfig } from "../src/seo/seoConfig.js";
import { absoluteUrl, hreflangLinks, localizedUrl } from "../src/seo/urls.js";
import { loadMessages, loadNews, ROOT } from "./lib/news.js";
import { renderStaticBody } from "./lib/static-body.js";

const LEGACY_LOCALE = "ru";
const SEO_BLOCK = /<!-- seo:start[\s\S]*?<!-- seo:end -->/;
const ROOT_DIV = '<div id="root"></div>';

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function meta(attr, key, content) {
  return `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
}

function renderHead(config) {
  const canonicalUrl = localizedUrl(config.pathname, config.locale);
  const image = absoluteUrl(config.image || DEFAULT_OG_IMAGE_PATH);
  const jsonLd = buildJsonLd(config, canonicalUrl);

  const tags = [
    `<title>${escapeAttr(config.title)}</title>`,
    meta("name", "description", config.description),
    meta("name", "robots", config.noindex ? "noindex, nofollow" : "index, follow"),
    `<link rel="canonical" href="${escapeAttr(canonicalUrl)}" />`,
    ...hreflangLinks(config.pathname).map(
      ({ hreflang, href }) =>
        `<link rel="alternate" hreflang="${hreflang}" href="${escapeAttr(href)}" />`
    ),
    meta("property", "og:site_name", SITE_NAME),
    meta("property", "og:type", config.ogType),
    meta("property", "og:url", canonicalUrl),
    meta("property", "og:title", config.title),
    meta("property", "og:description", config.description),
    meta("property", "og:image", image),
    ...(config.image
      ? []
      : [
          meta("property", "og:image:width", DEFAULT_OG_IMAGE_WIDTH),
          meta("property", "og:image:height", DEFAULT_OG_IMAGE_HEIGHT),
        ]),
    meta("property", "og:locale", OG_LOCALE_MAP[config.locale]),
    ...SUPPORTED_LOCALES.filter((code) => code !== config.locale).map((code) =>
      meta("property", "og:locale:alternate", OG_LOCALE_MAP[code])
    ),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", config.title),
    meta("name", "twitter:description", config.description),
    meta("name", "twitter:image", image),
    ...(jsonLd
      ? [
          `<script id="${JSON_LD_ID}" type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\u003c")}</script>`,
        ]
      : []),
  ];

  return tags.map((tag) => `    ${tag}`).join("\n").trimStart();
}

function renderPage(template, config, body) {
  return template
    .replace(SEO_BLOCK, () => renderHead(config))
    .replace(ROOT_DIV, () => `<div id="root">${body}</div>`)
    .replace(/<html lang="[^"]*">/, `<html lang="${config.locale}">`);
}

function writeHtml(distDir, relativePath, html) {
  const target = resolve(distDir, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html, "utf8");
}

function readReleaseVersion() {
  const file = resolve(ROOT, "public/github-release.json");
  if (!existsSync(file)) return "";
  try {
    return JSON.parse(readFileSync(file, "utf8")).version || "";
  } catch {
    return "";
  }
}

export async function prerenderPages(distDir = resolve(ROOT, "dist")) {
  const template = readFileSync(resolve(distDir, "index.html"), "utf8");
  if (!SEO_BLOCK.test(template)) {
    throw new Error("index.html is missing the <!-- seo:start --> … <!-- seo:end --> block");
  }
  if (!template.includes(ROOT_DIV)) {
    throw new Error(`index.html is missing an empty ${ROOT_DIV}`);
  }

  const news = await loadNews();
  const releaseVersion = readReleaseVersion();
  const paths = [
    ...STATIC_ROUTES.map((route) => route.path),
    ...news.posts.map((post) => `/news/${post.slug}`),
  ];

  let count = 0;
  for (const locale of SUPPORTED_LOCALES) {
    const messages = loadMessages(locale);
    for (const path of paths) {
      const config = buildSeoConfig({ path, locale, messages, news, releaseVersion });
      const dir = path === "/" ? locale : `${locale}${path}`;
      const body = renderStaticBody({ config, messages, news });
      writeHtml(distDir, `${dir}/index.html`, renderPage(template, config, body));
      count += 1;
    }
  }

  const legacyMessages = loadMessages(LEGACY_LOCALE);
  for (const path of paths) {
    const config = buildSeoConfig({
      path,
      locale: LEGACY_LOCALE,
      messages: legacyMessages,
      news,
      releaseVersion,
    });
    const file = path === "/" ? "index.html" : `${path.slice(1)}/index.html`;
    const body = renderStaticBody({ config, messages: legacyMessages, news });
    writeHtml(distDir, file, renderPage(template, config, body));
    count += 1;
  }

  const notFound = buildSeoConfig({
    path: "/404",
    locale: LEGACY_LOCALE,
    messages: legacyMessages,
    news,
    releaseVersion,
  });
  const notFoundBody = renderStaticBody({ config: notFound, messages: legacyMessages, news });
  writeHtml(distDir, "404.html", renderPage(template, notFound, notFoundBody));

  console.log(`[prerender] wrote ${count} pages + 404.html`);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  prerenderPages().catch((error) => {
    console.error("[prerender] failed:", error);
    process.exit(1);
  });
}
