import type { SchemeCanvasProps } from './types'
import { memo } from 'react'
import { cn } from 'utils'
import { aiCollaborationStore, selectScheme } from '../../hooks/useAiCollab'
import { GenerationProgress } from './GenerationProgress'

export const SchemeCanvas = memo<SchemeCanvasProps>((props) => {
  const snap = aiCollaborationStore.use()
  const {
    planCandidates,
    isGenerating,
    selectedSchemeId,
    generationProgress,
    currentStep,
    generationLogs,
  } = snap
  const { className, style } = props

  const hasSchemes = planCandidates.length > 0

  return (
    <section
      className={ cn(
        'SchemeCanvas flex flex-1 flex-col gap-6 rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-slate-500 shadow-inner transition-colors duration-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400',
        className,
      ) }
      style={ style }
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">方案展示画布</h2>
          <p className="text-sm">
            { isGenerating
              ? 'AI 正在智能分析需求并生成方案，请稍候…'
              : hasSchemes
                ? '点击方案可展开讨论与细化。'
                : '输入需求并点击“开始生成”，AI 将自动生成多个方案供你选择。' }
          </p>
        </div>
      </div>

      {/* 生成中状态：显示进度组件 */}
      { isGenerating
        ? (
            <GenerationProgress
              progress={ generationProgress * 100 }
              currentStep={ currentStep }
              logs={ generationLogs }
            />
          )
        : (
            <div className="grid flex-1 place-items-center rounded-2xl border border-slate-200 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-950/40">
              { hasSchemes
                ? (
                    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      { planCandidates.map(scheme => (
                        <button
                          key={ scheme.id }
                          type="button"
                          onClick={ () => selectScheme(scheme.id) }
                          className={ cn(
                            'flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-5 text-left transition hover:-translate-y-1 hover:border-slate-400 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80 dark:hover:border-slate-500',
                            selectedSchemeId === scheme.id && 'border-slate-900 shadow-xl ring-4 ring-slate-900/20 dark:border-emerald-400 dark:ring-emerald-400/20',
                          ) }
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{ scheme.title }</h3>
                            <span className="text-xs uppercase tracking-wide text-slate-400">{ scheme.status }</span>
                          </div>
                          <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{ scheme.problemStatement }</p>
                        </button>
                      )) }
                    </div>
                  )
                : (
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="size-16 rounded-full bg-slate-900/10 dark:bg-slate-100/10" />
                      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                        后续将引入 `SchemeCard`、`SchemeComparison` 等组件，展示 AI 方案细节与评分。
                      </p>
                    </div>
                  ) }
            </div>
          ) }
    </section>
  )
})

SchemeCanvas.displayName = 'SchemeCanvas'
