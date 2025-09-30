import type { RequirementInputProps } from './types'
import { memo } from 'react'
import { cn } from 'utils'
import { Textarea } from '@/components/Textarea'
import { ConfigPanel } from './ConfigPanel'
import { ContextSelector } from './ContextSelector'

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
    compact,
    contexts = [],
    selectedContextIds = [],
    onContextChange,
  } = props

  return (
    <div
      className={ cn(
        'RequirementInput flex w-full min-h-[360px] flex-col gap-4 rounded-3xl border border-slate-200 bg-white shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900',
        compact
          ? 'p-4 md:p-5'
          : 'p-6 md:p-8',
        className,
      ) }
      style={ style }
    >
      { compact
        ? (
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">协作配置</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">展开左侧栏查看更多配置选项。</p>
              </div>
              <button
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-200 dark:hover:text-slate-100"
                onClick={ () => onSubmit?.(value || '') }
                disabled={ loading }
                type="button"
              >
                快速生成
              </button>
            </div>
          )
        : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="flex-1">
                  <ConfigPanel
                    config={ config }
                    loading={ loading }
                    onChange={ onConfigChange }
                  />
                </div>
              </div>

              {contexts.length > 0 && (
                <ContextSelector
                  contexts={ contexts }
                  selectedIds={ selectedContextIds }
                  onChange={ onContextChange }
                />
              )}
            </div>
          ) }

      {/* @TODO: 替换为 ChatInput 组件，融入提示词、历史记录等能力 */}
      <div className="flex max-h-[320px] flex-col gap-4 overflow-hidden">
        <Textarea
          value={ value }
          onChange={ onChange }
          placeholder="请描述你的项目需求、目标和限制"
          className="min-h-[160px] flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base leading-relaxed text-slate-700 shadow-inner transition focus:border-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200"
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400">支持粘贴文档、链接与结构化需求，后续将提供自动摘要能力。</div>
          <button
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            onClick={ () => onSubmit?.(value || '') }
            disabled={ loading }
            type="button"
          >
            立即开始
          </button>
        </div>
      </div>
    </div>
  )
})

RequirementInput.displayName = 'RequirementInput'
