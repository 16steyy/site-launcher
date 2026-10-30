import { getRouteKind, normalizePath } from "../routing.js";

const SIMPLE_PAGES = {
  themes: (m) => ({
    title: m.themes?.title || "Themes",
    description: m.themes?.subtitle,
  }),
  "themes-upload": (m) => ({
    title: m.themes?.uploadTitle || "Upload theme",
    description: m.themes?.uploadHint || m.themes?.subtitle,
    noindex: true,
  }),
  account: (m) => ({
    title: m.account?.title || "Account",
    description: m.themes?.loginRequired,
    noindex: true,
  }),
  "admin-news": (m) => ({
    title: m.newsAdmin?.title || "News admin",
    description: m.meta.description,
    noindex: true,
  }),
  privacy: (m) => ({
    title: m.privacy?.title || "Privacy Policy",
    description: m.privacy?.description,
  }),
  documentation: (m) => ({
    title: m.documentation?.title || "Documentation",
    description: m.documentation?.description,
  }),
  status: (m) => ({
    title: m.status?.title || "Status",
    description: m.status?.description,
  }),
};

export function buildSeoConfig({ path: rawPath, locale, messages, news, releaseVersion }) {
  const path = normalizePath(rawPath);
  const route = getRouteKind(path);
  const suffix = messages.seo?.titleSuffix || " — 16Launcher";
  const base = { locale, pathname: path, ogType: "website", jsonLdType: null };

  if (route === "home") {
    return {
      ...base,
      title: messages.meta.title,
      description: messages.meta.description,
      jsonLdType: "software",
      releaseVersion,
      faq: messages.faq?.items,
    };
  }

  if (route === "news") {
    const remotePage = locale === "ru" ? news?.page : null;
    return {
      ...base,
      title: `${remotePage?.title || messages.news.defaultTitle}${suffix}`,
      description: remotePage?.subtitle || messages.news.defaultSubtitle,
    };
  }

  if (route === "article") {
    const slug = path.slice("/news/".length);
    const post = (news?.posts || []).find((item) => item.slug === slug);

    if (!post) {
      return {
        ...base,
        title: `${messages.news.notFound}${suffix}`,
        description: messages.seo?.articleNotFoundDescription || messages.news.notFound,
        noindex: true,
      };
    }

    const description = post.excerpt || messages.news.defaultSubtitle;
    return {
      ...base,
      title: `${post.title}${suffix}`,
      description,
      image: post.cover || undefined,
      ogType: "article",
      jsonLdType: "article",
      breadcrumbs: { home: messages.nav?.home, news: messages.nav?.news },
      article: {
        title: post.title,
        description,
        date: post.date,
        version: post.version,
      },
    };
  }

  if (SIMPLE_PAGES[route]) {
    const page = SIMPLE_PAGES[route](messages);
    return {
      ...base,
      ...page,
      title: `${page.title}${suffix}`,
      description: page.description || messages.meta.description,
    };
  }

  return {
    ...base,
    title: `${messages.notFoundPage?.title || "404"}${suffix}`,
    description: messages.seo?.pageNotFoundDescription || messages.notFoundPage?.description,
    noindex: true,
  };
}
