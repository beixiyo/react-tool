/**
 * AI Workflow 主页面
 * 实现 9 步工作流程
 */

import type { AiWorkflowPageProps, BriefSolution } from './types'
import { CollapsibleSidebar } from 'comps'
import { motion } from 'framer-motion'
import { memo, useEffect, useState } from 'react'
import { cn } from 'utils'
import { useSnapshot } from 'valtio'
import {
  BriefSolutionList,
  DetailedSolutionView,
  HistoryList,
  ProgressIndicator,
  QuestionDialog,
  RequirementInput,
} from './components'
import {
  closeQuestionDialog,
  createNewWorkflow,
  finishGenerating,
  selectBriefSolution,
  setBriefSolutions,
  setDetailedSolution,
  showQuestions,
  startGenerating,
  submitAnswers,
  updateProgress,
  updateStage,
  workflowStore,
} from './hooks/useWorkflow'
import {
  mockCheckCompleteness,
  mockGenerateBriefSolutions,
  mockGenerateDetailedSolution,
  mockGenerateQuestions,
} from './mocks'
import { WorkflowStage } from './types'

export default function AiWorkflowPage(props: AiWorkflowPageProps) {
  const { className, style } = props
  const snap = useSnapshot(workflowStore, { sync: true })
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    /** 初始化：可以加载历史记录等 */
  }, [])

  /**
   * 步骤 1: 开始工作流
   */
  const handleStartWorkflow = async (requirement: string) => {
    /** 创建新会话 */
    const session = createNewWorkflow(requirement)

    /** 模拟：检查是否需要补充信息 */
    startGenerating('正在分析需求...')

    await simulateDelay(1000)
    updateProgress(0.3, '分析需求复杂度...', '✓ 需求已接收', 'success')

    await simulateDelay(800)
    updateProgress(0.6, '生成问题列表...', '↻ 准备问题', 'info')

    await simulateDelay(800)

    /** 生成问题 */
    const questionList = mockGenerateQuestions(requirement)
    showQuestions(questionList.questions)

    finishGenerating()
    updateProgress(1, '问题生成完成', '✓ 请回答问题以继续', 'success')
  }

  /**
   * 步骤 2-4: 合并答案 → 检查完整性 → 生成更多问题（循环）
   */
  const handleSubmitAnswers = async (answers: Record<string, string>) => {
    submitAnswers(answers)
    closeQuestionDialog()

    startGenerating('正在检查信息完整性...')

    await simulateDelay(1000)
    updateProgress(0.5, '分析已收集的信息...', '↻ 检查中', 'info')

    await simulateDelay(1000)

    /** 检查完整性 */
    const completenessResult = mockCheckCompleteness(
      snap.currentSession?.requirement || '',
      answers,
    )

    if (completenessResult.isComplete) {
      /** 信息完整，进入下一阶段 */
      updateProgress(1, '信息收集完成', '✓ 开始生成方案', 'success')
      finishGenerating()

      await simulateDelay(500)
      handleGenerateBriefSolutions()
    }
    else {
      /** 信息不完整，生成更多问题 */
      updateProgress(0.8, '生成补充问题...', '↻ 需要更多信息', 'warning')

      await simulateDelay(1000)

      const moreQuestions = mockGenerateQuestions(snap.currentSession?.requirement || '')
      showQuestions(moreQuestions.questions)

      finishGenerating()
      updateProgress(1, '补充问题已生成', '✓ 请继续回答', 'success')
    }
  }

  /**
   * 步骤 5: 生成简略方案
   */
  const handleGenerateBriefSolutions = async () => {
    startGenerating('正在生成简略方案...')
    updateStage(WorkflowStage.BRIEF_SOLUTION_GENERATION)

    await simulateDelay(1000)
    updateProgress(0.2, '分析需求复杂度...', '✓ 复杂度评估完成', 'success')

    await simulateDelay(1000)
    updateProgress(0.4, '确定方案数量...', '↻ 决定生成 3 个方案', 'info')

    await simulateDelay(1500)
    updateProgress(0.6, '生成方案 1/3...', '↻ 正在生成', 'info')

    await simulateDelay(1500)
    updateProgress(0.8, '生成方案 2/3...', '↻ 正在生成', 'info')

    await simulateDelay(1500)
    updateProgress(0.95, '生成方案 3/3...', '↻ 正在生成', 'info')

    await simulateDelay(1000)

    /** 生成方案 */
    const solutionList = mockGenerateBriefSolutions(snap.currentSession?.requirement || '')
    setBriefSolutions(solutionList.solutions, solutionList.summary)

    updateProgress(1, '方案生成完成', '✓ 已生成 3 个方案', 'success')
    finishGenerating()
  }

  /**
   * 步骤 6: 选择方案
   */
  const handleSelectSolution = (solutionId: string) => {
    selectBriefSolution(solutionId)
  }

  /**
   * 步骤 7-8: 开始讨论（可选，这里跳过）
   * 步骤 9: 生成详细方案
   */
  const handleGenerateDetailedSolution = async () => {
    const selectedSolution = snap.currentSession?.briefSolutions?.find(
      s => s.id === snap.currentSession?.selectedBriefSolutionId,
    )

    if (!selectedSolution) {
      alert('请先选择一个方案')
      return
    }

    startGenerating('正在生成详细方案...')
    updateStage(WorkflowStage.DETAILED_SOLUTION_GENERATION)

    await simulateDelay(1500)
    updateProgress(0.3, '展开技术架构...', '↻ 设计中', 'info')

    await simulateDelay(1500)
    updateProgress(0.6, '制定实施步骤...', '↻ 规划中', 'info')

    await simulateDelay(1500)
    updateProgress(0.9, '评估成本和风险...', '↻ 分析中', 'info')

    await simulateDelay(1500)

    /** 生成详细方案 */
    const detailedSolution = mockGenerateDetailedSolution(selectedSolution as BriefSolution)
    setDetailedSolution(detailedSolution)

    updateProgress(1, '详细方案生成完成', '✓ 工作流完成', 'success')
    finishGenerating()
  }

  return (
    <div
      className={ cn(
        'AiWorkflowPage relative flex h-screen w-full overflow-hidden bg-slate-100/60 text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100',
        className,
      ) }
      style={ style }
    >
      {/* 左侧边栏 */}
      <CollapsibleSidebar
        expandedWidth={ 320 }
        collapsedWidth={ 120 }
        isCollapsed={ isSidebarCollapsed }
        onToggle={ () => setIsSidebarCollapsed(prev => !prev) }
        animationType="tween"
        animationDuration={ 0.18 }
        className={ cn(
          'h-full flex-col gap-4 border-r border-slate-200 bg-white/80 backdrop-blur transition-[padding] duration-200 ease-out xl:flex dark:border-slate-800 dark:bg-slate-900/80',
          isSidebarCollapsed
            ? 'px-3 py-6'
            : 'p-6',
        ) }
        contentClassName="flex h-full flex-col gap-6"
      >
        {!isSidebarCollapsed && <SidebarHeader />}
        <HistoryList isCollapsed={ isSidebarCollapsed } />
      </CollapsibleSidebar>

      <main className="relative flex h-full flex-1 flex-col overflow-y-auto px-4 py-8 md:px-8 lg:px-14">
        <motion.div
          initial={ { opacity: 0, y: 40 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.6, ease: 'easeOut' } }
          className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 pb-10"
        >
          {/* 页面头部 */}
          <PageHeader />

          {/* 需求输入 */}
          {!snap.currentSession && (
            <RequirementInput onSubmit={ handleStartWorkflow } />
          )}

          {/* 进度指示器 */}
          {snap.isGenerating && <ProgressIndicator />}

          {/* 简略方案列表 */}
          {snap.stage === WorkflowStage.SOLUTION_SELECTION && (
            <>
              <BriefSolutionList onSelect={ handleSelectSolution } />

              {snap.currentSession?.selectedBriefSolutionId && (
                <div className="flex justify-center">
                  <button
                    onClick={ handleGenerateDetailedSolution }
                    className="rounded-full bg-slate-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                  >
                    生成详细方案
                  </button>
                </div>
              )}
            </>
          )}

          {/* 详细方案展示 */}
          {snap.stage === WorkflowStage.COMPLETE && (
            <>
              <DetailedSolutionView />

              <div className="flex justify-center gap-4">
                <button
                  onClick={ () => {
                    createNewWorkflow('')
                  } }
                  className="rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  开始新协作
                </button>
              </div>
            </>
          )}
        </motion.div>
      </main>

      {/* 问题对话框 */}
      <QuestionDialog
        onSubmit={ handleSubmitAnswers }
        onClose={ closeQuestionDialog }
      />
    </div>
  )
}

/**
 * 侧边栏头部
 */
const SidebarHeader = memo(() => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-slate-400">
          History
        </p>
      </div>

      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        工作流历史
      </h2>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        点击历史卡片查看详情
      </p>

      <button
        onClick={ () => createNewWorkflow('') }
        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 active:scale-95 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
      >
        + 新建工作流
      </button>
    </div>
  )
})

SidebarHeader.displayName = 'SidebarHeader'

/**
 * 页面头部
 */
const PageHeader = memo(() => {
  return (
    <header className="flex flex-col gap-3">
      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs uppercase tracking-widest text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        AI Workflow Suite
      </div>
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl">
        智能工作流协作
      </h1>
      <p className="max-w-3xl text-base text-slate-600 dark:text-slate-300">
        通过多轮对话收集需求信息，生成多个方案供您选择，并可选择性地进行深入讨论，最终输出详细的实施方案。
      </p>
    </header>
  )
})

PageHeader.displayName = 'PageHeader'

/**
 * 模拟延迟
 */
function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

AiWorkflowPage.displayName = 'AiWorkflowPage'
