import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["src/__tests__/setup.ts"],
      globals: true,
      coverage: {
        provider: "istanbul",
        reporter: ["text", "lcov"],
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/**/__tests__/**",
          "src/**/*.test.{ts,tsx}",
          "src/**/*.d.ts",
          "src/main.tsx",
          "src/App.tsx",
        ],
        all: true,
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
  }),
);
