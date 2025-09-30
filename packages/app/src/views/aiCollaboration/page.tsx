import type { AiCollaborationPageProps } from './types'
import { motion } from 'framer-motion'
import { memo, useEffect, useState } from 'react'
import { nanoid } from 'nanoid'
import { cn } from 'utils'
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar'
import { HistoryList, RequirementInput, SchemeCanvas } from './components'
import { aiCollaborationStore, setPlanCandidates, startGeneratingRequirement } from './hooks/useAiCollab'
import { useHistoryManager } from './hooks/useHistoryManager'
import { createMockCandidateBundles, loadMockData } from './mocks'

function AiCollaborationPage(props: AiCollaborationPageProps) {
  const { className, style } = props
  const snap = aiCollaborationStore.use()
  const historyManager = useHistoryManager()

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    /** 开发环境加载mock数据 */
    if (process.env.NODE_ENV === 'development') {
      loadMockData({ sessionCount: 5 })
    }
    else {
      historyManager.loadHistory().then((list) => {
        if (!list.length)
          return
        // @TODO: 后续接入全局状态管理，将历史记录放入 store
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={ cn(
        'AiCollaborationPage relative flex h-screen w-full overflow-hidden bg-slate-100/60 text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100',
        className,
      ) }
      style={ style }
    >
      <CollapsibleSidebar
        expandedWidth={ 320 }
        collapsedWidth={ 120 }
        isCollapsed={ isSidebarCollapsed }
        onToggle={ () => setIsSidebarCollapsed(prev => !prev) }
        animationType="tween"
        animationDuration={ 0.18 }
        className={ cn(
          'hidden h-full flex-col gap-4 border-r border-slate-200 bg-white/80 backdrop-blur transition-[padding] duration-200 ease-out xl:flex dark:border-slate-800 dark:bg-slate-900/80',
          isSidebarCollapsed
            ? 'px-3 py-6'
            : 'p-6',
        ) }
        contentClassName="flex h-full flex-col gap-6"
      >
        {!isSidebarCollapsed && <SidebarHeader />}
        <HistoryList
          sessions={ JSON.parse(JSON.stringify(snap.historyList)) }
          selectedId={ snap.selectedHistoryId }
          isCollapsed={ isSidebarCollapsed }
          onSelect={ (sessionId) => {
            aiCollaborationStore.selectedHistoryId = sessionId
            const session = snap.historyList.find(s => s.id === sessionId)
            if (session) {
              /** 深拷贝以避免readonly类型问题 */
              aiCollaborationStore.currentSession = JSON.parse(JSON.stringify(session))
              aiCollaborationStore.requirementDraft = session.requirement
              aiCollaborationStore.config = JSON.parse(JSON.stringify(session.config))
              aiCollaborationStore.phase = session.phase
              aiCollaborationStore.analysisSnapshots = JSON.parse(JSON.stringify(session.analysisSnapshots))
              aiCollaborationStore.planCandidates = JSON.parse(JSON.stringify(session.planCandidates))
              aiCollaborationStore.discussionThreads = JSON.parse(JSON.stringify(session.discussionThreads))
              aiCollaborationStore.timeline = JSON.parse(JSON.stringify(session.timeline))
              aiCollaborationStore.selectedSchemeId = session.selectedSchemeId
              aiCollaborationStore.decisionDraft = session.decisions?.[0]
                ? JSON.parse(JSON.stringify(session.decisions[0]))
                : null
            }
          } }
        />
      </CollapsibleSidebar>

      <main className="relative flex h-full flex-1 flex-col overflow-y-auto px-4 py-8 md:px-8 lg:px-14">
        <motion.div
          initial={ { opacity: 0, y: 40 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.6, ease: 'easeOut' } }
          className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 pb-10"
        >
          <PageHeader />

          <RequirementInput
            className="overflow-hidden"
            value={ snap.requirementDraft }
            config={ JSON.parse(JSON.stringify(snap.config)) }
            loading={ snap.isGenerating }
            contexts={ snap.currentSession?.contextSummaries
              ? JSON.parse(JSON.stringify(snap.currentSession.contextSummaries))
              : [] }
            selectedContextIds={ JSON.parse(JSON.stringify(snap.selectedContextIds)) }
            onChange={ (draft) => {
              aiCollaborationStore.requirementDraft = draft
            } }
            onConfigChange={ (config) => {
              aiCollaborationStore.config = {
                ...aiCollaborationStore.config,
                ...config,
              }
            } }
            onContextChange={ (selectedIds) => {
              aiCollaborationStore.selectedContextIds = selectedIds
            } }
            onSubmit={ (content) => {
              if (!content.trim())
                return
              startGeneratingRequirement(content)

              // 模拟 AI 生成过程（带进度和日志）
              const steps = [
                { progress: 0.2, step: '正在分析需求复杂度...', log: '✓ 已提取关键需求', type: 'success' as const },
                { progress: 0.4, step: '确定讨论轮数和方案数量...', log: '↻ 决定生成 3 个方案', type: 'info' as const },
                { progress: 0.6, step: '生成方案 1/3...', log: '↻ 正在生成方案 1', type: 'info' as const },
                { progress: 0.75, step: '生成方案 2/3...', log: '↻ 正在生成方案 2', type: 'info' as const },
                { progress: 0.9, step: '生成方案 3/3...', log: '↻ 正在生成方案 3', type: 'info' as const },
                { progress: 1, step: '生成完成', log: '✓ 已生成 3 个方案', type: 'success' as const },
              ]

              steps.forEach((stepData, index) => {
                setTimeout(() => {
                  aiCollaborationStore.generationProgress = stepData.progress
                  aiCollaborationStore.currentStep = stepData.step
                  aiCollaborationStore.generationLogs.push({
                    id: nanoid(),
                    message: stepData.log,
                    type: stepData.type,
                    timestamp: Date.now(),
                  })

                  // 最后一步：生成方案
                  if (index === steps.length - 1) {
                    const { candidates } = createMockCandidateBundles(3) // AI 自动决定生成 3 个方案
                    setPlanCandidates(candidates)
                  }
                }, index * 400)
              })
            } }
          />

          <SchemeCanvas />
        </motion.div>
      </main>
    </div>
  )
}

const SidebarHeader = memo(() => {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-widest text-slate-400">History</p>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">协作记录</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">在这里管理历史协作，快速回顾方案沉淀。</p>
      <button className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300">
        新建协作
      </button>
    </div>
  )
})

SidebarHeader.displayName = 'SidebarHeader'

const PageHeader = memo(() => {
  return (
    <header className="flex flex-col gap-3">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs uppercase tracking-widest text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        AI Collaboration Suite
      </div>
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl">
        项目协作，一体化智能助理
      </h1>
      <p className="max-w-3xl text-base text-slate-600 dark:text-slate-300">
        输入项目需求，AI 将根据复杂度自动生成多套执行方案。支持历史记录回溯、上下文复用以及未来的多轮 Agent 协作。
      </p>
    </header>
  )
})

PageHeader.displayName = 'PageHeader'

AiCollaborationPage.displayName = 'AiCollaborationPage'

export default memo(AiCollaborationPage)