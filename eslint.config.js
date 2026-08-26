import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['dist', 'node_modules', 'functions'] },
  { languageOptions: { globals: {
    window: 'readonly', document: 'readonly', navigator: 'readonly', localStorage: 'readonly', crypto: 'readonly', URL: 'readonly', fetch: 'readonly', self: 'readonly', caches: 'readonly', SVGSVGElement: 'readonly', HTMLFormElement: 'readonly',
  } } },
  eslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: { parser: tsParser },
    plugins: { '@typescript-eslint': tsPlugin, 'react-hooks': reactHooks },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
