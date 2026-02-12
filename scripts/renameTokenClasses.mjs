/**
 * 这里只匹配「基础类名片段」，由于 rg 是子串匹配，能同时命中 hover:/focus:/active: 等前缀形式
```bash
rg "bg-backgroundSecondary|bg-backgroundTertiary|bg-backgroundQuaternary|bg-backgroundQuinary|text-textPrimary|text-textSecondary|text-textTertiary|text-textQuaternary|bg-buttonPrimary|bg-buttonSecondary|bg-buttonTertiary|text-buttonTertiary|border-borderSecondary|border-borderStrong" \
  . \
  --glob '!packages/styles/css/autoVariables.css' \
  --glob '!packages/styles/scss/autoVariables.scss' \
  --glob '!DESIGN_TOKENS_USAGE.md'
```
 *
 */
import fs from 'fs'
import path from 'path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const root = path.resolve(__dirname, '..')

// 需要忽略的目录（从当前工作目录起，递归时跳过）
const IGNORE_DIRS = [
  'node_modules',
  '.git',
  '.turbo',
  'dist',
  'build',
  '.next',
]

// 映射表：老类名 → 新类名（通过函数生成，自动带上 hover/focus/active 等前缀）
const REPLACEMENTS = (() => {
  const map = {}

  const STATE_PREFIXES = ['', 'hover:', 'focus:', 'active:']

  function addBgToken(oldToken, newToken) {
    STATE_PREFIXES.forEach(prefix => {
      const oldClass = `${prefix}bg-${oldToken}`
      const newClass = `${prefix}bg-${newToken}`
      map[oldClass] = newClass
    })
  }

  function addTextToken(oldToken, newToken) {
    STATE_PREFIXES.forEach(prefix => {
      const oldClass = `${prefix}text-${oldToken}`
      const newClass = `${prefix}text-${newToken}`
      map[oldClass] = newClass
    })
  }

  function addBorderToken(oldToken, newToken) {
    STATE_PREFIXES.forEach(prefix => {
      const oldClass = `${prefix}border-${oldToken}`
      const newClass = `${prefix}border-${newToken}`
      map[oldClass] = newClass
    })
  }

  // 背景类（包括 background* 与 button* 的 bg- 使用场景）
  addBgToken('backgroundSecondary', 'background2')
  addBgToken('backgroundTertiary', 'background3')
  addBgToken('backgroundQuaternary', 'background4')
  addBgToken('backgroundQuinary', 'background5')

  addBgToken('buttonPrimary', 'button')
  addBgToken('buttonSecondary', 'button2')
  addBgToken('buttonTertiary', 'button3')

  // 文字类
  addTextToken('textPrimary', 'text')
  addTextToken('textSecondary', 'text2')
  addTextToken('textTertiary', 'text3')
  addTextToken('textQuaternary', 'text4')

  // 按钮文字类（例如 text-buttonTertiary）
  addTextToken('buttonTertiary', 'button3')

  // 边框类
  addBorderToken('borderSecondary', 'border2')
  addBorderToken('borderStrong', 'border3')

  return map
})()

// 不想动的文件
const IGNORE_PATTERNS = [
  'packages/styles/css/autoVariables.css',
  'packages/styles/scss/autoVariables.scss',
  'DESIGN_TOKENS_USAGE.md',
  'target.md',
]

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(p => filePath.endsWith(p))
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.includes(entry.name)) {
        continue
      }
      walk(full, files)
    } else if (/\.(tsx?|jsx?|mdx?)$/.test(entry.name) && !shouldIgnore(full)) {
      files.push(full)
    }
  }
  return files
}

function replaceInFile(file) {
  let content = fs.readFileSync(file, 'utf8')
  let changed = false

  for (const [oldStr, newStr] of Object.entries(REPLACEMENTS)) {
    if (content.includes(oldStr)) {
      content = content.split(oldStr).join(newStr)
      changed = true
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8')
    console.log('updated:', path.relative(root, file))
  }
}
// 从当前工作目录开始，递归遍历所有子目录（带忽略名单）
walk(root).forEach(replaceInFile)