'use client'

/**
 * 文档面板
 *
 * 复用 comps 的 Modal 展示 API 属性表或组件源码：
 * Esc / 点击遮罩关闭（Modal 内置），内容超出时面板内部滚动
 */
import { CodeHighlight } from '@/components/CodeHighlight'
import type { ComponentPropsDoc } from '@/generated/componentProps'
import { Modal } from 'comps'
import { FileCode2 } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { PropsSection } from './PropsTable'
import type { DocPanelKind, DocPanelProps } from './types'

/** 源码文件懒加载表：路径 → loader，仅在面板打开时请求（分文件名声明，避免花括号 glob 不展开） */
const rawSources = {
  ...import.meta.glob('/../comps/src/components/**/Test.tsx', { query: '?raw', import: 'default' }),
  ...import.meta.glob('/../comps/src/components/**/index.tsx', { query: '?raw', import: 'default' }),
  ...import.meta.glob('/../comps/src/components/**/types.ts', { query: '?raw', import: 'default' }),
  ...import.meta.glob('/../comps/src/components/**/type.ts', { query: '?raw', import: 'default' }),
} as Record<string, () => Promise<string>>

interface SourceFile {
  filename: string
  code: string
}

/** 根据目录名取该组件可展示的源码文件 */
async function loadSources(dirName: string): Promise<SourceFile[]> {
  const prefix = `../comps/src/components/${dirName}/`
  const loaders = Object.entries(rawSources).filter(([key]) => key.toLowerCase().startsWith(prefix.toLowerCase()))

  const order = ['Test.tsx', 'index.tsx', 'types.ts', 'type.ts']
  const loaded = await Promise.all(
    loaders.map(async ([key, load]) => ({
      filename: key.slice(prefix.length),
      code: (await load()) as string,
    })),
  )
  return loaded.sort(
    (a, b) => order.indexOf(a.filename) - order.indexOf(b.filename),
  )
}

/**
 * API 文档主体
 *
 * 主 props 类型排在首位（生成脚本已排序），其余关联类型依次展示
 * 大体积生成数据懒加载：仅在首次打开 API 面板时拉取 componentProps 模块
 */
const PropsBody = memo<{ dirName: string }>(({ dirName }) => {
  /** null 表示尚未加载完成，undefined 表示加载完成但无数据 */
  const [doc, setDoc] = useState<ComponentPropsDoc | null | undefined>(null)

  useEffect(() => {
    let cancelled = false
    import('@/generated/componentProps')
      .then((m) => {
        if (cancelled) {
          return
        }
        const data = m.componentProps
        /** 键为组件目录名（PascalCase），路由可能任意大小写，做大小写不敏感回退 */
        const key = dirName in data
          ? dirName
          : Object.keys(data).find((k) => k.toLowerCase() === dirName.toLowerCase())
        setDoc(
          key !== undefined && key in data
            ? data[key]
            : undefined,
        )
      })
      .catch(() => {
        if (!cancelled) {
          setDoc(undefined)
        }
      })
    return () => {
      cancelled = true
    }
  }, [dirName])

  if (doc === null) {
    return <p className="py-10 text-center text-sm text-text2">API 文档加载中...</p>
  }

  if (!doc || doc.types.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-text2">
        该组件还没有可提取的 API 声明（types.ts）
      </p>
    )
  }

  return (
    <div>
      { doc.types.map((type, index) => (
        <PropsSection
          key={ type.name }
          type={ type }
          primary={ index === 0 }
        />
      )) }
    </div>
  )
})

/** 源码主体：文件切换 + 语法高亮 + 复制 */
const CodeBody = memo<{ dirName: string }>(({ dirName }) => {
  /** null 表示尚未加载完成 */
  const [files, setFiles] = useState<SourceFile[] | null>(null)
  const [active, setActive] = useState(0)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadSources(dirName)
      .then((loaded) => {
        if (!cancelled) {
          setFiles(loaded)
          setActive(0)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [dirName])

  if (error) {
    return <p className="py-10 text-center text-sm text-text2">源码加载失败</p>
  }

  if (files === null) {
    return <p className="py-10 text-center text-sm text-text2">源码加载中...</p>
  }

  if (files.length === 0) {
    return <p className="py-10 text-center text-sm text-text2">没有找到可展示的源码文件</p>
  }

  const current = files[Math.min(active, files.length - 1)]

  return (
    <div>
      { files.length > 1 && (
        <div
          role="tablist"
          aria-label="源码文件"
          className="mb-3 flex flex-wrap gap-2"
        >
          { files.map((file, index) => (
            <button
              key={ file.filename }
              type="button"
              role="tab"
              aria-selected={ index === active }
              onClick={ () => setActive(index) }
              className={ index === active
                ? 'rounded-md bg-systemOrange/15 px-3 py-1.5 font-mono text-xs text-systemOrange transition-colors'
                : 'rounded-md bg-background2 px-3 py-1.5 font-mono text-xs text-text2 transition-colors hover:text-text' }
            >
              { file.filename }
            </button>
          )) }
        </div>
      ) }

      <CodeHighlight
        key={ current.filename }
        code={ current.code }
        language="tsx"
        showLineNumbers
        copyable
        maxHeight="60vh"
      />
    </div>
  )
})

/**
 * 文档面板
 *
 * @example
 * ```tsx
 * <DocPanel kind="props" dirName="Button" onClose={close} />
 * ```
 */
export const DocPanel = memo<DocPanelProps>(({ kind, dirName, onClose }) => {
  /**
   * 关闭时 kind 立即变为 null，但 Modal 退出动画期间仍渲染 children
   * 保留最后一次打开的面板类型，避免退出动画里误挂载 CodeBody（拉源码 + 起高亮）
   */
  const [shownKind, setShownKind] = useState(kind)
  if (kind !== null && kind !== shownKind) {
    setShownKind(kind)
  }

  const title = shownKind === 'props'
    ? 'API 文档'
    : '源码'

  return (
    <Modal
      isOpen={ kind !== null }
      onClose={ onClose }
      width="min(56rem, calc(100vw - 2rem))"
      minWidth={ 0 }
      height="84vh"
      clickOutsideClose
      escToClose
      enterToConfirm={ false }
      innerCloseBtn
      ariaLabel={ `${dirName} ${title}` }
      header={ 
        <div className="flex items-center gap-2.5 pr-8">
          <FileCode2 className="size-4 text-systemOrange" />
          <h2 className="font-mono text-sm font-semibold">
            { dirName }
          </h2>
          <span className="text-sm text-text2">· { title }</span>
        </div>
       }
      footer={ null }
    >
      { shownKind === 'props' && <PropsBody dirName={ dirName } /> }
      { shownKind === 'code' && <CodeBody dirName={ dirName } /> }
    </Modal>
  )
})

export type { DocPanelKind }
