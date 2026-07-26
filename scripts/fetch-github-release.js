import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OWNER = "launcherdev11";
const REPO = "rust-launcher";
const FALLBACK_RELEASES_URL = `https://github.com/${OWNER}/${REPO}/releases`;
const LATEST_RELEASE_API = `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`;
const RELEASES_API = `https://api.github.com/repos/${OWNER}/${REPO}/releases?per_page=100`;
const REPO_API = `https://api.github.com/repos/${OWNER}/${REPO}`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "../public/github-release.json");

function authHeaders() {
  const token = process.env.GH_STATS_TOKEN || process.env.GITHUB_TOKEN || "";
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "16launcher-site-build",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: authHeaders() });
  if (!response.ok) {
    throw new Error(`${url} → ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function pickAssetUrl(assets, matcher) {
  const found = (assets || []).find((asset) =>
    matcher(String(asset.name || "").toLowerCase())
  );
  return found?.browser_download_url || FALLBACK_RELEASES_URL;
}

function sumReleaseDownloads(assets) {
  return (assets || []).reduce(
    (total, asset) => total + (Number(asset.download_count) || 0),
    0
  );
}

async function fetchTotalReleaseDownloads() {
  let page = 1;
  let total = 0;

  while (page <= 10) {
    const releases = await fetchJson(`${RELEASES_API}&page=${page}`);
    if (!Array.isArray(releases) || !releases.length) break;

    releases.forEach((release) => {
      total += sumReleaseDownloads(release.assets);
    });

    if (releases.length < 100) break;
    page += 1;
  }

  return total;
}

function emptyPayload() {
  return {
    stars: 0,
    downloads: 0,
    version: "",
    links: {
      windows: FALLBACK_RELEASES_URL,
      macos: FALLBACK_RELEASES_URL,
      linuxDeb: FALLBACK_RELEASES_URL,
      linuxRpm: FALLBACK_RELEASES_URL,
      linuxAppImage: FALLBACK_RELEASES_URL,
    },
    updatedAt: new Date().toISOString(),
  };
}

async function main() {
  const payload = emptyPayload();

  try {
    const [release, repo, totalDownloads] = await Promise.all([
      fetchJson(LATEST_RELEASE_API),
      fetchJson(REPO_API),
      fetchTotalReleaseDownloads(),
    ]);

    const assets = release.assets || [];
    payload.stars = Number(repo?.stargazers_count) || 0;
    payload.downloads = totalDownloads;
    payload.version = String(release?.tag_name || "").replace(/^v/i, "");
    payload.links = {
      windows: pickAssetUrl(
        assets,
        (name) => name.endsWith(".exe") || name.endsWith(".msi")
      ),
      macos: pickAssetUrl(
        assets,
        (name) =>
          name.endsWith(".dmg") || name.endsWith(".pkg") || name.includes("mac")
      ),
      linuxDeb: pickAssetUrl(assets, (name) => name.endsWith(".deb")),
      linuxRpm: pickAssetUrl(assets, (name) => name.endsWith(".rpm")),
      linuxAppImage: pickAssetUrl(assets, (name) => name.endsWith(".appimage")),
    };
  } catch (error) {
    console.warn("[fetch-github-release] fallback:", error.message || error);
  }

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(
    `[fetch-github-release] wrote ${OUT_PATH} (stars=${payload.stars}, downloads=${payload.downloads}, version=${payload.version || "—"})`
  );
}

main();
