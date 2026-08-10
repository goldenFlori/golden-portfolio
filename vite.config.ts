import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// BASE_PATH is set by the GitHub Actions workflow so the site works at
// https://<user>.github.io/<repo>/ without hardcoding the repo name.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.BASE_PATH ?? "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          heroui: ["@heroui/react"],
          vendor: ["react", "react-dom", "@tanstack/react-query", "motion"],
        },
      },
    },
  },
});
