import { dirname } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

function resolvePath(path: string) {
  return fileURLToPath(new URL(path, import.meta.url))
}

function createVitestConfig(root: string, include: string[]) {
  return defineConfig({
    root,

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
      setupFiles: [resolvePath('./vitest.setup.ts')],
      include,
      exclude: [
        '**/dist/**',
        '**/node_modules/**',
      ],
      restoreMocks: true,
      clearMocks: true,
    },
  })
}

/** 为单个 workspace 包创建复用根测试约定的 Vitest 配置 */
export function createPackageVitestConfig(configUrl: string) {
  return createVitestConfig(dirname(fileURLToPath(configUrl)), ['src/**/*.{test,spec}.{ts,tsx}'])
}

export default createVitestConfig(resolvePath('./'), ['packages/**/*.{test,spec}.{ts,tsx}'])
