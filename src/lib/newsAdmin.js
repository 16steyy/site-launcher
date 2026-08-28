export function isNewsAdmin(user) {
  if (!user) return false;
  if (user.is_admin === true || user.role === "admin") return true;
  if (Array.isArray(user.roles) && user.roles.includes("admin")) return true;

  const allowlist = String(import.meta.env.VITE_NEWS_ADMIN_NICKNAMES || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (!allowlist.length) return false;
  return allowlist.includes(String(user.nickname || "").trim().toLowerCase());
}

export function slugifyVersion(version) {
  const normalized = String(version || "")
    .trim()
    .replace(/^v/i, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return normalized ? `update-${normalized}` : "";
}

export function slugifyTitle(title) {
  const normalized = String(title || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "news-post";
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function emptyNewsForm() {
  return {
    title: "",
    slug: "",
    version: "",
    date: todayIsoDate(),
    excerpt: "",
    markdown: "",
  };
}
