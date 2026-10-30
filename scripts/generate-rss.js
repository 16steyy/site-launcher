import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { SITE_NAME, SITE_URL } from "../src/seo/config.js";
import { localizedUrl } from "../src/seo/urls.js";
import { escapeXml, loadMessages, loadNews, ROOT } from "./lib/news.js";

const FEED_LOCALE = "ru";
const MAX_ITEMS = 30;

function toRfc822(dateStr) {
  const parsed = Date.parse(dateStr || "");
  return Number.isNaN(parsed) ? "" : new Date(parsed).toUTCString();
}

function renderItem(post) {
  const link = localizedUrl(`/news/${post.slug}`, FEED_LOCALE);
  const pubDate = toRfc822(post.date);
  const html = [
    post.cover ? `<p><img src="${escapeXml(post.cover)}" alt="" /></p>` : "",
    post.excerpt ? `<p>${escapeXml(post.excerpt)}</p>` : "",
  ].join("");

  return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>${pubDate ? `\n      <pubDate>${pubDate}</pubDate>` : ""}
      <description>${escapeXml(post.excerpt || post.title)}</description>
      <content:encoded><![CDATA[${html}]]></content:encoded>${post.version ? `\n      <category>${escapeXml(post.version)}</category>` : ""}${post.cover ? `\n      <media:content url="${escapeXml(post.cover)}" medium="image" />` : ""}
    </item>`;
}

async function generateRss() {
  const news = await loadNews();
  const messages = loadMessages(FEED_LOCALE);
  const posts = [...news.posts]
    .sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0))
    .slice(0, MAX_ITEMS);

  const title = `${SITE_NAME} — ${news.page?.title || messages.news.defaultTitle}`;
  const description = messages.news.defaultSubtitle;
  const lastBuild = toRfc822(posts[0]?.date) || new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(localizedUrl("/news", FEED_LOCALE))}</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(description)}</description>
    <language>${FEED_LOCALE}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <image>
      <url>${SITE_URL}/icon.png</url>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(localizedUrl("/news", FEED_LOCALE))}</link>
    </image>
${posts.map(renderItem).join("\n")}
  </channel>
</rss>
`;

  const outputPath = resolve(ROOT, "public/rss.xml");
  writeFileSync(outputPath, xml, "utf8");
  console.log(`RSS generated: ${outputPath} (${posts.length} items)`);
}

generateRss().catch((error) => {
  console.error("Failed to generate RSS:", error);
  process.exit(1);
});
