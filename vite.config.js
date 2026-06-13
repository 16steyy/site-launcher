import { copyFileSync } from "node:fs";
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
        copyFileSync(resolve(distDir, "index.html"), resolve(distDir, "404.html"));
      },
    },
  ],
  base: "/",
});
