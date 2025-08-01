/** @type {import("prettier").Config} */
module.exports = {
  semi: true,
  singleQuote: false,
  tailwindFunctions: ["clsx", "tw"],
  plugins: ["prettier-plugin-organize-imports", "prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app/globals.css",
};
