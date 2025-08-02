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
    files: ["src/type/supabase.ts"],
    rules: {
      // Disable max-lines for auto-generated Supabase types
      "max-lines": "off",
    },
  },
];

export default eslintConfig;
