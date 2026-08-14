import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-404-for-github-pages",
      closeBundle() {
        const distDir = resolve(__dirname, "dist");
        const indexHtml = resolve(distDir, "index.html");
        copyFileSync(indexHtml, resolve(distDir, "404.html"));
        // public/themes/ конфликтует с SPA-маршрутом /themes — без index.html GitHub Pages отдаёт 404
        const themesDir = resolve(distDir, "themes");
        mkdirSync(themesDir, { recursive: true });
        copyFileSync(indexHtml, resolve(themesDir, "index.html"));
        const privacyDir = resolve(distDir, "privacy");
        mkdirSync(privacyDir, { recursive: true });
        copyFileSync(indexHtml, resolve(privacyDir, "index.html"));
      },
    },
  ],
  base: "/",
});
