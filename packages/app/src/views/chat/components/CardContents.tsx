import { AlertCircle, BarChart3, CheckCircle, DollarSign, TrendingUp, Users } from 'lucide-react'
import { memo } from 'react'

/**
 * 市场分析摘要卡片内容
 */
export const MarketSummaryContent = memo(() => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-blue-50 p-3 text-center dark:bg-blue-950/20">
          <div className="text-2xl text-blue-600 font-bold dark:text-blue-400">$750B</div>
          <div className="text-xs text-blue-500 dark:text-blue-300">预计2030年市场规模</div>
        </div>
        <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-950/20">
          <div className="text-2xl text-green-600 font-bold dark:text-green-400">26%</div>
          <div className="text-xs text-green-500 dark:text-green-300">年复合增长率</div>
        </div>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-300">
        北美地区占据45%的市场份额，亚太地区增长最快。
      </div>
    </div>
  )
})

MarketSummaryContent.displayName = 'MarketSummaryContent'

/**
 * 竞争对手分析卡片内容
 */
export const CompetitorAnalysisContent = memo(() => {
  const competitors = [
    { name: 'Google Health', share: '15%' },
    { name: 'IBM Watson Health', share: '12%' },
    { name: 'Microsoft Healthcare', share: '10%' },
  ]

  return (
    <div className="space-y-2">
      {competitors.map((competitor, index) => (
        <div
          key={ index }
          className="flex items-center justify-between rounded-sm bg-slate-50 p-2 dark:bg-slate-700/50"
        >
          <span className="font-medium">{competitor.name}</span>
          <span className="text-sm text-slate-500">
            {competitor.share}
            {' '}
            市场份额
          </span>
        </div>
      ))}
    </div>
  )
})

CompetitorAnalysisContent.displayName = 'CompetitorAnalysisContent'

/**
 * 投资建议卡片内容
 */
export const InvestmentAdviceContent = memo(() => {
  const recommendations = [
    '医学影像诊断',
    '药物研发AI',
    '临床决策支持系统',
  ]

  return (
    <div className="space-y-3">
      <div>
        <h4 className="mb-2 text-green-800 font-medium dark:text-green-200">推荐投资领域</h4>
        <ul className="text-sm space-y-1">
          {recommendations.map((item, index) => (
            <li key={ index } className="flex items-center space-x-2">
              <CheckCircle size={ 14 } className="text-green-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
})

InvestmentAdviceContent.displayName = 'InvestmentAdviceContent'

/**
 * 风险提示卡片内容
 */
export const RiskWarningContent = memo(() => {
  const risks = [
    '监管政策变化可能影响产品上市时间',
    '数据隐私和安全合规要求日趋严格',
    '技术标准化程度有待提高',
  ]

  return (
    <div className="space-y-2">
      {risks.map((risk, index) => (
        <div key={ index } className="flex items-start space-x-2">
          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500"></div>
          <span className="text-sm">{risk}</span>
        </div>
      ))}
    </div>
  )
})

RiskWarningContent.displayName = 'RiskWarningContent'

/**
 * 数据可视化卡片内容
 */
export const DataVisualizationContent = memo(() => {
  return (
    <div className="rounded-lg from-blue-50 to-purple-50 bg-linear-to-r p-4 dark:from-blue-950/20 dark:to-purple-950/20">
      <div className="text-center">
        <div className="from-blue-600 to-purple-600 bg-linear-to-r bg-clip-text text-3xl text-transparent font-bold">
          📊
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          交互式图表和数据分析工具
        </p>
      </div>
    </div>
  )
})

DataVisualizationContent.displayName = 'DataVisualizationContent'

/**
 * 卡片图标组件
 */
export const CardIcons = {
  TrendingUp: <TrendingUp size={ 20 } />,
  Users: <Users size={ 20 } />,
  DollarSign: <DollarSign size={ 20 } />,
  AlertCircle: <AlertCircle size={ 20 } />,
  BarChart3: <BarChart3 size={ 20 } />,
}
