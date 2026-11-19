import js from '@eslint/js';
import globals from 'globals';

export default [
  // yunan-invite is a generated single-file page (index.html is built by its src/build.py).
  { ignores: ['node_modules/**', 'yunan-invite/**'] },
  js.configs.recommended,
  {
    rules: {
      complexity: ['error', 6],
      'max-depth': ['error', 3],
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
    },
  },
  {
    // Page scripts load as classic <script> tags in the browser.
    files: ['*-invite/**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: { ...globals.browser } },
  },
  {
    files: ['tests/**/*.mjs', '*.mjs'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node } },
  },
];
