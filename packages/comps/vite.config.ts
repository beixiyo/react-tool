import { autoParseStyles } from '@jl-org/js-to-style'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import type { AliasOptions, LibraryFormats } from 'vite'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { createPackageExternal } from '../../scripts/vite/packageExternal'
import compsPkg from './package.json' with { type: 'json' }

/** 产物格式对应的文件扩展名，与 package.json exports 保持一致 */
const FORMAT_EXT: Partial<Record<LibraryFormats, string>> = {
  es: 'js',
  cjs: 'cjs',
}

/** 需要内联进产物的依赖子路径（源码为 TS、无编译产物） */
const INLINE_DEPS = ['styles/variable', 'styles/variable.ts']

const isPackageExternal = createPackageExternal(compsPkg)

/** 这个配置文件只用于打包 React 组件库 */
export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    react(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      entryRoot: './src',
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.spec.ts',
        'src/**/*.spec.tsx',
        'src/**/Test*.tsx',
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
      fileName: (format, entryName) => `${entryName}.${FORMAT_EXT[format]}`,
      cssFileName: 'index',
    },
    rollupOptions: {
      external: (id) => {
        /**
         * styles 的 JS 导出是未编译的 TS 源码，external 会让产物引用裸 .ts，
         * 因此内联进 comps 产物；styles 的 CSS 仍保持 external
         */
        if (INLINE_DEPS.includes(id)) return false

        /**
         * 匹配所有依赖包及其子路径
         *
         * 其中 i18n 是 peerDependency（含子路径 i18n/react，携带 React Context），
         * 由宿主提供唯一实例，构建时【必须】external 掉，否则会被打进产物形成多份
         * Context，导致 useI18n 报 must be used within Provider
         */
        return isPackageExternal(id)
      },
      output: [
        /**
         * ESM 按源码模块输出：消费方可按模块 tree-shake，
         * 且 rolldown 会在每个模块产物顶部保留各自的 'use client' 指令
         */
        {
          format: 'es',
          preserveModules: true,
          preserveModulesRoot: 'src',
        },
        /**
         * CJS 保持单文件：CJS 的 exports 在模块末尾才赋值，preserveModules 下
         * `Message` / `Modal` 这类「模块顶层调用 extendXxx() 且与其循环引用」的写法
         * 会读到未初始化的导出而在 require 时抛错
         */
        {
          format: 'cjs',
        },
      ],
    },
  },
}))
