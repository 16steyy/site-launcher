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
        for (const route of ["themes", "privacy", "documentation", "status"]) {
          const routeDir = resolve(distDir, route);
          mkdirSync(routeDir, { recursive: true });
          copyFileSync(indexHtml, resolve(routeDir, "index.html"));
        }
      },
    },
  ],
  base: "/",
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
});