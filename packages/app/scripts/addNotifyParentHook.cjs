/**
 * @description
 * 在 src/views/../index.tsx 和 src/components/../Test.tsx 下的所有文件中
 * 1. 添加 useNotifyParentReady 导入
 * 2. 在函数体第一行添加 useNotifyParentReady 调用
 */
const fs = require('node:fs')
const { glob } = require('glob')

/**
 * 修复所有文件中的 useNotifyParentReady hook 调用
 * 确保在函数体的第一行调用
 */

/** 需要处理的文件模式 */
const patterns = [
  'src/views/**/index.tsx',
  'src/components/**/Test.tsx',
]

/**
 * 检查文件是否已经有hook调用
 */
function hasHookCall(content) {
  return content.includes('useNotifyParentReady(')
}

/**
 * 检查文件是否有hook导入
 */
function hasHookImport(content) {
  return content.includes('useNotifyParentReady') && content.includes('from \'@/hooks\'')
}

/**
 * 添加hook导入
 */
function addHookImport(content) {
  if (hasHookImport(content)) {
    return content
  }

  /** 查找现有的 @/hooks 导入 */
  const hooksImportRegex = /import\s*\{([^}]*)\}\s*from\s*['"]@\/hooks['"]/
  const match = content.match(hooksImportRegex)

  if (match) {
    /** 如果已经有 @/hooks 的导入，添加 useNotifyParentReady */
    const existingImports = match[1].trim()
    if (!existingImports.includes('useNotifyParentReady')) {
      const newImports = existingImports
        ? `${existingImports}, useNotifyParentReady`
        : 'useNotifyParentReady'
      return content.replace(match[0], `import { ${newImports} } from 'hooks'`)
    }
    return content
  }
  else {
    /** 添加新的导入语句 */
    const lines = content.split('\n')
    let insertIndex = 0

    /** 找到最后一个导入语句的位置 */
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        insertIndex = i + 1
      }
      else if (lines[i].trim() === '' && insertIndex > 0) {
        break
      }
      else if (!lines[i].trim().startsWith('import ') && insertIndex > 0) {
        break
      }
    }

    lines.splice(insertIndex, 0, 'import { useNotifyParentReady } from \'@/hooks\'')
    return lines.join('\n')
  }
}

/**
 * 在函数体第一行添加hook调用
 */
function addHookCall(content) {
  if (hasHookCall(content)) {
    return content
  }

  /** 查找 export default function 或 function 组件 */
  const patterns = [
    /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/,
    /function\s+\w+\s*\([^)]*\)\s*\{/,
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) {
      const lines = content.split('\n')
      const matchStartIndex = content.indexOf(match[0])
      const beforeMatch = content.substring(0, matchStartIndex)
      const functionStartLine = beforeMatch.split('\n').length - 1

      /** 找到函数体开始的行（包含 { 的行） */
      let braceLineIndex = functionStartLine
      while (braceLineIndex < lines.length && !lines[braceLineIndex].includes('{')) {
        braceLineIndex++
      }

      /** 在函数体开始后的第一行插入hook调用 */
      const insertIndex = braceLineIndex + 1

      /** 检查是否已经有hook调用 */
      if (insertIndex < lines.length && lines[insertIndex].includes('useNotifyParentReady')) {
        return content
      }

      const hookCallLines = [
        '  /** 通知父窗口组件准备就绪（用于截图） */',
        '  useNotifyParentReady()',
        '',
      ]

      lines.splice(insertIndex, 0, ...hookCallLines)
      return lines.join('\n')
    }
  }

  return content
}

/**
 * 处理单个文件
 */
function processFile(filePath) {
  try {
    console.log(`处理文件: ${filePath}`)

    let content = fs.readFileSync(filePath, 'utf8')
    const originalContent = content

    /** 添加导入 */
    content = addHookImport(content)

    /** 添加hook调用 */
    content = addHookCall(content)

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`  ✓ 已修复 hook 调用`)
    }
    else {
      if (hasHookCall(content)) {
        console.log(`  ✓ 文件已包含正确的 hook 调用`)
      }
      else {
        console.log(`  - 无法添加 hook 调用（可能不是标准函数组件）`)
      }
    }
  }
  catch (error) {
    console.error(`  ✗ 处理文件失败: ${error.message}`)
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('开始修复所有文件的 useNotifyParentReady hook 调用...\n')

  let totalFiles = 0
  let processedFiles = 0

  for (const pattern of patterns) {
    console.log(`查找文件: ${pattern}`)
    const files = await glob(pattern)

    console.log(`找到 ${files.length} 个文件\n`)
    totalFiles += files.length

    files.forEach((file) => {
      processFile(file)
      processedFiles++
    })

    console.log('')
  }

  console.log(`\n完成！共处理 ${processedFiles}/${totalFiles} 个文件`)
}

/** 运行脚本 */
if (require.main === module) {
  main().catch(console.error)
}
