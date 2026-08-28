export const DEFAULT_DOWNLOAD_MIRROR_BASE = "https://api.16-launcher.ru/releases";

export const RELEASE_LINK_KEYS = [
  "windows",
  "macos",
  "linuxDeb",
  "linuxRpm",
  "linuxAppImage",
];

const API_PLATFORM_TO_LINK_KEY = {
  "windows-x86_64": "windows",
  "windows-x86_64-nsis": "windows",
  "darwin-aarch64": "macos",
  "darwin-x86_64": "macos",
  "linux-x86_64": "linuxAppImage",
  "linux-x86_64-appimage": "linuxAppImage",
  "linux-x86_64-deb": "linuxDeb",
  "linux-x86_64-rpm": "linuxRpm",
};

export function getDownloadMirrorBase(override) {
  if (override === false || override === "false" || override === "0") {
    return "";
  }

  const value =
    override === undefined || override === null || override === ""
      ? DEFAULT_DOWNLOAD_MIRROR_BASE
      : override;

  // Очищаем лишние слеши и захардкоженные версии в конце URL, если они были переданы
  return String(value)
    .replace(/\/+$/, "")
    .replace(/\/v\d+\.\d+\.\d+$/, "");
}

export function extractFilenameFromDownloadUrl(url) {
  if (!url || typeof url !== "string") return "";
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").pop() || "";
    return decodeURIComponent(filename);
  } catch {
    const withoutQuery = url.split("?")[0];
    return decodeURIComponent(withoutQuery.split("/").pop() || "");
  }
}

export function buildMirrorUrl(mirrorBase, version, filename) {
  const base = getDownloadMirrorBase(mirrorBase);
  const tag = String(version || "").replace(/^v/i, "");
  const file = String(filename || "").replace(/^\/+/, "");
  if (!base || !tag || !file) return "";
  return `${base}/v${tag}/${file}`;
}

export function githubUrlToMirrorUrl(githubUrl, mirrorBase, version) {
  const filename = extractFilenameFromDownloadUrl(githubUrl);
  return buildMirrorUrl(mirrorBase, version, filename);
}

export function buildMirrorLinks(githubLinks, version, mirrorBase) {
  const base = getDownloadMirrorBase(mirrorBase);
  if (!base || !version) return null;

  const mirrors = {};
  let hasMirror = false;

  for (const key of RELEASE_LINK_KEYS) {
    const mirrorUrl = githubUrlToMirrorUrl(githubLinks?.[key], base, version);
    mirrors[key] = mirrorUrl;
    if (mirrorUrl) hasMirror = true;
  }

  return hasMirror ? mirrors : null;
}

export function buildGithubLinksFromApiManifest(manifest) {
  const githubLinks = {};

  for (const [platform, data] of Object.entries(manifest?.platforms || {})) {
    const key = API_PLATFORM_TO_LINK_KEY[platform];
    if (!key || !data?.url || githubLinks[key]) continue;
    githubLinks[key] = data.url;
  }

  return githubLinks;
}

export function resolveDownloadLinks(githubLinks, mirrors) {
  const resolved = {};
  for (const key of RELEASE_LINK_KEYS) {
    const github = githubLinks?.[key] || "";
    const mirror = mirrors?.[key] || "";
    resolved[key] = mirror || github;
  }
  return resolved;
}

export function mapOsToReleaseLinkKey(os, linuxFormat = "linuxAppImage") {
  if (os === "windows") return "windows";
  if (os === "macos") return "macos";
  if (os === "linux") return linuxFormat;
  return "windows";
}

export function pickMainDownloadLink(links, os, fallbackUrl = "") {
  const key = mapOsToReleaseLinkKey(os);
  return links?.[key] || links?.windows || fallbackUrl;
}

export function normalizeReleaseData(input, options = {}) {
  const fallbackLinks = options.fallbackLinks || {};
  const links = input?.links || {};
  const githubLinks = {};

  for (const key of RELEASE_LINK_KEYS) {
    githubLinks[key] = links[key] || fallbackLinks[key] || "";
  }

  const version = String(input?.version || "").replace(/^v/i, "");
  const mirrorBase = getDownloadMirrorBase(options.runtimeMirrorBase);
  const mirrorsFromJson = input?.mirrors || null;
  const mirrors =
    mirrorsFromJson ||
    (mirrorBase && version ? buildMirrorLinks(githubLinks, version, mirrorBase) : null);

  return {
    stars: Number(input?.stars) || 0,
    downloads: Number(input?.downloads) || 0,
    version,
    links: resolveDownloadLinks(githubLinks, mirrors),
    githubLinks,
    mirrors,
  };
}