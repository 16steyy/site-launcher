import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MAX_HISTORY_ENTRIES = 20;

function parseArgs(argv) {
  const args = {};

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];

    if (key === "--id" && value) {
      args.id = value;
      i += 1;
    } else if (key === "--meta" && value) {
      args.meta = value;
      i += 1;
    }
  }

  return args;
}

function todayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

function normalizeVersion(value) {
  return String(value || "1.0")
    .trim()
    .replace(/^v/i, "");
}

function loadCatalog(catalogPath) {
  if (!existsSync(catalogPath)) {
    return {
      version: 1,
      themes: [],
    };
  }

  return JSON.parse(readFileSync(catalogPath, "utf8"));
}

function collectFiles(directory, rootDirectory = directory) {
  if (!existsSync(directory)) {
    return [];
  }

  const result = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = resolve(directory, entry.name);
    const relativePath = relative(rootDirectory, absolutePath).replaceAll("\\", "/");

    if (entry.name.startsWith(".")) {
      continue;
    }

    if (entry.isDirectory()) {
      result.push(...collectFiles(absolutePath, rootDirectory));
    } else {
      result.push(relativePath);
    }
  }

  return result.sort();
}

function dedupeThemesById(themes) {
  const byId = new Map();

  for (const theme of themes) {
    if (!theme?.id) continue;
    const prev = byId.get(theme.id);
    if (!prev) {
      byId.set(theme.id, theme);
      continue;
    }

    const prevScore =
      (Array.isArray(prev.files) ? prev.files.length : 0) +
      (Array.isArray(prev.history) ? prev.history.length : 0) +
      (prev.preview ? 2 : 0);
    const nextScore =
      (Array.isArray(theme.files) ? theme.files.length : 0) +
      (Array.isArray(theme.history) ? theme.history.length : 0) +
      (theme.preview ? 2 : 0);

    const prevDate = String(prev.updated_at || prev.published_at || "");
    const nextDate = String(theme.updated_at || theme.published_at || "");

    if (nextDate > prevDate || (nextDate === prevDate && nextScore >= prevScore)) {
      byId.set(theme.id, {
        ...prev,
        ...theme,
        first_published_at:
          prev.first_published_at ||
          theme.first_published_at ||
          prev.published_at ||
          theme.published_at,
        history: mergeHistory(prev.history, theme.history),
      });
    }
  }

  return [...byId.values()];
}

function mergeHistory(a, b) {
  const merged = [];
  const seen = new Set();

  for (const item of [...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])]) {
    const version = normalizeVersion(item?.version);
    if (!version || seen.has(version)) continue;
    seen.add(version);
    merged.push({
      version,
      date: item.date || todayIsoDate(),
      description: String(item.description || "").trim(),
    });
  }

  return merged.slice(0, MAX_HISTORY_ENTRIES);
}

function addVersionToHistory(existingTheme, currentVersion, currentDate) {
  const existingHistory = Array.isArray(existingTheme?.history)
    ? [...existingTheme.history]
    : [];

  const previousVersion = normalizeVersion(existingTheme?.version);

  if (
    previousVersion &&
    previousVersion !== currentVersion &&
    !existingHistory.some((item) => normalizeVersion(item.version) === previousVersion)
  ) {
    existingHistory.unshift({
      version: previousVersion,
      date:
        existingTheme.updated_at ||
        existingTheme.published_at ||
        currentDate,
      description: String(existingTheme.changelog || "").trim(),
    });
  }

  return existingHistory.slice(0, MAX_HISTORY_ENTRIES);
}

function sortThemes(themes) {
  return [...themes].sort((a, b) => {
    const dateA = String(a.updated_at || a.published_at || "");
    const dateB = String(b.updated_at || b.published_at || "");
    return dateB.localeCompare(dateA);
  });
}

function main() {
  const { id, meta } = parseArgs(process.argv);

  if (!id || !meta) {
    console.error(
      "Usage: node scripts/update-themes-json.js --id <theme-id> --meta <path/to/theme.json>"
    );
    process.exit(1);
  }

  const metaPath = resolve(ROOT, meta);
  const catalogPath = resolve(ROOT, "public/data/themes.json");
  const themeDir = resolve(ROOT, "public/themes", id);

  if (!existsSync(metaPath)) {
    console.error(`theme.json not found: ${metaPath}`);
    process.exit(1);
  }

  if (!existsSync(themeDir)) {
    console.error(`Theme directory not found: ${themeDir}`);
    process.exit(1);
  }

  const themeMeta = JSON.parse(readFileSync(metaPath, "utf8"));
  const catalog = loadCatalog(catalogPath);
  let themes = dedupeThemesById(
    Array.isArray(catalog.themes) ? catalog.themes : []
  );

  const currentDate = todayIsoDate();
  const currentVersion = normalizeVersion(themeMeta.version);
  const changelog = String(themeMeta.changelog || themeMeta.notes || "").trim();
  const existingIndex = themes.findIndex((item) => item.id === id);
  const existingTheme = existingIndex >= 0 ? themes[existingIndex] : null;

  const previewPath = resolve(themeDir, "preview.png");
  const files = collectFiles(themeDir);

  const history = addVersionToHistory(
    existingTheme,
    currentVersion,
    currentDate
  );

  const firstPublishedAt =
    existingTheme?.first_published_at ||
    existingTheme?.published_at ||
    currentDate;

  const versionChanged =
    !existingTheme ||
    normalizeVersion(existingTheme.version) !== currentVersion;

  const entry = {
    id,
    name: themeMeta.name || id,
    author: themeMeta.author || existingTheme?.author || "",
    description: themeMeta.description || "",
    version: currentVersion,
    preview: existsSync(previewPath)
      ? `/themes/${id}/preview.png`
      : null,
    download: `/themes/${id}/download.zip`,
    files,
    history,
    first_published_at: firstPublishedAt,
    published_at: firstPublishedAt,
    updated_at: currentDate,
  };

  if (changelog) {
    entry.changelog = changelog;
  }

  if (existingIndex >= 0) {
    themes[existingIndex] = entry;
  } else {
    themes.push(entry);
  }

  themes = sortThemes(dedupeThemesById(themes));

  const output = {
    version: catalog.version || 1,
    themes,
  };

  writeFileSync(
    catalogPath,
    `${JSON.stringify(output, null, 2)}\n`,
    "utf8"
  );

  console.log(
    `Updated catalog: ${catalogPath} (${themes.length} themes)`
  );

  console.log(`Theme: ${id}`);
  console.log(`Version: ${currentVersion}${versionChanged ? " (changed)" : " (same)"}`);
  console.log(`Files: ${files.length}`);
  console.log(`History entries: ${history.length}`);
}

main();
