import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import type { LibraryFormats } from 'vite'
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
