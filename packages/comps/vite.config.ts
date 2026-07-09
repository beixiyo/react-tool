import type { AliasOptions, LibraryFormats } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { autoParseStyles } from '@jl-org/js-to-style'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { createPackageExternal } from '../../scripts/vite/packageExternal'
import compsPkg from './package.json' with { type: 'json' }

const libFormats: LibraryFormats[] = ['es', 'cjs']

/** 这个配置文件只用于打包 React 组件库 */
export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    react(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.spec.ts',
        'src/**/*.spec.tsx',
        'src/**/Test*.tsx',
        'src/**/GithubSourceLink/**',
        'src/**/test.data.*',
        'src/**/tests/**',
        'src/**/__tests__/**',
      ],
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
          hooks: fileURLToPath(new URL('../hooks/src', import.meta.url)),
          utils: fileURLToPath(new URL('../utils/src', import.meta.url)),
        }
      : {} as AliasOptions,
  },
  worker: {
    format: 'es' as const,
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
      formats: libFormats,
      fileName: 'index',
    },
    rollupOptions: {
      external: (id) => {
        /**
         * 匹配所有依赖包及其子路径
         *
         * 其中 i18n 是 peerDependency（含子路径 i18n/react，携带 React Context），
         * 由宿主提供唯一实例，构建时【必须】external 掉，否则会被打进产物形成多份
         * Context，导致 useI18n 报 must be used within Provider
         */
        return createPackageExternal(compsPkg)(id)
      },
    },
  },
}))
