import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { SUPPORTED_LOCALES } from "../src/i18n/config.js";
import { STATIC_ROUTES } from "../src/routing.js";
import { hreflangLinks, localizedUrl } from "../src/seo/urls.js";
import { escapeXml, loadNews, ROOT } from "./lib/news.js";

function parseLastmod(dateStr) {
  if (!dateStr) return undefined;
  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) return undefined;
  return new Date(parsed).toISOString().split("T")[0];
}

function renderHreflangLinks(pathname) {
  return hreflangLinks(pathname)
    .map(
      ({ hreflang, href }) =>
        `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}" />`
    )
    .join("\n");
}

function renderUrlEntries({ pathname, changefreq, priority, lastmod }) {
  const alternates = renderHreflangLinks(pathname);
  const lastmodLine = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : "";

  return SUPPORTED_LOCALES.map(
    (locale) => `  <url>
    <loc>${escapeXml(localizedUrl(pathname, locale))}</loc>${lastmodLine}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alternates}
  </url>`
  );
}

async function generateSitemap() {
  const ogSource = resolve(ROOT, "assets/og.png");
  const ogDest = resolve(ROOT, "public/og.png");
  if (existsSync(ogSource)) {
    copyFileSync(ogSource, ogDest);
    console.log(`OG image copied: ${ogDest}`);
  }

  const { posts } = await loadNews();
  const entries = [
    ...STATIC_ROUTES.filter((route) => !route.noindex).map((route) => ({
      pathname: route.path,
      changefreq: route.changefreq,
      priority: route.priority,
      lastmod: route.path === "/news" ? parseLastmod(posts[0]?.date) : undefined,
    })),
    ...posts.map((post) => ({
      pathname: `/news/${post.slug}`,
      changefreq: "monthly",
      priority: "0.6",
      lastmod: parseLastmod(post.date),
    })),
  ];
  const urls = entries.flatMap(renderUrlEntries);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;

  const outputPath = resolve(ROOT, "public/sitemap.xml");
  writeFileSync(outputPath, xml, "utf8");
  console.log(`Sitemap generated: ${outputPath} (${urls.length} URLs)`);
}

generateSitemap().catch((error) => {
  console.error("Failed to generate sitemap:", error);
  process.exit(1);
});
