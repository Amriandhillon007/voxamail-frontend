import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import history from "connect-history-api-fallback";
import { fileURLToPath } from "url";
import path from "path";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
    middlewareMode: false,
    proxy: {
      "/auth": "http://localhost:8000",
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
    configureMiddleware(server) {
      server.middlewares.use(
        history({
          disableDotRule: true,
          htmlAcceptHeaders: ["text/html", "application/xhtml+xml"],
          index: "/index.html",
        })
      );
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(root, "./src"), // ✅ Allow @/components style imports
    },
  },
  root: path.resolve(root, "./"),
});
