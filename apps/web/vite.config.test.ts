/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    include: ["**/__tests__/**/*.{tsx,ts}", "**/*.{spec,test}.{tsx,ts}"],
    coverage: {
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "**/node_modules/**",
        "node_modules/**",
        "src/setupTests.ts",
        "src/components/ui/**",
        "**/dist/**",
        "**/*.d.ts",
      ],
      include: ["src/**/*.{ts,tsx}"],
      all: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
