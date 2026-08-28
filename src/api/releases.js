import { getApiBaseUrl } from "./client";
import {
  buildGithubLinksFromApiManifest,
  buildMirrorLinks,
  getDownloadMirrorBase,
  normalizeReleaseData,
  RELEASE_LINK_KEYS,
} from "../lib/releaseDownloads";

const RELEASE_META_PATH = "/releases/latest.json";

export function getReleaseMirrorBase(override) {
  const explicit = override ?? import.meta.env.VITE_DOWNLOAD_MIRROR_BASE;
  if (explicit === false || explicit === "false" || explicit === "0") {
    return "";
  }

  if (explicit && String(explicit).trim()) {
    return getDownloadMirrorBase(explicit);
  }

  return `${getApiBaseUrl()}/releases`;
}

async function fetchJson(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`release_meta_${response.status}`);
    }
    return response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function fetchApiReleaseMeta(mirrorBase = getReleaseMirrorBase()) {
  const base = getDownloadMirrorBase(mirrorBase);
  if (!base) throw new Error("release_mirror_disabled");
  return fetchJson(`${base}/latest.json`);
}

export async function fetchApiReleaseManifest(version, mirrorBase = getReleaseMirrorBase()) {
  const base = getDownloadMirrorBase(mirrorBase);
  const tag = String(version || "").replace(/^v/i, "");
  if (!base || !tag) throw new Error("release_manifest_unavailable");
  return fetchJson(`${base}/v${tag}/latest.json`);
}

export async function fetchReleaseDataFromApi(options = {}) {
  const mirrorBase = getReleaseMirrorBase(options.runtimeMirrorBase);
  const fallbackLinks = options.fallbackLinks || {};
  const meta = await fetchApiReleaseMeta(mirrorBase);
  const version = String(meta?.version || "").replace(/^v/i, "");

  let githubLinks = { ...fallbackLinks };
  try {
    const manifest = await fetchApiReleaseManifest(version, mirrorBase);
    githubLinks = {
      ...githubLinks,
      ...buildGithubLinksFromApiManifest(manifest),
    };
  } catch {
  }

  const mirrors = buildMirrorLinks(githubLinks, version, mirrorBase);

  return normalizeReleaseData(
    {
      stars: 0,
      downloads: 0,
      version,
      links: githubLinks,
      mirrors,
    },
    { fallbackLinks, runtimeMirrorBase: mirrorBase }
  );
}

export function mergeReleaseData(primary, apiFallback) {
  if (!apiFallback) return primary;

  const mergedGithubLinks = { ...apiFallback.githubLinks };
  for (const key of RELEASE_LINK_KEYS) {
    if (primary.githubLinks?.[key]) {
      mergedGithubLinks[key] = primary.githubLinks[key];
    }
  }

  const version = primary.version || apiFallback.version;
  const mirrorBase = getReleaseMirrorBase();
  const mirrors =
    primary.mirrors ||
    apiFallback.mirrors ||
    buildMirrorLinks(mergedGithubLinks, version, mirrorBase);

  return normalizeReleaseData(
    {
      stars: primary.stars || apiFallback.stars,
      downloads: primary.downloads || apiFallback.downloads,
      version,
      links: mergedGithubLinks,
      mirrors,
    },
    { fallbackLinks: apiFallback.githubLinks, runtimeMirrorBase: mirrorBase }
  );
}
