import { SUPPORTED_LOCALES } from "./i18n/config.js";

export const LOCATION_CHANGE_EVENT = "site16:location-change";

export function splitLocalePath(pathname) {
  const raw = pathname || "/";
  const match = raw.match(/^\/([a-z]{2})(?=\/|$)(.*)$/);
  if (match && SUPPORTED_LOCALES.includes(match[1])) {
    return { locale: match[1], path: normalizePath(match[2]) };
  }
  return { locale: null, path: normalizePath(raw) };
}

export function normalizePath(pathname) {
  return (pathname || "/").replace(/\/+$/, "") || "/";
}

export function localizePath(target, locale) {
  const url = new URL(target || "/", "http://local");
  const { path } = splitLocalePath(url.pathname);
  const localized = path === "/" ? `/${locale}/` : `/${locale}${path}/`;
  return `${localized}${url.search}${url.hash}`;
}

export function changeLocation(url, { replace = false } = {}) {
  const method = replace ? "replaceState" : "pushState";
  window.history[method](replace ? window.history.state : {}, "", url);
  window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
}

export function getRouteKind(pathname) {
  const path = normalizePath(pathname);
  if (path === "/") return "home";
  if (path === "/news") return "news";
  if (path.startsWith("/news/") && path.length > "/news/".length) return "article";
  if (path === "/themes") return "themes";
  if (path === "/themes/upload") return "themes-upload";
  if (path === "/account") return "account";
  if (path === "/privacy") return "privacy";
  if (path === "/admin/news") return "admin-news";
  if (path === "/documentation") return "documentation";
  if (path === "/status") return "status";
  return "not-found";
}

export const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/news", changefreq: "weekly", priority: "0.8" },
  { path: "/themes", changefreq: "weekly", priority: "0.7" },
  { path: "/documentation", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.4" },
  { path: "/status", changefreq: "daily", priority: "0.4" },
  { path: "/themes/upload", noindex: true },
  { path: "/account", noindex: true },
  { path: "/admin/news", noindex: true },
];
