import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default defineConfig(
  [
    {
      extends: [
        eslint.configs.recommended,
        ...tseslint.configs.recommended,
        prettier,
      ],
      files: ["src/**/*.{ts,tsx}"],
    },
  ],
  globalIgnores(["build/", "node_modules/", "src/components/ui/"])
);
