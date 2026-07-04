import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Caminhos relativos para os assets funcionarem em qualquer subpasta,
  // incluindo o GitHub Pages (ex. https://<user>.github.io/<repo>/).
  base: "./",
  server: {
    port: 5173,
    proxy: {
      // Encaminha as chamadas /api para o backend Express durante o desenvolvimento,
      // evitando problemas de CORS e mantendo a API key apenas no servidor.
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
