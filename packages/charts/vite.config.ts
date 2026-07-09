import type { LibraryFormats } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { createPackageExternal } from '../../scripts/vite/packageExternal'
import pkg from './package.json' with { type: 'json' }

const libFormats: LibraryFormats[] = ['es', 'cjs']

export default defineConfig(() => ({
  plugins: [
    tailwindcss(),
    react(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      include: ['src/components/**/*'],
    }),
    codeInspectorPlugin({
      bundler: 'vite',
      /**
       * VSCode / Cursor:
       * ```bash
       * # 只有 WSL 才需要设置
       * echo "CODE_EDITOR=$(which code)" > .env.local
       * ```
       *
       * Neovim（open-nvim）：
       * ```bash
       * echo "CODE_EDITOR=$(realpath ~/.local/bin/open-nvim)" > .env.local
       * ```
       */
      editor: `${process.env.HOME}/.local/bin/open-nvim` as any,
      pathFormat: ['{file}', '{line}', '{column}'],
    }),
  ],
  resolve: {},
  worker: {
    format: 'es' as const,
  },
  build: {
    outDir: './dist',
    lib: {
      entry: fileURLToPath(
        new URL('./src/components/index.ts', import.meta.url),
      ),
      formats: libFormats,
      fileName: 'index',
    },
    rollupOptions: {
      external: createPackageExternal(pkg),
    },
  },
}))
