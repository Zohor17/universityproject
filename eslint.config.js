import js from "@eslint/js";

const browserGlobals = {
  Array: "readonly",
  Element: "readonly",
  Error: "readonly",
  HTMLInputElement: "readonly",
  HTMLSelectElement: "readonly",
  Intl: "readonly",
  JSON: "readonly",
  Number: "readonly",
  Object: "readonly",
  Set: "readonly",
  String: "readonly",
  document: "readonly",
  localStorage: "readonly",
};

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: browserGlobals,
    },
  },
];
