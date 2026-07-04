import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

function resolvePath(path: string) {
  return fileURLToPath(new URL(path, import.meta.url))
}

export default defineConfig({
  root: resolvePath('./'),

  plugins: [
    react(),
  ],

  resolve: {
    alias: {
      '@': resolvePath('./packages/app/src'),
      'comps': resolvePath('./packages/comps/src'),
      'config': resolvePath('./packages/config/src'),
      'hooks': resolvePath('./packages/hooks/src'),
      'i18n': resolvePath('./packages/i18n/src'),
      'i18n/react': resolvePath('./packages/i18n/src/react'),
      'styles': resolvePath('./packages/styles'),
      'utils': resolvePath('./packages/utils/src'),
    },
  },

  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['packages/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/dist/**',
      '**/node_modules/**',
    ],
    restoreMocks: true,
    clearMocks: true,
  },
})
