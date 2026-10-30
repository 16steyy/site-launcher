import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const NEWS_BASE = "https://raw.githubusercontent.com/16steyy/16Launcher-Site-News/main/news/";
const NEWS_INDEX_URL = `${NEWS_BASE}index.json`;

function resolveAsset(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, NEWS_BASE).toString();
}

function normalizeNews(data) {
  const sourceItems = Array.isArray(data?.posts)
    ? data.posts
    : Array.isArray(data?.items)
      ? data.items
      : [];

  return {
    page: data?.page || { title: data?.title || "", subtitle: data?.subtitle || "" },
    posts: sourceItems
      .map((item, index) => {
        const slug = item?.slug || item?.version || `update-${index + 1}`;
        return {
          slug,
          title: item?.title || slug,
          excerpt: item?.excerpt || "",
          date: item?.date || "",
          version: item?.version || "",
          cover: resolveAsset(item?.cover),
        };
      })
      .filter((post) => post.slug),
  };
}

let cached;

export async function loadNews() {
  if (cached) return cached;
  try {
    const response = await fetch(NEWS_INDEX_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`news index → ${response.status}`);
    cached = normalizeNews(await response.json());
  } catch (error) {
    console.warn("[news] remote index unavailable, using fallback:", error.message || error);
    const fallback = JSON.parse(readFileSync(resolve(ROOT, "src/content/news.json"), "utf8"));
    cached = normalizeNews(fallback);
  }
  return cached;
}

export function loadMessages(locale) {
  return JSON.parse(readFileSync(resolve(ROOT, `src/locales/${locale}.json`), "utf8"));
}

export function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export { ROOT };
