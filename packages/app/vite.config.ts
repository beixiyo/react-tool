import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { codeInspectorPlugin } from 'code-inspector-plugin'
// import gzip from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig, loadEnv } from 'vite'
import { envParse } from 'vite-plugin-env-parse'

const devArr = ['development', 'dev']

export default defineConfig(({ mode }) => {
  console.log(mode)
  const env = loadEnv(mode, 'env') as unknown as Env

  return {
    plugins: [
      react(),
      envParse(),
      AutoImport({
        imports: ['react', 'react-router-dom'],
        dts: './src/auto-imports.d.ts',
      }),
      // gzip(),
      codeInspectorPlugin({
        bundler: 'vite',
        editor: 'cursor',
      }),
      visualizer({ gzipSize: true, brotliSize: true, filename: 'dist/stats.html' }),
    ],

    envDir: fileURLToPath(new URL('./env', import.meta.url)),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'hooks': fileURLToPath(new URL('../hooks/src', import.meta.url)),
        'utils': fileURLToPath(new URL('../utils/src', import.meta.url)),
      },
    },
    worker: {
      format: 'es',
    },

    css: {
      preprocessorMaxWorkers: true,
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/scss/index.scss" as *;`,
        },
      },
    },

    /**
     * 避免预构建破坏 WASM 动态加载
     * Vite 默认会通过 optimizeDeps 预构建依赖，但 @ffmpeg 的 WASM 文件采用动态加载机制
     *
     * - 路径混淆问题，预构建可能改变模块路径，导致 WASM 文件加载失败
     * - 动态加载兼容性 @ffmpeg 内部通过 fetch() 动态加载 .wasm 文件，预构建会破坏其相对路径计算
     */
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
    },
    server: {
      port: 9977,
      host: '0.0.0.0',
      proxy: {
        [env.VITE_API_BASE_URL]: {
          target: env.VITE_LOCAL_API_PROXY,
          changeOrigin: true,
        },
      },
      allowedHosts: true,

      /**
       * @ffmpeg/ffmpeg 底层依赖 WebAssembly（WASM）的多线程能力
       * 而浏览器要求以下条件才能启用 SharedArrayBuffer
       *
       * - COOP: same-origin 防止跨源窗口访问，确保执行环境隔离
       * - COEP: 强制所有资源必须通过 CORS 或 CORP 验证
       *
       * ## 副作用
       * 本地开发时需确保所有资源（如图片、脚本）来自相同源或配置 CORS
       * 资源服务器必须设置响应头
       * Cross-Origin-Resource-Policy: cross-origin
       */
      headers: {
        // 'Cross-Origin-Opener-Policy': 'same-origin',
        // 'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },

    esbuild: {
      drop: devArr.includes(mode)
        ? []
        : ['console', 'debugger'],
      sourcemap: !!devArr.includes(mode),
    },

    build: {
      minify: !devArr.includes(mode),
      rollupOptions: {
        output: {
          manualChunks(id) {
            /** 大型核心库 */
            if (
              id.includes('node_modules/react')
              || id.includes('node_modules/react-dom')
              || id.includes('node_modules/react-router-dom')
              || id.includes('node_modules/framer-motion')
              || id.includes('node_modules/styled-components')
              || id.includes('node_modules/react-i18next')
            ) {
              return 'react-vendor'
            }
            if (id.includes('node_modules/fabric/')) {
              return 'fabric-vendor'
            }

            if (id.includes('node_modules/@ffmpeg/ffmpeg/') || id.includes('node_modules/@ffmpeg/util/')) {
              return 'ffmpeg-vendor' // 如果不动态导入，可以这样分
            }
            if (id.includes('node_modules/@tensorflow/tfjs/')) {
              return 'tfjs-vendor' // 如果不动态导入，可以这样分
            }

            /** 国际化 */
            if (id.includes('node_modules/i18next/')) {
              return 'i18n-vendor'
            }

            // @jl-org 的工具库
            if (id.includes('node_modules/@jl-org/')) {
              return 'jl-org-utils'
            }

            /** 其他较大的、不常变动的库 */
            if (id.includes('node_modules/marked/')) {
              return 'marked-vendor'
            }
            if (id.includes('node_modules/ogl/')) {
              return 'ogl-vendor' // WebGL 库，也可能较大
            }
          },

          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames({ name }) {
            if (!name)
              return 'assets/[name]-[hash][extname]'
            if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].some(ext => name.endsWith(ext))) {
              return 'img/[name]-[hash][extname]'
            }

            return name.endsWith('.css')
              ? 'css/[name]-[hash].css'
              : 'assets/[name]-[hash][extname]'
          },
        },
      },
    },

    modulePreload: {
      /** rel 资源标识符兼容 */
      polyfill: true,
    },
  }
})

interface Env {
  // Auto generate by env-parse
  readonly VITE_API_BASE_URL: string
  /**
   * 开发
   */
  readonly VITE_LOCAL_API_PROXY: string
}
