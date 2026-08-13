import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
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
    return { version: 1, themes: [] };
  }
  return JSON.parse(readFileSync(catalogPath, "utf8"));
}

function main() {
  const { id, meta } = parseArgs(process.argv);
  if (!id || !meta) {
    console.error("Usage: node scripts/update-themes-json.js --id <theme-id> --meta <path/to/theme.json>");
    process.exit(1);
  }

  const metaPath = resolve(ROOT, meta);
  const catalogPath = resolve(ROOT, "public/data/themes.json");
  const themeDir = resolve(ROOT, "public/themes", id);

  if (!existsSync(metaPath)) {
    console.error(`theme.json not found: ${metaPath}`);
    process.exit(1);
  }

  const themeMeta = JSON.parse(readFileSync(metaPath, "utf8"));
  const catalog = loadCatalog(catalogPath);
  const themes = Array.isArray(catalog.themes) ? [...catalog.themes] : [];

  const previewPath = resolve(themeDir, "preview.png");
  const entry = {
    id,
    name: themeMeta.name || id,
    author: themeMeta.author || "",
    description: themeMeta.description || "",
    version: themeMeta.version || "1.0",
    preview: existsSync(previewPath) ? `/themes/${id}/preview.png` : null,
    download: `/themes/${id}/download.zip`,
    published_at: todayIsoDate(),
  };

  const existingIndex = themes.findIndex((item) => item.id === id);
  if (existingIndex >= 0) {
    themes[existingIndex] = { ...themes[existingIndex], ...entry };
  } else {
    themes.push(entry);
  }

  themes.sort((a, b) => String(b.published_at).localeCompare(String(a.published_at)));

  const output = {
    version: catalog.version || 1,
    themes,
  };

  writeFileSync(catalogPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Updated catalog: ${catalogPath} (${themes.length} themes)`);
}

main();
