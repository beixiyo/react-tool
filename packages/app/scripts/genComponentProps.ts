/**
 * 组件 API 文档生成脚本
 *
 * 扫描 packages/comps/src/components 下每个组件目录的类型声明文件
 * （types.ts / type.ts / index.tsx 中的导出 interface 与 type），
 * 提取属性名、类型文本、可选性、JSDoc 描述与 @default 默认值，
 * 输出到 packages/app/src/generated/componentProps.ts 供 DocShell 渲染
 *
 * 运行：bun run scripts/genComponentProps.ts（或 pnpm --filter app run gen:props）
 */
import ts from '@typescript/typescript6'
import fs from 'node:fs'
import path from 'node:path'

const COMPS_DIR = path.resolve(import.meta.dir, '../../comps/src/components')
const OUT_FILE = path.resolve(import.meta.dir, '../src/generated/componentProps.ts')
const OUT_NAMES_FILE = path.resolve(import.meta.dir, '../src/generated/documentedComponents.ts')

interface PropDoc {
  name: string
  type: string
  optional: boolean
  description?: string
  default?: string
  deprecated?: boolean
}

interface TypeDoc {
  kind: 'interface' | 'alias'
  name: string
  description?: string
  extends?: string[]
  signature?: string
  props?: PropDoc[]
}

type ComponentDoc = {
  sourceFiles: string[]
  types: TypeDoc[]
}

/** 从 JSDoc 节点数组解析出描述、@default、@deprecated */
function parseJsDoc(node: ts.Node, sourceFile: ts.SourceFile): { description?: string; default?: string; deprecated?: boolean } {
  const docs = (ts.getJSDocCommentsAndTags(node) as ts.JSDoc[] | undefined) ?? []
  let description: string | undefined
  let def: string | undefined
  let deprecated = false

  for (const doc of docs) {
    /** 文件头横幅 JSDoc：前面只有空白，且与声明之间隔了空行；紧贴声明的仍是类型自己的文档 */
    const fullText = sourceFile.getFullText()
    const isFileBanner = fullText.slice(0, doc.pos).trim() === ''
      && /\n\s*\n/.test(fullText.slice(doc.end, node.getStart(sourceFile)))
    if (isFileBanner) {
      continue
    }
    if (doc.tags) {
      for (const tag of doc.tags) {
        const tagName = tag.tagName.text
        if (tagName === 'default' || tagName === 'defaultValue') {
          def = ts.isJSDocPropertyTag(tag) && typeof tag.comment === 'string'
            ? tag.comment.trim()
            : ts.getTextOfJSDocComment(tag.comment)?.trim()
        }
        else if (tagName === 'deprecated') {
          deprecated = true
        }
      }
    }
    const comment = ts.getTextOfJSDocComment(doc.comment)?.trim()
    if (comment && !description) {
      description = comment
    }
  }

  return { description, default: def, deprecated }
}

function nodeToText(node: ts.TypeNode | undefined, sourceFile: ts.SourceFile): string {
  if (!node) {
    return ''
  }
  const printer = ts.createPrinter({ removeComments: false })
  return ts.isUnionTypeNode(node) || ts.isLiteralTypeNode(node)
    ? printer.printNode(ts.EmitHint.Unspecified, node, sourceFile)
    : sourceFile.text.slice(node.getStart(sourceFile), node.end).trim()
}

/** 文件名是否为演示/测试文件（相对组件目录的路径） */
function isTestFile(relPath: string): boolean {
  return /(^|\/)(Test\d?\.tsx|test\.data\.ts|[^/]+\.test\.tsx?)$/.test(relPath)
    || relPath.includes('__tests__')
}

/**
 * 解析相对导入到组件目录内的真实文件
 *
 * 只跟随相对导入（./ ../），解析到边界外或不存在时返回 null
 */
function resolveLocal(fromDir: string, specifier: string, boundary: string): string | null {
  if (!specifier.startsWith('.')) {
    return null
  }
  const target = path.resolve(fromDir, specifier)
  const candidates = [
    target,
    `${target}.ts`,
    `${target}.tsx`,
    path.join(target, 'index.ts'),
    path.join(target, 'index.tsx'),
  ]
  for (const candidate of candidates) {
    if (candidate.endsWith('.d.ts') || !fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
      continue
    }
    if (path.relative(boundary, candidate).startsWith('..')) {
      return null
    }
    return candidate
  }
  return null
}

/**
 * 沿导出链收集组件公共类型
 *
 * 从入口（index.ts / index.tsx）出发 BFS 追 `export ... from './x'`，
 * 类型定义在哪个文件都能找到（<Name>.tsx、子目录 types.ts、hooks 等）；
 * 无入口文件时回退为扫描目录根部实现文件
 */
function extractFromDir(dirPath: string): ComponentDoc {
  const out: ComponentDoc = { sourceFiles: [], types: [] }
  const queue: string[] = []
  const visited = new Set<string>()

  const entry = ['index.ts', 'index.tsx']
    .map((file) => path.join(dirPath, file))
    .find((file) => fs.existsSync(file))

  if (entry) {
    queue.push(entry)
  }
  else {
    for (const file of fs.readdirSync(dirPath)) {
      if (/\.(ts|tsx)$/.test(file) && !isTestFile(file)) {
        queue.push(path.join(dirPath, file))
      }
    }
  }

  while (queue.length > 0) {
    const file = queue.shift()!
    if (visited.has(file)) {
      continue
    }
    visited.add(file)

    const rel = path.relative(dirPath, file)
    if (isTestFile(rel)) {
      continue
    }
    out.sourceFiles.push(rel)
    visitFile(file, dirPath, out, queue, visited)
  }

  /** 同名类型去重（同一声明可能经 barrel 与直接 import 两条路径到达），首个胜出 */
  const seen = new Set<string>()
  out.types = out.types.filter((t) => {
    if (seen.has(t.name)) {
      return false
    }
    seen.add(t.name)
    return true
  })

  return out
}

function visitFile(filePath: string, dirPath: string, out: ComponentDoc, queue: string[], visited: Set<string>): void {
  const sourceText = fs.readFileSync(filePath, 'utf-8')
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true)

  for (const stmt of sourceFile.statements) {
    /** 相对 re-export / import：沿依赖链继续追踪（文档需要组件用到的类型，即使未 re-export） */
    const moduleSpec = (ts.isExportDeclaration(stmt) || ts.isImportDeclaration(stmt))
        && stmt.moduleSpecifier
        && ts.isStringLiteral(stmt.moduleSpecifier)
      ? stmt.moduleSpecifier.text
      : null
    if (moduleSpec !== null) {
      const next = resolveLocal(path.dirname(filePath), moduleSpec, dirPath)
      if (next && !visited.has(next)) {
        queue.push(next)
      }
      if (ts.isExportDeclaration(stmt)) {
        continue
      }
    }

    const exported = stmt.modifiers?.some(
      (m) => m.kind === ts.SyntaxKind.ExportKeyword,
    ) ?? false
    /** 未导出但以 Props 结尾的类型也收集（文档价值高，如 Toolbar 的私有 ToolbarProps） */
    const nameIfTypeDecl = ts.isInterfaceDeclaration(stmt) || ts.isTypeAliasDeclaration(stmt)
      ? stmt.name.text
      : null
    if (!exported && !(nameIfTypeDecl && /Props$/.test(nameIfTypeDecl))) {
      continue
    }

    if (ts.isInterfaceDeclaration(stmt)) {
      const doc = parseJsDoc(stmt, sourceFile)
      out.types.push({
        kind: 'interface',
        name: stmt.name.text,
        description: doc.description,
        extends: stmt.heritageClauses?.map((h) => h.types.map((t) => t.expression.getText(sourceFile)).join(', ')),
        props: stmt.members
          .filter(ts.isPropertySignature)
          .filter((m) => m.name && m.type)
          .map((m) => {
            const memberDoc = parseJsDoc(m, sourceFile)
            return {
              name: m.name.getText(sourceFile).replace(/[("'`)]/g, ''),
              type: nodeToText(m.type, sourceFile),
              optional: !!m.questionToken,
              description: memberDoc.description,
              default: memberDoc.default,
              deprecated: memberDoc.deprecated,
            }
          }),
      })
    }
    else if (ts.isTypeAliasDeclaration(stmt)) {
      const doc = parseJsDoc(stmt, sourceFile)
      const literals: ts.TypeLiteralNode[] = []
      const bases: string[] = []
      const collect = (node: ts.TypeNode): void => {
        if (ts.isTypeLiteralNode(node)) {
          literals.push(node)
        }
        else if (ts.isIntersectionTypeNode(node)) {
          node.types.forEach(collect)
        }
        else {
          const text = nodeToText(node, sourceFile)
          if (text) {
            bases.push(text)
          }
        }
      }
      collect(stmt.type)

      /** 对象字面量形式的别名（含交叉类型）按 interface 解析成员，其余保留签名展示 */
      if (literals.length > 0) {
        out.types.push({
          kind: 'alias',
          name: stmt.name.text,
          description: doc.description,
          extends: bases.length > 0
            ? bases
            : undefined,
          props: literals.flatMap((l) =>
            l.members
              .filter(ts.isPropertySignature)
              .filter((m) => m.name && m.type)
              .map((m) => {
                const memberDoc = parseJsDoc(m, sourceFile)
                return {
                  name: m.name.getText(sourceFile).replace(/[("'`)]/g, ''),
                  type: nodeToText(m.type, sourceFile),
                  optional: !!m.questionToken,
                  description: memberDoc.description,
                  default: memberDoc.default,
                  deprecated: memberDoc.deprecated,
                }
              })
          ),
        })
      }
      else {
        out.types.push({
          kind: 'alias',
          name: stmt.name.text,
          description: doc.description,
          signature: nodeToText(stmt.type, sourceFile),
        })
      }
    }
  }
}

function main(): void {
  if (!fs.existsSync(COMPS_DIR)) {
    console.error(`comps components dir not found: ${COMPS_DIR}`)
    process.exit(1)
  }

  const result: Record<string, ComponentDoc> = {}
  const dirs = fs.readdirSync(COMPS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)

  for (const dir of dirs) {
    const doc = extractFromDir(path.join(COMPS_DIR, dir))
    if (doc.types.length > 0) {
      result[dir] = doc
    }
  }

  /** 主 props 类型排前面：优先 <DirName>Props，其次任意 *Props */
  const dirLowerCache = new Map<string, string>()
  for (const [dir, doc] of Object.entries(result)) {
    const dirLower = dir.toLowerCase()
    dirLowerCache.set(dir, dirLower)
    doc.types.sort((a, b) => {
      const score = (t: TypeDoc): number => {
        if (t.name.toLowerCase() === `${dirLower}props`) {
          return 0
        }
        return t.name.toLowerCase().endsWith('props')
          ? 1
          : 2
      }
      return score(a) - score(b)
    })
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  const banner = '/**\n'
    + ' * 自动生成：组件 API 文档数据，请勿手改\n'
    + ' * 重新生成：bun run packages/app/scripts/genComponentProps.ts\n'
    + ' */\n'
  fs.writeFileSync(
    OUT_NAMES_FILE,
    `${banner}export const documentedComponents: string[] = ${JSON.stringify(Object.keys(result).map((k) => k.toLowerCase()), null, 2)}\n`,
    'utf-8',
  )
  fs.writeFileSync(
    OUT_FILE,
    `${banner}export const componentProps = ${JSON.stringify(result, null, 2)} as Record<string, ComponentPropsDoc>\n\n`
      + `export type ComponentPropsDoc = {\n`
      + `    sourceFiles: string[]\n`
      + `    types: {\n`
      + `        kind: 'interface' | 'alias'\n`
      + `        name: string\n`
      + `        description?: string\n`
      + `        extends?: string[]\n`
      + `        signature?: string\n`
      + `        props?: {\n`
      + `            name: string\n`
      + `            type: string\n`
      + `            optional: boolean\n`
      + `            description?: string\n`
      + `            default?: string\n`
      + `            deprecated?: boolean\n`
      + `        }[]\n`
      + `    }[]\n`
      + `}\n`,
    'utf-8',
  )

  const typeCount = Object.values(result).reduce((sum, doc) => sum + doc.types.length, 0)
  const propCount = Object.values(result).reduce(
    (sum, doc) => sum + doc.types.reduce((s, t) => s + (t.props?.length ?? 0), 0),
    0,
  )
  console.log(`✓ ${Object.keys(result).length}/${dirs.length} 个组件，${typeCount} 个类型，${propCount} 个属性 → ${path.relative(process.cwd(), OUT_FILE)}`)
}

main()
