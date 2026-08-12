import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores(["node_modules/**", "dist/**", "coverage/**"]),

  {
    files: ["src/**/*.ts", "tests/**/*.ts", "vitest.config.ts"],

    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
    ],

    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
        },
      ],
    },
  },

  eslintConfigPrettier,
);
