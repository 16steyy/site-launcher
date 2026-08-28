export function getRouteKind(pathname) {
  const path = (pathname || "/").replace(/\/+$/, "") || "/";
  if (path === "/" || path === "") return "home";
  if (path === "/news") return "news";
  if (path.startsWith("/news/") && path.length > "/news/".length) return "article";
  if (path === "/themes") return "themes";
  if (path === "/themes/upload") return "themes-upload";
  if (path === "/account") return "account";
  if (path === "/privacy") return "privacy";
  if (path === "/admin/news") return "admin-news";
  return "not-found";
}
