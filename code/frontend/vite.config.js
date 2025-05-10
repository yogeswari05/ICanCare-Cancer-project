import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    cors: {
      origin: "http://localhost:5000",
      // methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
      changeOrigin: true,
      secure: false,
    },
  },
  base: '/', 
  preview: {
    port: 80,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
  }
});
