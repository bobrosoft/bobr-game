const {defineConfig, globalIgnores} = require('eslint/config');

const tsParser = require('@typescript-eslint/parser');
const js = require('@eslint/js');

const {FlatCompat} = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2018,
      sourceType: 'module',
      parserOptions: {},
    },

    extends: compat.extends('plugin:prettier/recommended'),

    files: ['./src/**/*.ts'],

    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      'object-curly-spacing': ['error', 'never'],
      'react/display-name': 0,
      'react/prop-types': 'off',
    },

    settings: {},
  },
  globalIgnores(['**/*.spec.ts']),
]);
