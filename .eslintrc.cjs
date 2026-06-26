module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    /* JS (no-TypeScript) R3F codebase — PropTypes are not used, so the legacy
       validator is pure noise (~375 false positives). Disable it. */
    'react/prop-types': 'off',
    /* Cosmetic in a personal portfolio; apostrophes/quotes render fine. */
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off',
    /* Dev-only Fast-Refresh hint; not a runtime/build concern. */
    'react-refresh/only-export-components': 'off',
    /* Flag genuinely-dead imports/vars, but allow intentionally-unused function
       args (positional map/callback params like `(item, i) =>`). */
    'no-unused-vars': ['error', { args: 'none' }],
  },
  overrides: [
    {
      /* Node-context config + tooling files use process/module/require. */
      files: ['*.config.js', '*.config.cjs', '*.cjs', 'playwright.config.js', 'vite.config.*'],
      env: { node: true },
    },
  ],
}
