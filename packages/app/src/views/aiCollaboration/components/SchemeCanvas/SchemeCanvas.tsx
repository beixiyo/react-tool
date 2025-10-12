import type { SchemeCanvasProps } from './types'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { aiCollaborationStore, confirmSchemeSelection, selectScheme } from '../../hooks/useAiCollab'
import { useHistoryManager } from '../../hooks/useHistoryManager'
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
    currentSession,
  } = snap
  const { className, style } = props
  const historyManager = useHistoryManager()

  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const hasSchemes = planCandidates.length > 0
  const hasSelection = !!selectedSchemeId

  const handleConfirmSelection = async () => {
    const confirmed = confirmSchemeSelection()
    if (!confirmed)
      return

    setIsSaving(true)
    try {
      /** 保存到历史记录 */
      if (currentSession) {
        /** 深拷贝以避免 readonly 类型问题 */
        const sessionToSave = JSON.parse(JSON.stringify(currentSession))
        await historyManager.saveSession(sessionToSave)

        /** 更新历史列表 */
        const updatedList = await historyManager.loadHistory()
        aiCollaborationStore.historyList = updatedList

        /** 设置成功状态 */
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    }
    catch (error) {
      console.error('保存会话失败:', error)
      aiCollaborationStore.error = '保存失败，请重试'
    }
    finally {
      setIsSaving(false)
    }
  }

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
            <GenerationProgress />
          )
        : (
            <div className="flex flex-1 flex-col gap-4">
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

              {/* 确认选择按钮区域 */}
              { hasSchemes && (
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-slate-700 dark:bg-slate-900/80">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      { hasSelection
                        ? '已选择方案，点击确认保存到历史记录'
                        : '请先选择一个方案' }
                    </p>
                    { saveSuccess && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ✓ 已成功保存到历史记录
                      </p>
                    ) }
                    { snap.error && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        { snap.error }
                      </p>
                    ) }
                  </div>
                  <button
                    onClick={ handleConfirmSelection }
                    disabled={ !hasSelection || isSaving }
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                  >
                    { isSaving
                      ? (
                          <>
                            <svg className="size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            保存中...
                          </>
                        )
                      : saveSuccess
                        ? '✓ 已保存'
                        : '确认选择' }
                  </button>
                </div>
              ) }
            </div>
          ) }
    </section>
  )
})

SchemeCanvas.displayName = 'SchemeCanvas'
