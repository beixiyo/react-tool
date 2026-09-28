/**
 * 组件标准结构检查器（只读验证，不做任何修改）
 *
 * 检查 packages/comps/src/components 下每个组件目录是否符合标准结构：
 *   index.ts          —— 必须存在，纯 re-export barrel
 *   <DirName>.tsx     —— 主组件实现（index.tsx 实现禁止）
 *   types.ts / types/ —— 类型声明（type.ts 禁止）
 *   根目录白名单      —— index.ts / <DirName>.tsx / types.ts / types/ /
 *                        constants.ts(x) / utils.ts / Test*.tsx / test.data.ts /
 *                        既有内部目录（hooks/ subcomponents/ locales/ __tests__/ 等）
 *
 * 用法：bun run packages/app/scripts/checkComponentStructure.ts [目录名...]
 * 不传参数检查全部；传目录名只检查指定组件
 */
import fs from 'node:fs'
import path from 'node:path'

const COMPS_DIR = path.resolve(import.meta.dir, '../../comps/src/components')

/** 允许出现在根目录的文件名模式 */
const ROOT_FILE_WHITELIST = [
  /^index\.ts$/,
  /^types\.ts$/,
  /^constants\.tsx?$/,
  /^utils\.ts$/,
  /^styles\.ts$/,
  /^styles\.module\.(css|scss)$/,
  /^Test\d*\.tsx$/,
  /^test\.data\.ts$/,
]
/** 允许出现在根目录的目录名（内部组织目录） */
const ROOT_DIR_WHITELIST = [
  'types',
  'hooks',
  'subcomponents',
  'locales',
  '__tests__',
  'components',
  'features',
  'adapters',
  'icons',
  'controllers',
  'tests',
  'styles',
  'utils',
  'constants',
]

interface Violation {
  dir: string
  rule: string
  detail: string
}

function isAllowedRootFile(dirName: string, filename: string): boolean {
  if (ROOT_FILE_WHITELIST.some((re) => re.test(filename))) {
    return true
  }
  return filename === `${dirName}.tsx`
}

function checkDir(dirName: string): Violation[] {
  const dirPath = path.join(COMPS_DIR, dirName)
  const violations: Violation[] = []
  const add = (rule: string, detail: string) => violations.push({ dir: dirName, rule, detail })

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  if (!entries.some((e) => e.isFile() && e.name === 'index.ts')) {
    add('index.ts 缺失', '必须存在纯 re-export barrel index.ts')
  }
  if (entries.some((e) => e.isFile() && e.name === 'index.tsx')) {
    add('index.tsx 实现', '实现须移至 <DirName>.tsx，index.tsx 禁止')
  }
  if (entries.some((e) => e.isFile() && e.name === 'type.ts')) {
    add('type.ts 命名', '统一为 types.ts（或 types/ 目录）')
  }
  /** PascalCase 目录必须有同名主实现；小写集合目录（如 icons）由 subcomponents/ 承载实现 */
  const isPascalCase = /^[A-Z]/.test(dirName)
  const hasMainImpl = entries.some((e) => e.isFile() && e.name === `${dirName}.tsx`)
  const hasSubcomponents = entries.some((e) => e.isDirectory() && e.name === 'subcomponents')
  if (isPascalCase && !hasMainImpl) {
    add('主实现文件', `根目录缺少 ${dirName}.tsx（主组件实现）`)
  }
  if (!isPascalCase && !hasSubcomponents) {
    add('集合目录实现', '小写集合目录须由 subcomponents/ 承载各组件实现')
  }
  const hasTypes = entries.some((e) => (e.isFile() && e.name === 'types.ts') || (e.isDirectory() && e.name === 'types'))
  if (!hasTypes) {
    add('types 声明', '缺少 types.ts 或 types/ 目录')
  }

  for (const e of entries) {
    if (e.isFile() && /\.(ts|tsx)$/.test(e.name) && !isAllowedRootFile(dirName, e.name)) {
      add('根目录散文件', `${e.name} 应移入 subcomponents/ 或 hooks/ 等子目录`)
    }
    if (e.isDirectory() && !ROOT_DIR_WHITELIST.includes(e.name)) {
      add('根目录未知目录', `${e.name}/ 不在允许列表，若是内部组织目录请更新检查器白名单`)
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
