import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SITE_URL = "https://16-launcher.ru";
const SUPPORTED_LOCALES = ["ru", "en", "zh", "de", "es"];
const DEFAULT_LOCALE = "en";
const NEWS_INDEX_URL =
  "https://raw.githubusercontent.com/16steyy/16Launcher-Site-News/main/news/index.json";

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildLocalizedUrl(pathname, locale) {
  const url = new URL(pathname || "/", SITE_URL);
  url.searchParams.set("lang", locale);
  return url.toString();
}

function renderHreflangLinks(pathname) {
  return SUPPORTED_LOCALES.map(
    (locale) =>
      `    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(buildLocalizedUrl(pathname, locale))}" />`
  )
    .concat(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(buildLocalizedUrl(pathname, DEFAULT_LOCALE))}" />`
    )
    .join("\n");
}

function normalizePosts(data) {
  const sourceItems = Array.isArray(data?.posts)
    ? data.posts
    : Array.isArray(data?.items)
      ? data.items
      : [];

  return sourceItems
    .map((item, index) => ({
      slug: item?.slug || item?.version || `update-${index + 1}`,
      date: item?.date || "",
    }))
    .filter((post) => post.slug);
}

function parseLastmod(dateStr) {
  if (!dateStr) return undefined;
  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) return undefined;
  return new Date(parsed).toISOString().split("T")[0];
}

async function loadNewsPosts() {
  try {
    const response = await fetch(NEWS_INDEX_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("remote_news_unavailable");
    const data = await response.json();
    return normalizePosts(data);
  } catch {
    const fallbackPath = resolve(ROOT, "src/content/news.json");
    const fallback = JSON.parse(readFileSync(fallbackPath, "utf8"));
    return normalizePosts(fallback);
  }
}

function renderUrlEntry({ pathname, changefreq, priority, lastmod }) {
  const loc = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;
  const lastmodLine = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : "";

  return `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmodLine}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${renderHreflangLinks(pathname)}
  </url>`;
}

async function generateSitemap() {
  const ogSource = resolve(ROOT, "assets/og.png");
  const ogDest = resolve(ROOT, "public/og.png");
  if (existsSync(ogSource)) {
    copyFileSync(ogSource, ogDest);
    console.log(`OG image copied: ${ogDest}`);
  }

  const posts = await loadNewsPosts();
  const urls = [
    renderUrlEntry({ pathname: "/", changefreq: "weekly", priority: "1.0" }),
    renderUrlEntry({ pathname: "/news", changefreq: "weekly", priority: "0.8" }),
    ...posts.map((post) =>
      renderUrlEntry({
        pathname: `/news/${post.slug}`,
        changefreq: "monthly",
        priority: "0.6",
        lastmod: parseLastmod(post.date),
      })
    ),
  ];

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
