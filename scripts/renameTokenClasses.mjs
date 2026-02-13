/**
 * @description 重命名 Token 类名 + CSS 变量名
 *
 * 1. Tailwind 类名：如 text-textPrimary → text-text，bg-backgroundSecondary → bg-background2
 * 2. CSS 变量：如 var(--textPrimary) → var(--text)，var(--backgroundSecondary) → var(--background2)
 * 3. SCSS 变量：如 $textPrimary → $text，$backgroundSecondary → $background2（autoVariables.scss 被忽略，由 variable.ts 生成）
 *
 * @test
 * 用「老 token 名」做发散搜索（子串匹配）：类名如 bg-textPrimary、text-backgroundSecondary，CSS 如 --textPrimary，SCSS 如 $textPrimary 都会命中
```bash
rg "textPrimary|textSecondary|textTertiary|textQuaternary|backgroundSecondary|backgroundTertiary|backgroundQuaternary|backgroundQuinary|buttonPrimary|buttonSecondary|buttonTertiary|borderSecondary|borderStrong" . \
  --glob '!packages/styles/css/autoVariables.css' \
  --glob '!packages/styles/scss/autoVariables.scss' \
  --glob '!DESIGN_TOKENS_USAGE.md' \
  --glob '!scripts/renameTokenClasses.mjs'
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
  '.nx',
  '.turbo',
]

// 需要忽略的
const IGNORE_PATTERNS = [
  'packages/styles/css/autoVariables.css',
  'packages/styles/scss/autoVariables.scss',
  'DESIGN_TOKENS_USAGE.md',
  'target.md',
  'scripts/renameTokenClasses.mjs',
]

// Token 映射表：老 token 名 → 新 token 名（与 variable.ts / tailwind 对齐）
// 由此表驱动生成所有「utility × state」组合，避免漏掉 bg-textPrimary、text-buttonPrimary 等交叉用法
const TOKEN_MAP = {
  textPrimary: 'text',
  textSecondary: 'text2',
  textTertiary: 'text3',
  textQuaternary: 'text4',
  backgroundSecondary: 'background2',
  backgroundTertiary: 'background3',
  backgroundQuaternary: 'background4',
  backgroundQuinary: 'background5',
  buttonPrimary: 'button',
  buttonSecondary: 'button2',
  buttonTertiary: 'button3',
  borderSecondary: 'border2',
  borderStrong: 'border3',
}

const STATE_PREFIXES = ['', 'hover:', 'focus:', 'active:']
// 仅替换「utility + token」形式；不替换裸 token（如 textPrimary），因其非合法 Tailwind 类名，需人工改为 text-text 等
const UTILITY_PREFIXES = [
  'bg-', 'text-', 'border-',
  'from-', 'via-', 'to-',
  'scrollbar-thumb-', 'ring-', 'ring-offset-',
  'border-t-', 'border-b-', 'border-l-', 'border-r-',
  'placeholder-'
]

// 由 TOKEN_MAP 生成：老类名 → 新类名（含 state 与上述 utility，带透明度如 /80 会随子串替换一并生效）
const REPLACEMENTS = (() => {
  const map = {}
  for (const [oldToken, newToken] of Object.entries(TOKEN_MAP)) {
    for (const state of STATE_PREFIXES) {
      for (const utility of UTILITY_PREFIXES) {
        map[state + utility + oldToken] = state + utility + newToken
      }
    }
  }
  return map
})()

// 由 TOKEN_MAP 生成 CSS/SCSS 变量替换表，与类名保持一致
const CSS_VAR_REPLACEMENTS = Object.fromEntries(
  Object.entries(TOKEN_MAP).map(([oldToken, newToken]) => [`--${oldToken}`, `--${newToken}`])
)
const SCSS_VAR_REPLACEMENTS = Object.fromEntries(
  Object.entries(TOKEN_MAP).map(([oldToken, newToken]) => [`$${oldToken}`, `$${newToken}`])
)

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
    } else if (/\.(tsx?|jsx?|mdx?|css|scss)$/.test(entry.name) && !shouldIgnore(full)) {
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

  for (const [oldVar, newVar] of Object.entries(CSS_VAR_REPLACEMENTS)) {
    if (content.includes(oldVar)) {
      content = content.split(oldVar).join(newVar)
      changed = true
    }
  }

  for (const [oldScss, newScss] of Object.entries(SCSS_VAR_REPLACEMENTS)) {
    if (content.includes(oldScss)) {
      content = content.split(oldScss).join(newScss)
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