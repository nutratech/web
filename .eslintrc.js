module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:@typescript-eslint/all",
    "airbnb-base",
    "airbnb-typescript/base",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["react", "@typescript-eslint", "@typescript-eslint/tslint"],
  rules: {
    // Default prettier-ESLint compatibility rules
    // ---------------------------------------------

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
    "operator-linebreak": ["error", "before"],

    // Tweaked rules
    "@typescript-eslint/explicit-member-accessibility": [
      "warn",
      {
        accessibility: "explicit",
        overrides: {
          accessors: "off",
          constructors: "no-public",
          methods: "explicit",
          properties: "explicit",
          parameterProperties: "explicit",
        },
      },
    ],

    // Warning rules [TypeScript - tsc]
    "@typescript-eslint/no-floating-promises": ["warn"],
    "@typescript-eslint/explicit-function-return-type": ["warn"],
    "@typescript-eslint/explicit-module-boundary-types": ["warn"],
    "@typescript-eslint/no-non-null-assertion": ["warn"],
    "@typescript-eslint/no-extraneous-class": ["warn"],

    // Disabled rules
    "no-void": ["off"],
    "@typescript-eslint/prefer-readonly-parameter-types": ["off"],
    "@typescript-eslint/strict-boolean-expressions": ["off"],
    "@typescript-eslint/no-type-alias": [
      "error",
      {
        allowAliases: "in-unions-and-intersections",
        allowCallbacks: "always",
      },
    ],
    "implicit-arrow-linebreak": ["off", "below"],
    "class-methods-use-this": ["off"],
    "import/extensions": [
      "off",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
