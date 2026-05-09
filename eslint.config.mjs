import js from '@eslint/js';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/', 'node_modules/']
  },
  js.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.mocha
      }
    },
    rules: {
      'object-curly-spacing': ['error', 'always'],
      'no-unused-vars': 'off',
      'no-control-regex': 'off',
      'no-console': 'off'
    }
  }
];
