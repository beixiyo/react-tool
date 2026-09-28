// oxlint-disable no-unused-vars
/**
 * API 数据不变性比对（只读验证）
 *
 * 比对 HEAD 提交里的 componentProps 与工作区重新生成的版本：
 * 类型与属性只允许「新增」（类型转为公共导出），不允许丢失或内容变化
 * sourceFiles 字段随结构调整必然变化，不参与比对
 *
 * 用法：bun run packages/app/scripts/diffComponentProps.ts
 * 前置：先运行 genComponentProps.ts 重新生成工作区版本
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const FILE = 'packages/app/src/generated/componentProps.ts'

type TypeDoc = {
  kind: string
  name: string
  description?: string
  extends?: string[]
  signature?: string
  props?: { name: string; type: string; optional: boolean; description?: string; default?: string; deprecated?: boolean }[]
}
type Data = Record<string, { types: TypeDoc[] }>

function load(content: string): Data {
  const match = content.match(/export const componentProps = ([\s\S]*?) as Record</)
  if (!match) {
    throw new Error('无法从文件中解析 componentProps 数据')
  }
  return JSON.parse(match[1])
}

const repoRoot = path.resolve(import.meta.dir, '../../..')
process.chdir(repoRoot)

const headContent = execSync(`git show HEAD:${FILE}`, { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 8 })
const workContent = fs.readFileSync(FILE, 'utf-8')

const before = load(headContent)
const after = load(workContent)

let removed = 0
let changed = 0
let added = 0
const problems: string[] = []

for (const [dir, doc] of Object.entries(before)) {
  const afterDoc = after[dir]
  if (!afterDoc) {
    problems.push(`组件丢失: ${dir}（整个组件的数据消失）`)
    removed++
    continue
  }
  const norm = (x: TypeDoc) => JSON.stringify({ ...x, description: x.description?.trim() })
  /** 内容兼容判定：完全一致，或仅「描述从无到有」（迁移把组件 JSDoc 挂到类型上属信息增益） */
  const compatible = (a: TypeDoc, b: TypeDoc): boolean => {
    if (norm(a) === norm(b)) {
      return true
    }
    const { description: _bd, ...bRest } = b
    const { description: _ad, ...aRest } = a
    const restEqual = JSON.stringify(aRest) === JSON.stringify(bRest)
    /** 描述从无到有：信息增益 */
    if (restEqual && !b.description?.trim() && !!a.description?.trim()) {
      return true
    }
    /** 泛化横幅噪音描述（如「类型定义」「Xxx 类型声明」）被移除：迁移清污 */
    const isBannerNoise = (d?: string) => !!d?.trim().match(/^(类型定义|[\w\u4e00-\u9fa5]+ 类型声明)$/)
    return restEqual && isBannerNoise(b.description) && !a.description
  }
  const afterByName = new Map<string, TypeDoc[]>()
  for (const at of afterDoc.types) {
    afterByName.set(at.name, [...(afterByName.get(at.name) ?? []), at])
  }

  /** 同名多重集比对：同一内容的重复声明只比一次；同名存在但内容全不匹配才算变化 */
  const seenContent = new Set<string>()
  for (const t of doc.types) {
    const key = norm(t)
    if (seenContent.has(key)) {
      continue
    }
    seenContent.add(key)

    const candidates = afterByName.get(t.name) ?? []
    if (candidates.length === 0) {
      problems.push(`类型丢失: ${dir}/${t.name}`)
      removed++
      continue
    }
    /** 同名重复声明：任一变体内容存活即视为未丢失（扫描器去重后只保留一个变体） */
    if (!candidates.some((at) => compatible(at, t))) {
      const beforeVariants = doc.types.filter((x) => x.name === t.name)
      if (!candidates.some((at) => beforeVariants.some((bv) => compatible(at, bv)))) {
        problems.push(`类型变化: ${dir}/${t.name}`)
        changed++
      }
    }
  }
  const beforeNames = new Set(doc.types.map((t) => t.name))
  for (const at of afterDoc.types) {
    if (!beforeNames.has(at.name)) {
      added++
    }
  }
}

for (const dir of Object.keys(after)) {
  if (!before[dir]) {
    added++
    console.log(`+ 新组件数据: ${dir}`)
  }
}

console.log(`\n比对结果: 丢失 ${removed} / 变化 ${changed} / 新增 ${added}`)
if (problems.length > 0) {
  console.log('\n问题清单:')
  for (const p of problems) {
    console.log(`  ✗ ${p}`)
  }
  process.exit(1)
}
console.log('PASS: 无丢失、无内容变化（新增视为合法：类型转为公共导出）')
