import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { prerenderPages } from "./scripts/prerender-pages.js";

export default defineConfig({
  plugins: [
    react(),
    {
      // Writes /<locale>/<route>/index.html (plus legacy unprefixed copies and
      // 404.html) with a per-page <head>. See scripts/prerender-pages.js.
      name: "prerender-pages-for-github-pages",
      apply: "build",
      async closeBundle() {
        await prerenderPages(resolve(__dirname, "dist"));
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
