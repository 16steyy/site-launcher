import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getRouteKind, localizePath, normalizePath } from "../../src/routing.js";
import { GITHUB_RELEASES_URL } from "../../src/seo/config.js";
import { ROOT } from "./news.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function link(href, text) {
  return `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`;
}

function markdownFile(dir, locale) {
  const file = resolve(ROOT, `src/content/${dir}/${locale}.md`);
  const fallback = resolve(ROOT, `src/content/${dir}/en.md`);
  let source;
  try {
    source = readFileSync(file, "utf8");
  } catch {
    source = readFileSync(fallback, "utf8");
  }
  return renderToStaticMarkup(createElement(Markdown, { remarkPlugins: [remarkGfm] }, source));
}

function renderNav(m, href) {
  const items = [
    ["/", m.nav?.home],
    ["/news", m.nav?.news],
    ["/themes", m.nav?.themes],
    ["/documentation", m.footer?.documentation],
    ["/status", m.footer?.status],
    ["/privacy", m.footer?.privacy],
  ].filter(([, label]) => label);
  return `<nav aria-label="${escapeHtml(m.nav?.pages)}"><ul>${items
    .map(([path, label]) => `<li>${link(href(path), label)}</li>`)
    .join("")}</ul></nav>`;
}

function renderHome(m, news, href) {
  const parts = [
    `<h1>16Launcher</h1>`,
    `<p>${escapeHtml(`${m.hero?.taglineHighlight || ""}${m.hero?.taglineRest || ""}`)}</p>`,
    `<p>${escapeHtml(m.meta?.description)}</p>`,
    `<p>${link(GITHUB_RELEASES_URL, m.hero?.install)}</p>`,
  ];

  const features = m.features || [];
  if (features.length) {
    parts.push(
      `<section><h2>${escapeHtml(m.nav?.features)}</h2>${features
        .map((f) => `<h3>${escapeHtml(f.title)}</h3><p>${escapeHtml(f.text)}</p>`)
        .join("")}</section>`
    );
  }

  const caps = m.capabilities;
  if (caps?.groups?.length) {
    parts.push(
      `<section><h2>${escapeHtml(caps.title)}</h2><p>${escapeHtml(caps.subtitle)}</p>${caps.groups
        .map(
          (g) =>
            `<h3>${escapeHtml(g.title)}</h3><ul>${g.items
              .map((item) => `<li>${escapeHtml(item)}</li>`)
              .join("")}</ul>`
        )
        .join("")}</section>`
    );
  }

  const integrations = m.integrations;
  if (integrations?.groups) {
    parts.push(
      `<section><h2>${escapeHtml(integrations.title)}</h2><p>${escapeHtml(
        integrations.subtitle
      )}</p>${Object.values(integrations.groups)
        .map((g) => `<h3>${escapeHtml(g.title)}</h3><p>${escapeHtml(g.text)}</p>`)
        .join("")}</section>`
    );
  }

  const posts = (news?.posts || []).slice(0, 3);
  if (posts.length) {
    parts.push(
      `<section><h2>${escapeHtml(m.latestNews?.title)}</h2><ul>${posts
        .map((post) => `<li>${link(href(`/news/${post.slug}`), post.title)}</li>`)
        .join("")}</ul></section>`
    );
  }

  const faq = m.faq?.items || [];
  if (faq.length) {
    parts.push(
      `<section><h2>${escapeHtml(m.faq.title)}</h2>${faq
        .map((item) => `<h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p>`)
        .join("")}</section>`
    );
  }

  parts.push(
    `<section><h2>${escapeHtml(m.download?.title)}</h2><p>${link(
      GITHUB_RELEASES_URL,
      m.download?.allReleases
    )}</p></section>`
  );

  return parts.join("");
}

function renderNewsList(config, news, href) {
  const posts = news?.posts || [];
  return `<h1>${escapeHtml(config.heading)}</h1><p>${escapeHtml(config.description)}</p><ul>${posts
    .map(
      (post) =>
        `<li><h2>${link(href(`/news/${post.slug}`), post.title)}</h2>${
          post.date ? `<p><time>${escapeHtml(post.date)}</time></p>` : ""
        }${post.excerpt ? `<p>${escapeHtml(post.excerpt)}</p>` : ""}</li>`
    )
    .join("")}</ul>`;
}

function renderArticle(config, m, href) {
  const article = config.article;
  if (!article) return `<h1>${escapeHtml(config.heading)}</h1><p>${escapeHtml(config.description)}</p>`;
  return `<article><h1>${escapeHtml(article.title)}</h1>${
    article.date ? `<p><time>${escapeHtml(article.date)}</time></p>` : ""
  }<p>${escapeHtml(config.description)}</p></article><p>${link(href("/news"), m.latestNews?.viewAll)}</p>`;
}

export function renderStaticBody({ config: seo, messages: m, news }) {
  const suffix = m.seo?.titleSuffix || " — 16Launcher";
  const heading = seo.title.endsWith(suffix) ? seo.title.slice(0, -suffix.length) : seo.title;
  const config = { ...seo, heading };
  const href = (path) => localizePath(path, config.locale);
  const route = getRouteKind(normalizePath(config.pathname));

  let main;
  if (route === "home") {
    main = renderHome(m, news, href);
  } else if (route === "news") {
    main = renderNewsList(config, news, href);
  } else if (route === "article") {
    main = renderArticle(config, m, href);
  } else if (route === "documentation") {
    main = markdownFile("documentation", config.locale);
  } else if (route === "privacy") {
    main = markdownFile("privacy", config.locale);
  } else {
    main = `<h1>${escapeHtml(config.heading)}</h1><p>${escapeHtml(config.description)}</p>`;
  }

  return `<div class="seo-static">${renderNav(m, href)}<main>${main}</main><footer><p>${escapeHtml(
    m.footer?.disclaimer
  )}</p></footer></div>`;
}
