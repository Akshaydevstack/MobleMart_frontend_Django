import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import compression from "vite-plugin-compression";

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    react(),
    // Compress assets for faster production delivery
    compression({
      algorithm: "brotliCompress", // gzip or brotli
      ext: ".br",
      threshold: 10240, // compress files > 10kb
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Dev server settings
  server: {
    port: 5173,
    open: true,
    watch: {
      ignored: ["**/db.json", "**/*.db.json"],
    },
  },

  // ✅ Build optimizations for production
  build: {
    sourcemap: mode === "development", // disable in production
    minify: "terser", // use terser for smaller bundles
    chunkSizeWarningLimit: 1000, // avoid warnings for large chunks
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          vendor: ["react-router-dom", "axios"],
        },
      },
    },
  },

  // ✅ Define environment variables
define: {},
}));