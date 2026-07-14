import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon/favicon.ico",
        "favicon/apple-touch-icon.png",
        "favicon/favicon.svg",
      ],
      manifest: {
        name: "ChatXin",
        short_name: "ChatXin",
        description: "Connect. Chat. Instantly.",
        theme_color: "#f2a93b",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "favicon/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "favicon/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "favicon/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "favicon/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "wide",
            label: "ChatXin Desktop",
          },
          {
            src: "favicon/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "narrow",
            label: "ChatXin Mobile",
          },
        ],
      },
    }),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://chatxin-backend.onrender.com",
        // target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "https://chatxin-backend.onrender.com",
        // target: "http://localhost:3001",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  define: {
    global: "globalThis",
  },
});
