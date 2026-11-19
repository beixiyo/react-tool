import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { createPackageExternal } from '../../scripts/vite/packageExternal'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [
    dts({ tsconfigPath: './tsconfig.json' }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  build: {
    outDir: './dist',
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        tool: fileURLToPath(new URL('./src/tool.ts', import.meta.url)),
        /**
         * 目录型入口输出到 `<dir>/index.js`，与声明文件 `<dir>/index.d.ts` 同目录；
         * 若输出为 `keyboard.js`，根入口 d.ts 的 `export * from './keyboard'` 会先命中无类型的 .js
         */
        'markdown/index': fileURLToPath(new URL('./src/markdown/index.ts', import.meta.url)),
        'keyboard/index': fileURLToPath(new URL('./src/keyboard/index.ts', import.meta.url)),
      },
      fileName: (format, entryName) =>
        `${entryName}.${
          format === 'es'
            ? 'js'
            : 'cjs'
        }`,
    },
    rollupOptions: {
      external: createPackageExternal(pkg),
      output: [
        /** ESM 按源码模块输出：消费方可按模块 tree-shake，并按模块保留 'use client' */
        {
          format: 'es',
          preserveModules: true,
          preserveModulesRoot: 'src',
        },
        /** CJS 保持单文件（与 comps 一致），避免 preserveModules 下循环引用读到未赋值的 exports */
        {
          format: 'cjs',
        },
      ],
    },
  },
})
