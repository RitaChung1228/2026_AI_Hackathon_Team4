import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
<<<<<<< HEAD

export default defineConfig({
  plugins: [react(), tailwindcss()],
=======
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
>>>>>>> b06c164aaed31121740ed3ca1c4c1f17e506a877
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
