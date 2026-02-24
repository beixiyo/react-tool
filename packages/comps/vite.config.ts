import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig, type AliasOptions } from 'vite'
import dts from 'vite-plugin-dts'
import { autoParseStyles } from '@jl-org/js-to-style'
import pkg from '../../package.json' with { type: 'json' }
import tailwindcss from '@tailwindcss/vite'

/** 这个配置文件只用于打包 React 组件库 */
export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    react(),
    dts({ tsconfigPath: './tsconfig.app.json' }),
    AutoImport({
      imports: ['react'],
      dts: './src/auto-imports.d.ts',
    }),
    autoParseStyles({
      jsPath: fileURLToPath(new URL('../styles/variable.ts', import.meta.url)),
      cssPath: fileURLToPath(new URL('../styles/css/autoVariables.css', import.meta.url)),
      scssPath: fileURLToPath(new URL('../styles/scss/autoVariables.scss', import.meta.url)),
    }),
  ],
  resolve: {
    alias: command === 'serve'
      ? {
        'hooks': fileURLToPath(new URL('../hooks/src', import.meta.url)),
        'utils': fileURLToPath(new URL('../utils/src', import.meta.url)),
      }
      : {} as AliasOptions,
  },
  worker: {
    format: 'es',
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "styles/index.scss" as *;`,
      },
    },
  },

  build: {
    outDir: './dist',
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    rollupOptions: {
      external: (id) => {
        // 匹配所有依赖包及其子路径
        const allDeps = [
          ...Object.keys(pkg.dependencies || {}),
          ...Object.keys(pkg.devDependencies || {})
        ]
        return allDeps.some(dep => id === dep || id.startsWith(`${dep}/`))
      }
    },
  },
}))
