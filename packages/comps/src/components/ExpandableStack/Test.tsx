import { useMemo } from 'react'
import { ExpandableStack } from '.'
import { CloseBtn } from '../CloseBtn'
import { ThemeToggle } from '../ThemeToggle'

export default function Test() {
  const items = useMemo<DemoItem[]>(() => [
    {
      id: 's1',
      stepNumber: 1,
      stepName: '解析用户输入',
      timestamp: Date.now() - 1000 * 60 * 3,
      thinkingContent: '分析用户意图和上下文，确定任务目标。',
      streamContent: '已提取关键字：React、Tailwind、优化。',
    },
    {
      id: 's2',
      stepNumber: 2,
      stepName: '构建初始方案',
      timestamp: Date.now() - 1000 * 60 * 2,
      thinkingContent: '列出可能的实现路径，评估复杂度。',
      streamContent: '采用 ExpandableStack 统一历史步骤交互。',
    },
    {
      id: 's3',
      stepNumber: 3,
      stepName: '输出结果',
      timestamp: Date.now() - 1000 * 60 * 1,
      thinkingContent: '准备对外展示和可复制的结果内容。',
      streamContent: '生成最终界面并渲染到页面。',
    },
  ], [])

  return (
    <div className="h-screen overflow-auto p-6">
      <ThemeToggle />
      <div className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">ExpandableStack - Test</div>

      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white/60 p-6 shadow-xs backdrop-blur-xs dark:border-slate-700/80 dark:bg-slate-900/60">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          这是一个演示页，右上角展示三条历史步骤，可展开查看详情。
        </div>
      </div>

      <ExpandableStack
        items={ items }
        defaultExpandedId={ null }
        position="top-right"
        expandedPlacement="top-right"
        expandedWidth={ 560 }
        expandedMaxHeight="calc(100vh - 2rem)"
        stackSpacing={ 0 }
        collapsedOpacity={ 0.4 }
        zIndexBase={ 40 }
        itemClassName="border-slate-200/80 bg-white/90 dark:border-slate-700/80 dark:bg-slate-800/90"
        expandedClassName="max-h-[calc(100vh-2rem)] border-slate-300 bg-white/95 dark:border-slate-600 dark:bg-slate-900/95"
        renderCollapsed={ step => (
          <div className="flex items-center gap-3 p-3">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-md shadow-indigo-500/30">
              { step.stepNumber }
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <div className="truncate text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
                { step.stepName }
              </div>
              <div className="text-xs leading-snug text-slate-500 dark:text-slate-400">
                { new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
              </div>
            </div>
          </div>
        ) }
        renderExpanded={ (step, _index, close) => (
          <>
            <div className="shrink-0 border-b border-slate-200 p-6 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
                    { step.stepNumber }
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      { step.stepName }
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      { new Date(step.timestamp).toLocaleString() }
                    </div>
                  </div>
                </div>
                <CloseBtn
                  onClick={ (e) => { e.stopPropagation(); close() } }
                  size="sm"
                  mode="static"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                { step.thinkingContent && (
                  <div className="rounded-xl border border-amber-200/50 bg-linear-to-br from-amber-50 to-yellow-50/50 p-4 shadow-xs dark:border-amber-900/50 dark:from-amber-950/30 dark:to-yellow-950/30">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
                      <span className="text-lg">🤔</span>
                      思考过程
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-amber-950/80 dark:text-amber-100/80">
                      { step.thinkingContent }
                    </div>
                  </div>
                ) }

                { step.streamContent && (
                  <div className="rounded-xl border border-blue-200/50 bg-linear-to-br from-blue-50 to-indigo-50/50 p-4 shadow-xs dark:border-blue-900/50 dark:from-blue-950/30 dark:to-indigo-950/30">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-200">
                      <span className="text-lg">📝</span>
                      生成内容
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-blue-950/80 dark:text-blue-100/80">
                      { step.streamContent }
                    </div>
                  </div>
                ) }
              </div>
            </div>
          </>
        ) }
      />
    </div>
  )
}

type DemoItem = {
  id: string
  stepNumber: number
  stepName: string
  timestamp: number
  thinkingContent?: string
  streamContent?: string
}
