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
    // ts rules ignore
    // https://stackoverflow.com/questions/59265981/typescript-eslint-missing-file-extension-ts-import-extensions
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
  },
};
