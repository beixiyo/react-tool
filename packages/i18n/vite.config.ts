import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [
    react({
      include: 'src/react/**/*.{tsx,ts}',
    }),
    dts({
      tsconfigPath: './tsconfig.json',
      outDir: './dist',
      include: ['src/**/*'],
      entryRoot: 'src',
    }),
  ],
  build: {
    outDir: './dist',
    lib: {
      entry: {
        'index': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        /** React 封装作为子路径导出 i18n/react，与核心同包，保证 Context 单实例 */
        'react/index': fileURLToPath(new URL('./src/react/index.ts', import.meta.url)),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const extension = format === 'cjs'
          ? 'cjs'
          : 'js'
        return `${entryName}.${extension}`
      },
    },
    rollupOptions: {
      external: (id) => {
        /** 匹配所有依赖包及其子路径（react、react/jsx-runtime、hooks 等全部外置） */
        const allDeps = [
          ...Object.keys(pkg.dependencies || {}),
          ...Object.keys((pkg as any).devDependencies || {}),
          ...Object.keys((pkg as any).peerDependencies || {}),
        ]
        return allDeps.some(dep => id === dep || id.startsWith(`${dep}/`))
      },
    },
  },
})
