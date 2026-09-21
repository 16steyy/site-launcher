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

    // Скрытые служебные файлы не показываем пользователям.
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

function addVersionToHistory(existingTheme, currentVersion, currentDate) {
  const existingHistory = Array.isArray(existingTheme?.history)
    ? existingTheme.history
    : [];

  const previousVersion = existingTheme?.version;

  if (
    previousVersion &&
    previousVersion !== currentVersion &&
    !existingHistory.some((item) => item.version === previousVersion)
  ) {
    existingHistory.unshift({
      version: previousVersion,
      date: existingTheme.published_at || currentDate,
      description: existingTheme.description || "",
    });
  }

  return existingHistory;
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
  const themes = Array.isArray(catalog.themes)
    ? [...catalog.themes]
    : [];

  const currentDate = todayIsoDate();
  const currentVersion = String(themeMeta.version || "1.0");
  const existingIndex = themes.findIndex((item) => item.id === id);
  const existingTheme = existingIndex >= 0 ? themes[existingIndex] : null;

  const previewPath = resolve(themeDir, "preview.png");
  const files = collectFiles(themeDir);

  const history = addVersionToHistory(
    existingTheme,
    currentVersion,
    currentDate
  );

  const entry = {
    ...(existingTheme || {}),
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
    published_at: currentDate,
  };

  if (existingIndex >= 0) {
    themes[existingIndex] = entry;
  } else {
    themes.push(entry);
  }

  themes.sort((a, b) =>
    String(b.published_at).localeCompare(String(a.published_at))
  );

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
  console.log(`Version: ${currentVersion}`);
  console.log(`Files: ${files.length}`);
  console.log(`History entries: ${history.length}`);
}

main();