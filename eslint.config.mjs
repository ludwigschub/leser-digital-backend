import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    // files: ["**/*.{ts}"],
    ignores: [
      "coverage",
      "node_modules",
      "src/generated/**/*",
      "jest.config.js",
    ],
    languageOptions: {
      ecmaVersion: 2017,
      globals: globals.node,
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      "max-len": ["error", { code: 120 }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
      "import/order": [
        1,
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            {
              pattern: "express",
              group: "external",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["express"],
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
        },
      ],
    },
  }
);
