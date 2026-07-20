import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "northstarr";
const base = process.env.GITHUB_ACTIONS ? `/${repoName}/` : "/";

// Northstar — personal operating system
// PWA is configured so the app can be installed and used offline.
// Future: swap the manifest icons for real artwork before shipping.
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Northstar",
        short_name: "Northstar",
        description: "Personal operating system — execution, not planning.",
        theme_color: "#0a0c0f",
        background_color: "#0a0c0f",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ]
});
