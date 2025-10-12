/**
 * 详细方案展示组件
 */

import { memo } from 'react'
import { cn } from 'utils'
import { useSnapshot } from 'valtio'
import { workflowStore } from '../hooks/useWorkflow'

export type DetailedSolutionViewProps = {
  className?: string
  style?: React.CSSProperties
}

export const DetailedSolutionView = memo<DetailedSolutionViewProps>((props) => {
  const {
    className,
    style,
  } = props

  const snap = useSnapshot(workflowStore, { sync: true })
  const solution = snap.currentSession?.detailedSolution

  if (!solution)
    return null

  return (
    <div
      className={ cn(
        'DetailedSolutionView flex w-full flex-col gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8',
        className,
      ) }
      style={ style }
    >
      {/* 标题 */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {solution.name}
        </h2>
        <p className="text-base text-slate-600 dark:text-slate-400">
          {solution.overview}
        </p>
      </div>

      {/* 技术架构 */}
      <Section title="技术架构">
        <div className="prose prose-slate max-w-none dark:prose-invert">
          <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-950">
            {solution.architecture}
          </pre>
        </div>
      </Section>

      {/* 技术选型 */}
      <Section title="技术选型">
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(solution.techStack).map(([key, value]) => (
            <div
              key={ key }
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950"
            >
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {key}
              </span>
              <span className="text-sm text-slate-900 dark:text-slate-100">
                {value}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* 实施步骤 */}
      <Section title="实施步骤">
        <ol className="space-y-3">
          {solution.implementationSteps.map((step, idx) => (
            <li
              key={ idx }
              className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
            >
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">
                {idx + 1}
              </span>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </Section>

      {/* 优劣势分析 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Section title="优势分析">
          <ul className="space-y-2">
            {solution.advantages.map((adv, idx) => (
              <li
                key={ idx }
                className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <span className="text-green-500">✓</span>
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="劣势分析">
          <ul className="space-y-2">
            {solution.disadvantages.map((dis, idx) => (
              <li
                key={ idx }
                className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <span className="text-orange-500">⚠</span>
                <span>{dis}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* 风险列表 */}
      <Section title="风险评估">
        <ul className="space-y-2">
          {solution.risks.map((risk, idx) => (
            <li
              key={ idx }
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300"
            >
              <span>⚠️</span>
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* 成本估算 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Section title="开发成本">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {solution.developmentCost}
          </p>
        </Section>

        <Section title="维护成本">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {solution.maintenanceCost}
          </p>
        </Section>
      </div>
    </div>
  )
})

DetailedSolutionView.displayName = 'DetailedSolutionView'

/**
 * 章节组件
 */
type SectionProps = {
  title: string
  children: React.ReactNode
}

const Section = memo<SectionProps>((props) => {
  const { title, children } = props

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      {children}
    </div>
  )
})

Section.displayName = 'Section'
