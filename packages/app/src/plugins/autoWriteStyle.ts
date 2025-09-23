import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import { writeStyle } from '@jl-org/js-to-style'

export interface AutoWriteStyleOptions {
  /** TypeScript 变量文件路径 */
  jsPath?: string
  /** 输出的 CSS 文件路径 */
  cssPath?: string
  /** 输出的 SCSS 文件路径 */
  scssPath?: string
  /** 是否在开发模式下启用 */
  dev?: boolean
  /** 是否在构建模式下启用 */
  build?: boolean
}

export function autoWriteStylePlugin(options: AutoWriteStyleOptions = {}): Plugin {
  const {
    jsPath = resolve(process.cwd(), 'src/styles/variable.ts'),
    cssPath = resolve(process.cwd(), 'src/styles/css/autoVariables.css'),
    scssPath = resolve(process.cwd(), 'src/styles/scss/autoVariables.scss'),
    dev = true,
    build = true,
  } = options

  let isFirstRun = true

  const runWriteStyle = () => {
    try {
      writeStyle({
        jsPath,
        cssPath,
        scssPath,
      })
      console.log('✅ Auto write style completed')
    }
    catch (error) {
      console.error('❌ Auto write style failed:', error)
    }
  }

  return {
    name: 'auto-write-style',
    configResolved(config) {
      // 在配置解析完成后运行一次
      if (isFirstRun) {
        runWriteStyle()
        isFirstRun = false
      }
    },
    buildStart() {
      // 在构建开始时运行
      if (build) {
        runWriteStyle()
      }
    },
    handleHotUpdate({ file }) {
      // 监听变量文件变化
      if (file === jsPath && dev) {
        runWriteStyle()
      }
    }
  }
}
