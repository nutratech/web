module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: ["plugin:react/recommended", "airbnb", "airbnb-typescript"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["react", "@typescript-eslint"],
  rules: {
    // Default prettier-ESLint compatibility rules
    "max-len": ["warn", 100],
    indent: ["error", 2, { SwitchCase: 1 }],
    // Semi-colons
    semi: ["off"],
    "@typescript-eslint/semi": ["error"],
    // Quotes & comma-dangle
    "@typescript-eslint/quotes": [2, "double"],
    "@typescript-eslint/comma-dangle": [
      "error",
      {
        arrays: "always-multiline",
        objects: "always-multiline",
        imports: "always-multiline",
        exports: "always-multiline",
        functions: "never",
      },
    ],
    "no-console": ["warn", { allow: ["debug", "info", "warn", "error"] }],
    // Getting weird rules
    "object-curly-newline": ["error", { minProperties: 10, consistent: true }],
    "space-before-function-paren": [
      "error",
      {
        anonymous: "always",
        named: "never",
        asyncArrow: "always",
      },
    ],
    "operator-linebreak": ["error", "after"],
  },
};
