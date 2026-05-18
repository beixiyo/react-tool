import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import pkg from './package.json' with { type: 'json' }

export default defineConfig(() => ({
  plugins: [
    tailwindcss(),
    react(),
    dts({ tsconfigPath: './tsconfig.app.json' }),
    codeInspectorPlugin({
      bundler: 'vite',
      /**
       * VSCode / Cursor:
       * ```bash
       * # 只有 WSL 才需要设置
       * echo "CODE_EDITOR=$(which code)" > .env.local
       * ```
       *
       * Neovim（nvim-open）：
       * ```bash
       * echo "CODE_EDITOR=$(realpath ~/.local/bin/nvim-open)" > .env.local
       * ```
       */
      editor: `${process.env.HOME}/.local/bin/nvim-open` as any,
      pathFormat: ['{file}', '{line}', '{column}'],
    }),
  ],
  resolve: {},
  worker: {
    format: 'es',
  },
  build: {
    outDir: './dist',
    lib: {
      entry: fileURLToPath(
        new URL('./src/components/index.ts', import.meta.url),
      ),
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    rollupOptions: {
      // 避免在库里打包出第二份 React，防止 Invalid hook call
      external: (id) => {
        // 强制 external React 相关
        if (
          id === 'react'
          || id === 'react-dom'
          || id.startsWith('react/')
          || id.startsWith('react-dom/')
        ) {
          return true
        }

        const allDeps = [
          ...Object.keys(pkg.devDependencies || {}),
        ]

        return allDeps.some(
          dep => id === dep || id.startsWith(`${dep}/`),
        )
      },
    },
  },
}))
