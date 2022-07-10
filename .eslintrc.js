module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["plugin:react/recommended", "airbnb"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint"],
  rules: {
    // Default prettier-ESLint compatibility rules
    indent: ["error", 2, { SwitchCase: 1 }],
    semi: [2, "always", { omitLastInOneLineBlock: true }],
    quotes: [2, "double"],
    "object-curly-newline": [2, { minProperties: 10, consistent: true }],
    "comma-dangle": [
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
    "space-before-function-paren": [
      "error",
      {
        anonymous: "always",
        named: "never",
        asyncArrow: "always",
      },
    ],
    "operator-linebreak": [2, "after"],
  },
};
