import type { RequirementInputProps } from './types'
import { Textarea } from 'comps'
import { memo } from 'react'
import { cn } from 'utils'

export const RequirementInput = memo<RequirementInputProps>((props) => {
  const {
    className,
    style,
    value,
    config,
    loading,
    onSubmit,
    onChange,
    onConfigChange,
  } = props

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
          AI 将根据需求复杂度自动决定讨论轮数和生成方案数量。需要参考历史？在左侧历史列表点击
          { ' ' }
          <span className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            ➕
          </span>
          { ' ' }
          添加上下文。
        </p>
      </div>

      {/* 需求输入区 */}
      <div className="flex flex-col gap-4">
        <Textarea
          value={ value }
          onChange={ onChange }
          placeholder="请描述你的项目需求、目标和限制……"
          className="min-h-[160px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base leading-relaxed text-slate-700 shadow-inner transition focus:border-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200"
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            支持粘贴文档、链接与结构化需求，后续将提供自动摘要能力。
          </div>
          <button
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            onClick={ () => onSubmit?.(value || '') }
            disabled={ loading || !value?.trim() }
            type="button"
          >
            {loading
              ? 'AI 生成中...'
              : '开始生成'}
          </button>
        </div>
      </div>
    </div>
  )
})

RequirementInput.displayName = 'RequirementInput'
