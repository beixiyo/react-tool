import { fileURLToPath, URL } from 'node:url'
import { autoParseStyles } from '@jl-org/js-to-style'
import tailwindcss from '@tailwindcss/vite'
// import gzip from 'vite-plugin-compression'
// import { visualizer } from 'rollup-plugin-visualizer'

import react from '@vitejs/plugin-react'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig, loadEnv } from 'vite'
import { envParse } from 'vite-plugin-env-parse'
import svgr from 'vite-plugin-svgr'

const devArr = ['development', 'dev']

export default defineConfig(({ mode }) => {
  console.log(mode)
  const env = loadEnv(mode, 'env') as unknown as Env

  return {
    plugins: [
      tailwindcss(),
      svgr(), // import IconPlay from '@/assets/icon/play.svg?react' => <IconPlay />
      codeInspectorPlugin({
        bundler: 'vite',
        /**
         * @link https://inspector.fe-dev.cn/en/more/question.html#using-in-wsl-or-dev-containers
         *
         * VSCode / Cursor:
         * ```bash
         * # 只有 WSL 才需要设置
         * echo "CODE_EDITOR=$(which code)" > .env.local
         * ```
         *
         * Neovim（open-nvim）：
         * ```bash
         * echo "CODE_EDITOR=$(realpath ~/.local/bin/open-nvim)" > .env.local
         * ```
         */
        editor: `${process.env.HOME}/.local/bin/open-nvim` as any,
        pathFormat: ['{file}', '{line}', '{column}'],
        hideConsole: true,
      }),
      /**
       * React Compiler — Vite 8 / plugin-react v6 新用法（babel 选项已移除）
       * @link https://react.dev/learn/react-compiler/installation#vite
       * @example
       * ```ts
       * import babel from '@rolldown/plugin-babel'
       * import { reactCompilerPreset } from '@vitejs/plugin-react'
       * // pnpm add -D @rolldown/plugin-babel babel-plugin-react-compiler
       * babel({ presets: [reactCompilerPreset()] })
       * ```
       * NOTE: 和 @preact/signals-react 冲突，不过鉴于 React 纯纯一坨臭狗屎，我选择 signal
       */
      react(),
      envParse({ dtsPath: './src/vite-env.d.ts' }),
      autoParseStyles({
        jsPath: fileURLToPath(new URL('../styles/variable.ts', import.meta.url)),
        cssPath: fileURLToPath(new URL('../styles/css/autoVariables.css', import.meta.url)),
        scssPath: fileURLToPath(new URL('../styles/scss/autoVariables.scss', import.meta.url)),
      }),
      AutoImport({
        imports: ['react'],
        dts: './src/auto-imports.d.ts',
      }),

      /**
       * @link https://www.npmjs.com/package/react-devtools
       * ```bash
       * npm install -g react-devtools
       * react-devtools
       * ```
       */
      {
        name: 'react-devtools-inject',
        apply: 'serve', // 仅在开发服务器模式下应用
        transformIndexHtml(html) {
          return html.replace(
            '</head>',
            '<script src="http://localhost:8097"></script></head>',
          )
        },
      },
      // gzip(),
      // visualizer({ gzipSize: true, brotliSize: true, filename: 'dist/stats.html' }),
    ],

    envDir: fileURLToPath(new URL('./env', import.meta.url)),
    resolve: {
      tsconfigPaths: true,
      alias: {
        config: fileURLToPath(new URL('../config/src', import.meta.url)),
      },
    },
    worker: {
      format: 'es',
    },

    css: {
      preprocessorMaxWorkers: true,
      preprocessorOptions: {
        scss: {
          additionalData: `@use "styles/index.scss" as *;`,
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
      /**
       * 预构建内部 workspace 包，解决 dev 请求瀑布
       *
       * 这些包经 tsconfig paths 解析到各自 src 的「export * 大 barrel」，
       * 而 Vite dev 不做 tree-shaking —— 导一个组件就会把整个 barrel 的每个
       * 源码模块当独立请求发出（实测单页 ~250 请求，其中 ~200 是这些内部包），
       * 挤在 HTTP/1.1 的 6 并发里巨慢。加进 include 后由 esbuild/rolldown
       * 打成单个优化 chunk，请求数从几百降到个位数
       *
       * ⚠️ 代价：HMR 失效
       *   被预构建的包，改动其【源码】不再触发组件级快速热更，而是
       *   重新打包 + 整页刷新。所以这是「在测 UI 页面 / 消费组件」时的配置
       *   若要回到【开发组件库本身】（频繁改 comps/hooks 内部并希望热更），
       *   把对应包从 include 移除即可（hooks/utils/i18n 很少改，可常驻；
       *   comps 视情况增删）
       *
       * 注意：'i18n/react' 必须单独列出，勿删！
       *   它承载 React Context（I18nProvider/useI18n）。若只 include 'i18n' 而漏掉
       *   该子路径，会出现「comps 预构建里内联一份 + Test 页直接 import 走源码一份」
       *   的双实例，两个 Context 对象不相等 → 报 "useI18n must be used within an
       *   I18nProvider"。单列后它成为唯一共享 chunk，Provider 与消费者指向同一 context
       */
      include: ['hooks', 'utils', 'i18n', 'i18n/react'],
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

    build: {
      minify: !devArr.includes(mode),
      rollupOptions: {
        output: {
          /**
           * 删除 console / debugger —— 替代 esbuild 时期的 drop
           *
           * Vite 8 默认 minifier 是 oxc（Rolldown 内置）。把 MinifyOptions 对象设在
           * output.minify 上会覆盖 Vite 由 build.minify 推导的默认值（其内部 `...output`
           * 最后展开，故用户值优先）。dropConsole/dropDebugger 属于 compress 选项
           *
           * - dev（devArr 模式）：不压缩，保留 console 方便调试
           * - 生产：full minify + 删除 console/debugger
           * - dev server（serve）：本就不经过 minify，console 自然保留
           */
          minify: devArr.includes(mode)
            ? false
            : {
                compress: {
                  dropConsole: true,
                  dropDebugger: true,
                },
                mangle: true,
                codegen: true,
              },

          manualChunks(id) {
            if (id.includes('node_modules/fabric/')) {
              return 'fabric-vendor'
            }

            if (id.includes('node_modules/@ffmpeg/ffmpeg/') || id.includes('node_modules/@ffmpeg/util/')) {
              return 'ffmpeg-vendor' // 如果不动态导入，可以这样分
            }
            if (id.includes('node_modules/@tensorflow/tfjs/')) {
              return 'tfjs-vendor' // 如果不动态导入，可以这样分
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
