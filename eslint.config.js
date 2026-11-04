import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Data-loading effects in this app intentionally show a synchronous
      // loading state before starting their async request.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['src/components/admin/AdminNotifications.tsx'],
    rules: {
      // This module intentionally exports the event constants and hook next
      // to the provider that owns their context.
      'react-refresh/only-export-components': 'off',
    },
  },
])
