/**
 * 组件标准结构检查器（只读验证，不做任何修改）
 *
 * 规则与 AGENTS.md「写组件流程规范 → 目录与实现」一致（零豁免）
 * packages/comps/src/components 下每个组件目录根部只允许：
 *   index.ts                    —— 必须，纯 re-export barrel（不得含实现，不得导出 Test）
 *   <DirName>.tsx               —— 必须，主组件实现（index.tsx 实现禁止）
 *   types.ts | types/           —— 必须二选一（type.ts 禁止）
 *   Test.tsx                    —— 必须，画廊演示页
 *   constants.ts / styles.ts    —— 可选
 *   utils.ts | utils/           —— 可选，二选一
 *   styles.module.(css|scss)    —— 可选，CSS Modules 样式
 *   test.data.ts                —— 可选，演示页数据
 *   hooks/ subcomponents/ locales/ __tests__/ —— 可选目录
 *   *.md                        —— 可选，组件文档
 * 小写集合目录（如 icons/）不要求 <DirName>.tsx，改由 subcomponents/ 承载各组件实现
 *
 * 用法：bun run packages/app/scripts/checkComponentStructure.ts [目录名...]
 * 不传参数检查全部；传目录名只检查指定组件
 */
import fs from 'node:fs'
import path from 'node:path'

const COMPS_DIR = path.resolve(import.meta.dirname, '../../comps/src/components')

/** 允许出现在根目录的文件名模式（`<DirName>.tsx` 单独判断） */
const ROOT_FILE_WHITELIST = [
  /^index\.ts$/,
  /^types\.ts$/,
  /^constants\.ts$/,
  /^utils\.ts$/,
  /^styles\.ts$/,
  /^styles\.module\.(css|scss)$/,
  /^Test\.tsx$/,
  /^test\.data\.ts$/,
  /\.md$/,
]

/** 允许出现在根目录的目录名 */
const ROOT_DIR_WHITELIST = [
  'types',
  'utils',
  'hooks',
  'subcomponents',
  'locales',
  '__tests__',
]

/** 文件与目录形态二选一的模块（同时存在会产生同名解析歧义） */
const FILE_OR_DIR_MODULES = ['types', 'utils']

/** 匹配 barrel 中允许出现的 re-export 语句（支持多行具名导出） */
const RE_EXPORT_STATEMENT = /export\s+(?:type\s+)?(?:\*(?:\s+as\s+\w+)?|\{[^}]*\})\s+from\s+['"][^'"]+['"];?/g

function isAllowedRootFile(dirName: string, filename: string): boolean {
  if (ROOT_FILE_WHITELIST.some((re) => re.test(filename))) {
    return true
  }
  return filename === `${dirName}.tsx`
}

/** 去掉注释与 re-export 语句后若仍有内容，说明 barrel 含实现或副作用 */
function getBarrelResidue(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(RE_EXPORT_STATEMENT, '')
    .trim()
}

function checkBarrel(dirPath: string, add: (rule: string, detail: string) => void) {
  const source = fs.readFileSync(path.join(dirPath, 'index.ts'), 'utf8')
  const residue = getBarrelResidue(source)
  if (residue) {
    add('index.ts 非纯 barrel', `只允许 export ... from 语句，发现：${residue.split('\n')[0].slice(0, 80)}`)
  }
  if (/from\s+['"]\.\/Test['"]/.test(source)) {
    add('index.ts 导出演示页', 'Test.tsx 仅供画廊使用，禁止 re-export')
  }
}

function checkDir(dirName: string): Violation[] {
  const dirPath = path.join(COMPS_DIR, dirName)
  const violations: Violation[] = []
  const add = (rule: string, detail: string) => violations.push({ dir: dirName, rule, detail })

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  const hasFile = (name: string) => entries.some((e) => e.isFile() && e.name === name)
  const hasDir = (name: string) => entries.some((e) => e.isDirectory() && e.name === name)

  if (hasFile('index.ts')) {
    checkBarrel(dirPath, add)
  }
  else {
    add('index.ts 缺失', '必须存在纯 re-export barrel index.ts')
  }
  if (hasFile('index.tsx')) {
    add('index.tsx 实现', '实现须移至 <DirName>.tsx，index.tsx 禁止')
  }
  if (hasFile('type.ts')) {
    add('type.ts 命名', '统一为 types.ts（或 types/ 目录）')
  }

  /** PascalCase 目录必须有同名主实现；小写集合目录（如 icons）由 subcomponents/ 承载实现 */
  const isPascalCase = /^[A-Z]/.test(dirName)
  if (isPascalCase && !hasFile(`${dirName}.tsx`)) {
    add('主实现文件', `根目录缺少 ${dirName}.tsx（主组件实现）`)
  }
  if (!isPascalCase && !hasDir('subcomponents')) {
    add('集合目录实现', '小写集合目录须由 subcomponents/ 承载各组件实现')
  }
  if (!hasFile('types.ts') && !hasDir('types')) {
    add('types 声明', '缺少 types.ts 或 types/ 目录')
  }
  if (!hasFile('Test.tsx')) {
    add('演示页缺失', '缺少 Test.tsx 演示页')
  }

  for (const name of FILE_OR_DIR_MODULES) {
    if (hasFile(`${name}.ts`) && hasDir(name)) {
      add('文件与目录重名', `${name}.ts 与 ${name}/ 只能保留一种形态`)
    }
  }

  for (const e of entries) {
    if (e.isFile() && !isAllowedRootFile(dirName, e.name)) {
      add('根目录散文件', `${e.name} 不在标准结构中，应移入 subcomponents/、hooks/、utils/ 或 __tests__/ 等子目录`)
    }
    if (e.isDirectory() && !ROOT_DIR_WHITELIST.includes(e.name)) {
      add('根目录未知目录', `${e.name}/ 不在标准结构中（允许：${ROOT_DIR_WHITELIST.join(' / ')}）`)
    }
  }

  return violations
}

function main(): void {
  const targets = process.argv.slice(2)
  const dirs = targets.length > 0
    ? targets
    : fs.readdirSync(COMPS_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)

  const all: Violation[] = []
  for (const d of dirs) {
    all.push(...checkDir(d))
  }

  if (all.length === 0) {
    console.log(`PASS: ${dirs.length} 个目录全部符合标准结构`)
    process.exit(0)
  }

  const byDir = new Map<string, Violation[]>()
  for (const v of all) {
    byDir.set(v.dir, [...(byDir.get(v.dir) ?? []), v])
  }
  for (const [dir, list] of byDir) {
    console.log(`\n${dir}`)
    for (const v of list) {
      console.log(`  ✗ [${v.rule}] ${v.detail}`)
    }
  }
  console.log(`\nFAIL: ${byDir.size}/${dirs.length} 个目录存在违规，共 ${all.length} 条`)
  process.exit(1)
}

main()

interface Violation {
  dir: string
  rule: string
  detail: string
}
