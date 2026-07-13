import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["/favicon/favicon.ico"],
      manifest: {
        name: "ChatXin",
        short_name: "ChatXin",
        description: "Connect. Chat. Instantly.",
        theme_color: "#f2a93b",
        background_color: "#fff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/favicon/android-icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/favicon/android-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
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
});
