import { useMemo } from "react";

import { usePageSeo } from "../hooks/usePageSeo";
import { useI18n } from "../i18n/I18nProvider";
import { getRouteKind } from "../routing";

export default function AppSeo({ path, news, releaseVersion }) {
  const { locale, messages } = useI18n();

  const seoConfig = useMemo(() => {
    const suffix = messages.seo?.titleSuffix || " — 16Launcher";

    if (path === "/news") {
      const title = `${news.page?.title || messages.news.defaultTitle}${suffix}`;
      const description = news.page?.subtitle || messages.news.defaultSubtitle;
      return {
        locale,
        pathname: "/news",
        title,
        description,
        ogType: "website",
        jsonLdType: null,
      };
    }

    if (getRouteKind(path) === "not-found") {
      return {
        locale,
        pathname: path,
        title: `${messages.notFoundPage?.title || "404"}${suffix}`,
        description:
          messages.seo?.pageNotFoundDescription || messages.notFoundPage?.description,
        ogType: "website",
        noindex: true,
        jsonLdType: null,
      };
    }

    if (path.startsWith("/news/")) {
      const slug = path.replace("/news/", "");
      const post = (news.posts || []).find((item) => item.slug === slug);

      if (!post) {
        return {
          locale,
          pathname: path,
          title: `${messages.news.notFound}${suffix}`,
          description: messages.seo?.articleNotFoundDescription || messages.news.notFound,
          ogType: "website",
          noindex: true,
          jsonLdType: null,
        };
      }

      const description = post.excerpt || messages.news.defaultSubtitle;
      return {
        locale,
        pathname: path,
        title: `${post.title}${suffix}`,
        description,
        image: post.cover || undefined,
        ogType: "article",
        jsonLdType: "article",
        article: {
          title: post.title,
          description,
          date: post.date,
          version: post.version,
        },
      };
    }

    return {
      locale,
      pathname: "/",
      title: messages.meta.title,
      description: messages.meta.description,
      ogType: "website",
      jsonLdType: "software",
      releaseVersion,
    };
  }, [path, news, locale, messages, releaseVersion]);

  usePageSeo(seoConfig);
  return null;
}
