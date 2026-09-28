/**
 * shadcn registry 生成器（POC）
 *
 * 职责：把 packages/comps 中的组件转换为 shadcn registry item JSON，
 * 产出静态文件到 packages/app/public/r/，随 Cloudflare Pages 上线
 *
 * 同源双轨策略：
 * - 仓库源码零改动，继续以 workspace 形态开发（Test.tsx 演示页照常）
 * - import 改写只发生在生成产物中：workspace 包导入 → 用户项目别名
 *
 * 改写规则：
 * - `from 'utils'`            → `from '@/lib/utils'`（cn 等内联到 lib-utils item）
 * - `from '../../types/...'`  → `from '@/lib/types'`（comps 共享类型）
 * - 组件间相对导入（`../Slot`）→ 保留（平铺到 components/ui/ 后相对位置不变）
 * - npm 包导入（lucide-react、@jl-org/tool 等）→ 保留，声明为 dependencies
 *
 * 运行：bun run scripts/registry/genShadcnRegistry.ts [组件名...]
 * 不传参数时使用下方 REGISTRY_COMPONENTS 全量清单
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

const REPO_ROOT = path.resolve(import.meta.dir, '../..')
const COMPS_DIR = path.join(REPO_ROOT, 'packages/comps/src/components')
const OUT_DIR = path.join(REPO_ROOT, 'packages/app/public/r')
const REGISTRY_LIB_DIR = path.join(REPO_ROOT, 'scripts/registry/lib')

/** POC 组件清单（按依赖顺序） */
const REGISTRY_COMPONENTS = [
  'Br',
  'Slot',
  'Icon',
  'Badge',
]

/** 生成时排除的文件 */
const EXCLUDE_FILES = /^Test\.tsx$/

/** 不进用户项目的目录 */
const EXCLUDE_DIRS = ['__tests__']

/** workspace 导入 → 用户项目别名的改写表 */
const IMPORT_REWRITES: Array<{ from: RegExp; to: string }> = [
  { from: /from 'utils'/g, to: `from '@/lib/utils'` },
  { from: /from '\.\.\/\.\.\/types'/g, to: `from '@/lib/types'` },
  { from: /from '\.\.\/\.\.\/types\/Component'/g, to: `from '@/lib/types'` },
]

/** 依赖命名空间：用户项目 components.json 配置 registries["@jl"] 后生效 */
const NAMESPACE = '@jl'

/** npm 依赖版本来源：未列出的包不 pin 版本 */
const NPM_DEPS_VERSION: Record<string, string> = {}

/** PascalCase → kebab-case */
function kebab(name: string) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/** 递归收集组件目录下的分发文件 */
function collectFiles(dir: string, base = ''): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.includes(entry.name)) continue
      out.push(...collectFiles(path.join(dir, entry.name), `${base}${entry.name}/`))
      continue
    }
    if (EXCLUDE_FILES.test(entry.name)) continue
    if (entry.name.endsWith('.bak.tsx')) continue
    out.push(base + entry.name)
  }
  return out.sort()
}

/** 应用 import 改写规则 */
function rewriteImports(source: string) {
  let result = source
  for (const { from, to } of IMPORT_REWRITES) {
    result = result.replace(from, to)
  }
  return result
}

/** 从源码提取信息：组件间依赖 + npm 依赖 */
function analyzeImports(source: string) {
  const compDeps = new Set<string>()
  const npmDeps = new Set<string>()

  const importRe = /from '([^']+)'/g
  let match: RegExpExecArray | null
  while ((match = importRe.exec(source)) !== null) {
    const spec = match[1]
    if (spec.startsWith('@/')) continue
    if (spec.startsWith('.')) {
      /** ../Xxx 或 ../Xxx/yyy → 组件依赖 */
      const m = spec.match(/\.\.\/([A-Z][A-Za-z0-9]*)/)
      if (m) compDeps.add(m[1])
      continue
    }
    if (/^(utils|hooks|comps|i18n|config|styles)$/.test(spec)) continue
    if (spec === 'react') continue
    npmDeps.add(spec)
  }
  return { compDeps: [...compDeps], npmDeps: [...npmDeps] }
}

interface FileEntry {
  path: string
  type: string
  target: string
  content: string
}

interface RegistryItem {
  $schema: string
  name: string
  type: string
  dependencies?: string[]
  registryDependencies?: string[]
  files: FileEntry[]
}

function makeItem(name: string, files: FileEntry[], extra: Partial<RegistryItem> = {}): RegistryItem {
  const item: RegistryItem = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name,
    type: 'registry:ui',
    files,
    ...extra,
  }
  if (!item.dependencies?.length) delete item.dependencies
  if (!item.registryDependencies?.length) delete item.registryDependencies
  return item
}

function buildLibItems(): RegistryItem[] {
  const utilsSrc = fs.readFileSync(path.join(REGISTRY_LIB_DIR, 'utils.ts'), 'utf8')
  const typesSrc = fs.readFileSync(path.join(COMPS_DIR, '../types/Component.ts'), 'utf8')

  return [
    makeItem('lib-utils', [
      {
        path: 'registry/lib/utils.ts',
        type: 'registry:lib',
        content: utilsSrc,
      },
    ], {
      dependencies: ['clsx', 'tailwind-merge'],
    }),
    makeItem('lib-types', [
      {
        path: 'registry/lib/types.ts',
        type: 'registry:lib',
        content: typesSrc,
      },
    ]),
  ]
}

function buildComponentItem(name: string): RegistryItem {
  const dir = path.join(COMPS_DIR, name)
  const files = collectFiles(dir)

  const entries: FileEntry[] = []
  const compDeps = new Set<string>()
  const npmDeps = new Set<string>()

  for (const file of files) {
    const source = fs.readFileSync(path.join(dir, file), 'utf8')
    const rewritten = rewriteImports(source)
    const { compDeps: cd, npmDeps: nd } = analyzeImports(rewritten)
    cd.forEach((d) => compDeps.add(d))
    nd.forEach((d) => npmDeps.add(d))

    entries.push({
      path: `registry/ui/${name}/${file}`,
      type: 'registry:ui',
      content: rewritten,
    })
  }

  /** workspace 依赖检测 */
  const joined = entries.map((e) => e.content).join('\n')
  const registryDeps = new Set<string>([...compDeps].map((d) => `${NAMESPACE}/${kebab(d)}`))
  if (/from '@\/lib\/utils'/.test(joined)) registryDeps.add(`${NAMESPACE}/lib-utils`)
  if (/from '@\/lib\/types'/.test(joined)) registryDeps.add(`${NAMESPACE}/lib-types`)

  return makeItem(kebab(name), entries, {
    registryDependencies: [...registryDeps].sort(),
    dependencies: [...npmDeps]
      .map((d) =>
        NPM_DEPS_VERSION[d]
          ? `${d}@${NPM_DEPS_VERSION[d]}`
          : d
      )
      .sort(),
  })
}

function main() {
  const args = process.argv.slice(2)
  const components = args.length > 0
    ? args
    : REGISTRY_COMPONENTS

  fs.mkdirSync(OUT_DIR, { recursive: true })

  const items: RegistryItem[] = [...buildLibItems()]
  for (const name of components) {
    items.push(buildComponentItem(name))
  }

  for (const item of items) {
    const file = path.join(OUT_DIR, `${item.name}.json`)
    fs.writeFileSync(file, `${JSON.stringify(item, null, 2)}\n`)
    console.log(`✓ ${path.relative(REPO_ROOT, file)} (${item.files.length} files)`)
  }

  console.log(`\n共 ${items.length} 个 item。分发地址：/r/{name}.json`)
}

main()
