/**
 * 简略方案列表组件
 */

import { CheckCircle2, Circle } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { useSnapshot } from 'valtio'
import { workflowStore } from '../hooks/useWorkflow'

export type BriefSolutionListProps = {
  className?: string
  style?: React.CSSProperties
  onSelect?: (solutionId: string) => void
}

export const BriefSolutionList = memo<BriefSolutionListProps>((props) => {
  const {
    className,
    style,
    onSelect,
  } = props

  const snap = useSnapshot(workflowStore)
  const solutions = snap.currentSession?.briefSolutions ?? []

  if (!solutions || solutions.length === 0)
    return null

  return (
    <div
      className={ cn(
        'BriefSolutionList flex w-full flex-col gap-6',
        className,
      ) }
      style={ style }
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          方案选择
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          AI 已生成
          {' '}
          {solutions.length}
          {' '}
          个方案，请选择一个进行详细设计
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {solutions.map(solution => (
          <SolutionCard
            key={ solution.id }
            solutionId={ solution.id }
            onSelect={ () => onSelect?.(solution.id) }
          />
        ))}
      </div>
    </div>
  )
})

BriefSolutionList.displayName = 'BriefSolutionList'

/**
 * 单个方案卡片
 */
type SolutionCardProps = {
  solutionId: string
  onSelect: () => void
}

const SolutionCard = memo<SolutionCardProps>((props) => {
  const { solutionId, onSelect } = props

  /** 直接从全局状态获取数据，而不是通过 props 传递 */
  const snap = useSnapshot(workflowStore)
  const solutions = snap.currentSession?.briefSolutions ?? []
  const selectedId = snap.currentSession?.selectedBriefSolutionId

  const solution = solutions.find(s => s.id === solutionId)
  const isSelected = solutionId === selectedId

  if (!solution)
    return null

  const complexityColors = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }

  const complexityLabels = {
    low: '低复杂度',
    medium: '中复杂度',
    high: '高复杂度',
  }

  return (
    <div
      className={ cn(
        'group relative cursor-pointer rounded-2xl border p-6 transition-all',
        isSelected
          ? 'border-slate-900 bg-slate-50 shadow-md dark:border-slate-100 dark:bg-slate-800'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
      ) }
      onClick={ onSelect }
    >
      {/* 选中标记 */}
      <div className="absolute right-4 top-4">
        {isSelected
          ? (
              <CheckCircle2 className="h-6 w-6 text-slate-900 dark:text-slate-100" />
            )
          : (
              <Circle className="h-6 w-6 text-slate-300 dark:text-slate-700" />
            )}
      </div>

      <div className="flex flex-col gap-4">
        {/* 标题和复杂度 */}
        <div className="flex flex-col gap-2 pr-8">
          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {solution.name}
          </h4>
          {solution.complexity && (
            <span
              className={ cn(
                'inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium',
                complexityColors[solution.complexity],
              ) }
            >
              {complexityLabels[solution.complexity]}
            </span>
          )}
        </div>

        {/* 核心思路 */}
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {solution.coreConcept}
        </p>

        {/* 技术栈 */}
        <div className="flex flex-wrap gap-2">
          {solution.techStack.slice(0, 4).map(tech => (
            <span
              key={ tech }
              className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {tech}
            </span>
          ))}
          {solution.techStack.length > 4 && (
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              +
              {solution.techStack.length - 4}
            </span>
          )}
        </div>

        {/* 优势 */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            优势：
          </p>
          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            {solution.advantages.slice(0, 2).map((adv, idx) => (
              <li key={ idx } className="flex items-start gap-1">
                <span className="text-green-500">✓</span>
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 适用场景 */}
        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-400">
          <span className="font-medium">适用场景：</span>
          {solution.suitableFor}
        </div>
      </div>
    </div>
  )
})

SolutionCard.displayName = 'SolutionCard'
