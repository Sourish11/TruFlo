import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
    build: {
    // Optimize for Vercel deployment
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          animation: ['framer-motion'],
          charts: ['recharts']
        }
      }
    }
  },
  server: {
    proxy: {
      "/api/gemini-proxy": {
        target: "https://generativelanguage.googleapis.com",
        changeOrigin: true,
        secure: true,
        rewrite: () => `/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY || ''}`,
      }
    },
  },
});
