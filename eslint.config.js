import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import { multilineIf, namedReactTypes, namedTypePlacement } from './scripts/eslint-rules.mjs'

export default defineConfig([
  globalIgnores(['dist', '.next', 'next-env.d.ts']),
  { linterOptions: { noInlineConfig: true } },
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
    plugins: { project: { rules: { 'multiline-if': multilineIf, 'named-react-types': namedReactTypes, 'type-placement': namedTypePlacement } } },
    languageOptions: { globals: { ...globals.browser, ...globals.node }, parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: {
      'project/multiline-if': 'error',
      'max-lines': ['error', { max: 400, skipBlankLines: false, skipComments: false }],
      'max-statements-per-line': ['error', { max: 1 }],
    },
  },
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json', './tsconfig.tests.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'project/named-react-types': 'error',
      'project/type-placement': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'separate-type-imports' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    },
  },
  {
    files: ['src/pages/**/*.{ts,tsx,mts,cts}'],
    rules: { 'react-refresh/only-export-components': ['warn', { allowExportNames: ['getServerSideProps'] }] },
  },
])
