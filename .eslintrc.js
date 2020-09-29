module.exports = {
  root: true,

  parser: '@typescript-eslint/parser',

  plugins: ['@typescript-eslint/eslint-plugin', 'prettier', 'jest', 'react'],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    "plugin:react/recommended"
  ],

  ignorePatterns: [],

  env: {
    jest: true,
  },

  "settings": {
    "react": {
      "version": "detect",
    },
  },

  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    "react/prop-types": "off",
    // "@typescript-eslint/no-unused-vars": "off",
    // XXX: For now I try prettier-plugin-organize-imports,
    // instead of eslint-plugin-unused-imports.
    // "unused-imports/no-unused-imports-ts": "error",
    // "unused-imports/no-unused-vars-ts": [
    //   "warn",
    //   { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
    // ],
  }
};
