import { motion } from 'framer-motion'
import { memo, useEffect, useMemo, useState } from 'react'
import { cn } from 'utils'
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar'
import { RequirementInput, SchemeCanvas, HistoryList } from './components'
import { aiCollaborationStore, selectScheme, setPlanCandidates, startGeneratingRequirement } from './hooks/useAiCollab'
import { useHistoryManager } from './hooks/useHistoryManager'
import { loadMockData, createMockCandidateBundles } from './mocks'
import type { AiCollaborationPageProps, SessionConfig } from './types'

function AiCollaborationPage(props: AiCollaborationPageProps) {
  const { className, style } = props
  const snap = aiCollaborationStore.use()
  const historyManager = useHistoryManager()

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    // 开发环境加载mock数据
    if (process.env.NODE_ENV === 'development') {
      loadMockData({ sessionCount: 5 })
    } else {
      historyManager.loadHistory().then((list) => {
        if (!list.length) return
        // @TODO: 后续接入全局状态管理，将历史记录放入 store
      })
    }
  }, [historyManager])

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
        collapsedWidth={ 88 }
        isCollapsed={ isSidebarCollapsed }
        onToggle={ () => setIsSidebarCollapsed(prev => !prev) }
        animationType="tween"
        animationDuration={ 0.18 }
        className={ cn(
          'hidden h-full flex-col gap-4 border-r border-slate-200 bg-white/80 backdrop-blur transition-[padding] duration-200 ease-out xl:flex dark:border-slate-800 dark:bg-slate-900/80',
          isSidebarCollapsed ? 'p-4' : 'p-6',
        ) }
        contentClassName={ cn(
          'flex h-full flex-col gap-6 transition-opacity duration-150 ease-out',
          isSidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100',
        ) }
      >
        <SidebarHeader />
        <HistoryList
          sessions={JSON.parse(JSON.stringify(snap.historyList))}
          selectedId={snap.selectedHistoryId}
          onSelect={(sessionId) => {
            aiCollaborationStore.selectedHistoryId = sessionId
            const session = snap.historyList.find(s => s.id === sessionId)
            if (session) {
              // 深拷贝以避免readonly类型问题
              aiCollaborationStore.currentSession = JSON.parse(JSON.stringify(session))
              aiCollaborationStore.requirementDraft = session.requirement
              aiCollaborationStore.config = JSON.parse(JSON.stringify(session.config))
              aiCollaborationStore.phase = session.phase
              aiCollaborationStore.analysisSnapshots = JSON.parse(JSON.stringify(session.analysisSnapshots))
              aiCollaborationStore.planCandidates = JSON.parse(JSON.stringify(session.planCandidates))
              aiCollaborationStore.discussionThreads = JSON.parse(JSON.stringify(session.discussionThreads))
              aiCollaborationStore.timeline = JSON.parse(JSON.stringify(session.timeline))
              aiCollaborationStore.selectedSchemeId = session.selectedSchemeId
              aiCollaborationStore.decisionDraft = session.decisions?.[0] ? JSON.parse(JSON.stringify(session.decisions[0])) : null
            }
          }}
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
            config={ snap.config as SessionConfig }
            loading={ snap.isGenerating }
            contexts={ snap.currentSession?.contextSummaries ? JSON.parse(JSON.stringify(snap.currentSession.contextSummaries)) : [] }
            selectedContextIds={ JSON.parse(JSON.stringify(snap.selectedContextIds)) }
            onChange={ (draft) => {
              aiCollaborationStore.requirementDraft = draft
            } }
            onConfigChange={ (config) => {
              aiCollaborationStore.config = {
                ...aiCollaborationStore.config,
                discussionRounds: config.discussionRounds,
                schemeCount: config.schemeCount,
              }
            } }
            onContextChange={ (selectedIds) => {
              aiCollaborationStore.selectedContextIds = selectedIds
            } }
            onSubmit={ (content) => {
              if (!content.trim()) return
              startGeneratingRequirement(content)
              setTimeout(() => {
                const { candidates } = createMockCandidateBundles(aiCollaborationStore.config.schemeCount)
                setPlanCandidates(candidates)
              }, 1200)
            } }
            compact={ isSidebarCollapsed }
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
        输入项目需求，配置讨论策略，AI 团队将自动生成多套执行方案。支持历史记录回溯、上下文复用以及未来的多轮 Agent 协作。
      </p>
    </header>
  )
})

PageHeader.displayName = 'PageHeader'

const SchemeCanvasPlaceholder = memo(() => {
  return (
    <section className="flex flex-1 flex-col gap-6 rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-slate-500 shadow-inner transition-colors duration-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">方案展示画布</h2>
        <p className="text-sm">完成需求输入后，将在此展示 AI 生成的方案卡片、对比视图和讨论过程。</p>
      </div>
      <div className="grid flex-1 place-items-center rounded-2xl border border-slate-200 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-950/40">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="size-16 rounded-full bg-slate-900/10 dark:bg-slate-100/10" />
          <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">后续将引入 `SchemeCard`、`SchemeComparison` 等组件，展示 AI 方案细节与评分。</p>
        </div>
      </div>
    </section>
  )
})

SchemeCanvasPlaceholder.displayName = 'SchemeCanvasPlaceholder'

AiCollaborationPage.displayName = 'AiCollaborationPage'

export default memo(AiCollaborationPage)


