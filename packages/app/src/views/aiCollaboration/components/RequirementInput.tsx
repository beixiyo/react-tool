/**
 * 需求输入组件
 */

import { Textarea } from 'comps'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { useSnapshot } from 'valtio'
import { workflowStore } from '../hooks/useWorkflow'

export type RequirementInputProps = {
  className?: string
  style?: React.CSSProperties
  onSubmit?: (requirement: string) => void
}

export const RequirementInput = memo<RequirementInputProps>((props) => {
  const {
    className,
    style,
    onSubmit,
  } = props

  const snap = useSnapshot(workflowStore, { sync: true })
  const [draft, setDraft] = useState('')

  return (
    <div
      className={ cn(
        'RequirementInput flex w-full flex-col gap-6 rounded-3xl border border-slate-200 bg-white shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900',
        'p-6 md:p-8',
        className,
      ) }
      style={ style }
    >
      {/* 页面标题 */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          描述你的需求
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          AI 将通过多轮对话收集信息，生成多个方案供您选择，并可选择性地进行深入讨论。
        </p>
      </div>

      {/* 需求输入区 */}
      <div className="flex flex-col gap-4">
        <Textarea
          value={ draft }
          onChange={ setDraft }
          placeholder="请描述你的项目需求、目标和限制……"
          className="min-h-[160px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base leading-relaxed text-slate-700 shadow-inner transition focus:border-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200"
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            支持粘贴文档、链接与结构化需求
          </div>
          <button
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            onClick={ () => {
              if (draft.trim()) {
                onSubmit?.(draft.trim())
              }
            } }
            disabled={ snap.isGenerating || !draft.trim() }
            type="button"
          >
            {snap.isGenerating
              ? 'AI 处理中...'
              : '开始协作'}
          </button>
        </div>
      </div>
    </div>
  )
})

RequirementInput.displayName = 'RequirementInput'
