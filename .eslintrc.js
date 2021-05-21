module.exports = {
  extends: [
    "@jdf221/eslint-config-typescript",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  rules: {
    "unicorn/prefer-regexp-test": "off",
    "@typescript-eslint/prefer-nullish-coalescing": ["error"],
    "unicorn/prevent-abbreviations": [
      "error",
      {
        replacements: { dev: false },
      },
    ],
    "unicorn/import-style": [
      "error",
      {
        styles: {
          path: {
            named: true,
          },
        },
      },
    ],
  },
};
