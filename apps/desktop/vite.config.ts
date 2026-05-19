import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true
      },
      "/health": {
        target: "http://localhost:8080",
        changeOrigin: true
      },
      "/auth": {
        target: "http://localhost:8080",
        changeOrigin: true
      },
      "/users": {
        target: "http://localhost:8080",
        changeOrigin: true
      },
      "/customers": {
        target: "http://localhost:8080",
        changeOrigin: true
      },
      "/customer-edit-requests": {
        target: "http://localhost:8080",
        changeOrigin: true
      },
      "/dashboard": {
        target: "http://localhost:8080",
        changeOrigin: true
      },
      "/audit": {
        target: "http://localhost:8080",
        changeOrigin: true
      },
      "/quotes": {
        target: "http://localhost:8080",
        changeOrigin: true
      },
      "/contracts": {
        target: "http://localhost:8080",
        changeOrigin: true
      },
      "/scopes-of-work": {
        target: "http://localhost:8080",
        changeOrigin: true
      },
      "/document-templates": {
        target: "http://localhost:8080",
        changeOrigin: true
      },
      "/generated-documents": {
        target: "http://localhost:8080",
        changeOrigin: true
      }
    }
  }
});