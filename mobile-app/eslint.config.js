import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  [
    {
      extends: [eslint.configs.recommended, ...tseslint.configs.recommended, prettier],
      files: ["**/*.{ts,tsx}"],
    },
  ],
  globalIgnores([
    "node_modules/",
    ".expo/",
    "ios/",
    "android/",
    "components/ui/",
    "babel.config.js",
    "metro.config.js",
    "tailwind.config.js",
  ])
);
