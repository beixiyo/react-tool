'use client'

/**
 * 组件文档壳
 *
 * comps 演示页（自动路由的 Test.tsx）外层的站点导航壳：
 * 粘性顶栏提供组件名、描述、返回画廊、API 文档 / 源码面板与 GitHub 链接
 * 不侵入 Test.tsx 本身，demo 页保持全屏主角
 */
import { documentedComponents } from '@/generated/documentedComponents'
import { useNavigate } from '@jl-org/react-router'
import { Code2, Github, LayoutGrid, Table2 } from 'lucide-react'
import { memo, useCallback, useState } from 'react'
import { cn } from 'utils'
import { COMPONENT_DESCRIPTIONS } from '../PageSnapshots/tools/pageDescriptions'
import { DocPanel } from './DocPanel'
import type { DocPanelKind, DocShellProps } from './types'

const GITHUB_REPO = 'https://github.com/beixiyo/react-tool'

/** 已生成 API 文档的组件名单（主包只携带名单，大数据在面板打开时懒加载） */
const documentedSet = new Set(documentedComponents)

/** 组件目录名（小写）→ 描述文案 */
const descByLowerName = new Map<string, string>()
for (const [name, desc] of Object.entries(COMPONENT_DESCRIPTIONS)) {
  descByLowerName.set(name.toLowerCase(), desc)
}

/**
 * 组件文档壳
 *
 * @example
 * ```tsx
 * <DocShell name="Button">
 *   <ButtonTest />
 * </DocShell>
 * ```
 */
export const DocShell = memo<DocShellProps>(({ name, children }) => {
  const navigate = useNavigate()
  const [panelKind, setPanelKind] = useState<DocPanelKind | null>(null)

  const dirName = name.replace(/^\//, '')
  const hasDoc = documentedSet.has(dirName.toLowerCase())
  const description = descByLowerName.get(dirName.toLowerCase())

  const openProps = useCallback(() => setPanelKind('props'), [])
  const openCode = useCallback(() => setPanelKind('code'), [])
  const closePanel = useCallback(() => setPanelKind(null), [])
  const backToGallery = useCallback(() => navigate('/'), [navigate])

  return (
    <div className="flex h-dvh min-w-0 flex-col">
      <header className="border-border bg-background/85 z-40 shrink-0 border-b backdrop-blur-md">
        <div className="mx-auto flex h-13 max-w-6xl items-center gap-3 px-4">
          <button
            type="button"
            aria-label="返回组件目录"
            title="返回组件目录"
            onClick={ backToGallery }
            className="text-text2 hover:bg-background2 hover:text-text flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
          >
            <LayoutGrid className="size-4.5" />
          </button>

          <h1 className="text-text shrink-0 font-mono text-sm font-semibold">
            { dirName }
          </h1>
          { description && (
            <p className="text-text2 hidden min-w-0 truncate text-sm md:block">
              { description }
            </p>
          ) }

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              aria-disabled={ !hasDoc }
              aria-label="查看 API 文档"
              title={ hasDoc
                ? 'API 文档'
                : '该组件暂无可提取的 API 声明' }
              onClick={ hasDoc
                ? openProps
                : undefined }
              className={ cn(
                'flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors',
                hasDoc
                  ? 'text-text2 hover:bg-background2 hover:text-text'
                  : 'pointer-events-none text-text2/40',
              ) }
            >
              <Table2 className="size-3.5" />
              API
            </button>

            <button
              type="button"
              aria-label="查看源码"
              title="源码"
              onClick={ openCode }
              className="text-text2 hover:bg-background2 hover:text-text flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors"
            >
              <Code2 className="size-3.5" />
              源码
            </button>

            <a
              href={ `${GITHUB_REPO}/tree/main/packages/comps/src/components/${dirName}` }
              target="_blank"
              rel="noreferrer"
              aria-label="在 GitHub 查看该组件源码目录"
              title="GitHub"
              className="text-text2 hover:bg-background2 hover:text-text flex size-8 items-center justify-center rounded-md transition-colors"
            >
              <Github className="size-4" />
            </a>
          </div>
        </div>
      </header>

      { /* 演示区使用顶栏下方的剩余高度，长页面只在此区域滚动 */ }
      <main className="min-h-0 min-w-0 flex-1 overflow-auto">
        { children }
      </main>

      <DocPanel
        kind={ panelKind }
        dirName={ dirName }
        onClose={ closePanel }
      />
    </div>
  )
})
