export function getRouteKind(pathname) {
  const path = pathname || "/";
  if (path === "/" || path === "") return "home";
  if (path === "/news") return "news";
  if (path.startsWith("/news/") && path.length > "/news/".length) return "article";
  return "not-found";
}
