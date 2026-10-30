import {
  BOOSTY_URL,
  DISCORD_INVITE_URL,
  GITHUB_REPO_URL,
  TELEGRAM_URL,
} from "../api/community.js";
import { DEFAULT_OG_IMAGE_PATH, GITHUB_RELEASES_URL, SITE_NAME, SITE_URL } from "./config.js";
import { absoluteUrl, localizedUrl } from "./urls.js";

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

function parseArticleDate(dateStr) {
  if (!dateStr) return undefined;
  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) return undefined;
  return new Date(parsed).toISOString();
}

function buildOrganization() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icon.png"),
    sameAs: [GITHUB_REPO_URL, DISCORD_INVITE_URL, TELEGRAM_URL, BOOSTY_URL],
  };
}

function buildWebSite(locale) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: locale,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

function buildSoftwareApplication({ description, releaseVersion, url, locale }) {
  return {
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "GameApplication",
    applicationSubCategory: "Minecraft launcher",
    operatingSystem: "Windows, macOS, Linux",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description,
    url,
    inLanguage: locale,
    image: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    screenshot: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    downloadUrl: GITHUB_RELEASES_URL,
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    ...(releaseVersion ? { softwareVersion: releaseVersion } : {}),
  };
}

function buildFaqPage(items) {
  const questions = (items || []).filter((item) => item?.question && item?.answer);
  if (!questions.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

function buildNewsArticle({ title, description, url, image, datePublished, version, locale }) {
  return {
    "@type": "NewsArticle",
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    inLanguage: locale,
    image: absoluteUrl(image || DEFAULT_OG_IMAGE_PATH),
    datePublished: datePublished || undefined,
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    ...(version ? { version } : {}),
  };
}

function buildBreadcrumbs(crumbs) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export function buildJsonLd(config, canonicalUrl) {
  const locale = config.locale;

  if (config.jsonLdType === "article" && config.article) {
    const crumbs = config.breadcrumbs || {};
    return {
      "@context": "https://schema.org",
      "@graph": [
        buildOrganization(),
        buildNewsArticle({
          title: config.article.title,
          description: config.article.description || config.description,
          url: canonicalUrl,
          image: config.image,
          datePublished: parseArticleDate(config.article.date),
          version: config.article.version,
          locale,
        }),
        buildBreadcrumbs([
          { name: crumbs.home || SITE_NAME, url: localizedUrl("/", locale) },
          { name: crumbs.news || "News", url: localizedUrl("/news", locale) },
          { name: config.article.title, url: canonicalUrl },
        ]),
      ],
    };
  }

  if (config.jsonLdType === "software") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        buildOrganization(),
        buildWebSite(locale),
        buildSoftwareApplication({
          description: config.description,
          releaseVersion: config.releaseVersion,
          url: canonicalUrl,
          locale,
        }),
        buildFaqPage(config.faq),
      ].filter(Boolean),
    };
  }

  return null;
}
