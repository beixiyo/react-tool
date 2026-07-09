import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { autoParseStyles } from '@jl-org/js-to-style'
import { createPackageExternal } from '../../scripts/vite/packageExternal'
import pkg from './package.json' with { type: 'json' }
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      include: 'react/**/*.{tsx,ts}',
    }),
    dts({
      tsconfigPath: './tsconfig.json',
    }),
    autoParseStyles({
      jsPath: fileURLToPath(new URL('../styles/variable.ts', import.meta.url)),
      cssPath: fileURLToPath(new URL('../styles/css/autoVariables.css', import.meta.url)),
      scssPath: fileURLToPath(new URL('../styles/scss/autoVariables.scss', import.meta.url)),
    }),
  ],
  build: {
    outDir: './dist',
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        react: fileURLToPath(new URL('./react/index.ts', import.meta.url)),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const extension = format === 'cjs' ? 'cjs' : 'js'
        if (entryName === 'react') {
          return `react/index.${extension}`
        }
        return `${entryName}.${extension}`
      },
    },
    rollupOptions: {
      external: createPackageExternal(pkg),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "styles/index.scss" as *;`,
      },
    },
  },
})
