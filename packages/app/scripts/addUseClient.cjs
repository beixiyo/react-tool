// @ts-check

const fs = require('node:fs/promises')
const path = require('node:path')

// --- 配置 ---

/** @type {ScriptConfig} */
const CONFIG = {
  targetDir: path.resolve(__dirname, '../src/components'), // 默认扫描目录，建议为 app 或 src/app
  fileExtensions: ['.tsx', '.jsx'],
  clientHooks: [
    'useState',
    'useEffect',
    'useContext',
    'useReducer',

    'useCallback',
    'useMemo',
    'useRef',

    'useImperativeHandle',
    'useLayoutEffect',

    'useDebugValue',

    'useTransition',
    'useDeferredValue',

    /** 你也可以从第三方库添加 Hooks */
    // 'useSWR',
    // 'useQuery',
  ],
}
// --- 结束配置 ---

const hooksRegex = new RegExp(`\\b(${CONFIG.clientHooks.join('|')})\\b`)

main()

/**
 * 脚本主函数
 * @returns {Promise<void>}
 */
async function main() {
  const targetDir = process.argv[2] || CONFIG.targetDir

  if (!targetDir) {
    console.error('请指定要扫描的目录。')
    console.error('用法: node addUseClient.cjs <目录路径>')
    process.exit(1)
  }

  console.log('--- 开始扫描组件以添加 "use client" (已启用类型检查) ---')
  console.log(`🎯 目标目录: ${path.resolve(targetDir)}`)
  console.log(`🔍 扫描文件类型: ${CONFIG.fileExtensions.join(', ')}`)
  console.log('---')

  const startTime = Date.now()
  const stats = await traverseDirectory(targetDir)
  const endTime = Date.now()

  console.log('\n--- 扫描完成 ---')
  console.log(`✅ 已修改: ${stats.modified}`)
  console.log(`🟡 已跳过 (已包含 "use client"): ${stats.skipped}`)
  console.log(`⚪️ 未修改 (无客户端 Hook): ${stats.unnecessary}`)
  console.log(`❌ 出错: ${stats.error}`)
  console.log(`⏱️  耗时: ${(endTime - startTime) / 1000}s`)
  console.log('---')
}

/**
 * 处理单个文件，检查并按需添加 "use client"
 * @param {string} filePath - 文件的绝对路径
 * @returns {Promise<{ status: ProcessStatus }>} - 处理结果
 */
async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')

    // 1. 检查是否已包含 "use client"
    if (content.trim().startsWith(`'use client'`) || content.trim().startsWith(`"use client"`)) {
      console.log(`🟡 跳过 (已包含 "use client"): ${filePath}`)
      return { status: 'skipped' }
    }

    // 2. 检查是否使用了客户端 Hook
    if (hooksRegex.test(content)) {
      // 3. 在文件顶部添加 "use client";
      const newContent = `'use client';\n\n${content}`
      await fs.writeFile(filePath, newContent, 'utf-8')
      console.log(`✅ 已修改 (添加 "use client"): ${filePath}`)
      return { status: 'modified' }
    }

    console.log(`⚪️ 跳过 (未检测到客户端 Hook): ${filePath}`)
    return { status: 'unnecessary' }
  }
  catch (error) {
    console.error(`❌ 处理文件时出错 ${filePath}:`, error)
    return { status: 'error' }
  }
}

/**
 * 递归遍历目录，对符合条件的文件执行处理
 * @param {string} dir - 要遍历的目录路径
 * @returns {Promise<ScanStats>} - 该目录及其子目录的总统计数据
 */
async function traverseDirectory(dir) {
  /** @type {ScanStats} */
  const stats = { modified: 0, skipped: 0, unnecessary: 0, error: 0 }
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        const subDirStats = await traverseDirectory(fullPath)
        stats.modified += subDirStats.modified
        stats.skipped += subDirStats.skipped
        stats.unnecessary += subDirStats.unnecessary
        stats.error += subDirStats.error
      }
      else if (CONFIG.fileExtensions.includes(path.extname(fullPath))) {
        const result = await processFile(fullPath)
        stats[result.status]++
      }
    }
  }
  catch (error) {
    console.error(`❌ 无法扫描目录 ${dir}:`, error)
    stats.error++
  }
  return stats
}

// --- 类型定义 ---

/**
 * 脚本的配置对象类型
 * @typedef {object} ScriptConfig
 * @property {string} targetDir - 默认扫描的根目录
 * @property {string[]} fileExtensions - 要处理的文件扩展名数组
 * @property {string[]} clientHooks - 用于检测客户端组件的 React Hooks 列表
 */

/**
 * 文件处理结果的状态
 * @typedef {'modified' | 'skipped' | 'unnecessary' | 'error'} ProcessStatus
 */

/**
 * 扫描过程的统计数据
 * @typedef {object} ScanStats
 * @property {number} modified - 已修改的文件数
 * @property {number} skipped - 已跳过的文件数 (已包含 "use client")
 * @property {number} unnecessary - 无需修改的文件数
 * @property {number} error - 处理出错的文件数
 */
