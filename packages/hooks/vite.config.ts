import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { createPackageExternal } from '../../scripts/vite/packageExternal'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [
    dts({ tsconfigPath: './tsconfig.json' }),
  ],

  build: {
    outDir: './dist',
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
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
