import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  ...compat.extends("prettier"), // Disable ESLint rules that conflict with Prettier
  {
    ignores: [
      // Protected primitives folder - NEVER modify
      "src/primitives/**/*",
    ],
  },
  {
    rules: {
      // Enforce file size limits (approximate)
      "max-lines": ["error", { max: 150 }],
      // Enforce consistent imports
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
        },
      ],
    },
  },
  {
    files: ["src/types/supabase.ts"],
    rules: {
      // Disable max-lines for auto-generated Supabase types
      "max-lines": "off",
    },
  },
  {
    files: ["src/common/forms/**/*"],
    rules: {
      // Disable max-lines for form builder components
      // These are core components that need to be comprehensive
      "max-lines": "off",
    },
  },
  {
    files: ["src/primitives/**/*"],
    rules: {
      // COMPLETELY DISABLE ALL LINTING FOR PRIMITIVES FOLDER
      // This folder is protected and should never be modified
      "max-lines": "off",
      "import/order": "off",
      "prettier/prettier": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",
      // Disable ALL rules for primitives
      "*": "off",
    },
  },
];

export default eslintConfig;
