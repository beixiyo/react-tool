import type { AutoScrollState } from './components'
import { faker } from '@faker-js/faker'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  AutoScrollContainer,

  Bar,
  BarChart,
  BarXAxis,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  XAxis,
} from './components'
import { chartCssVars } from './components/chart-context'

const areaData = generateAreaData()
const lineData = generateLineData()
const scrollData = generateLineData(1000)
const barData = generateBarData()

export default function ChartsDemo() {
  const [scrollState, setScrollState] = useState<AutoScrollState>({
    scrollLeft: 0,
    containerWidth: 0,
    contentWidth: 0,
    isScrolling: false,
  })
  const minPointWidth = 20

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center gap-12 px-6 py-10">
      <section className="w-full max-w-5xl rounded-2xl bg-background2 border border-border shadow-card p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-text">
            虚拟滚动测试（1000 个点，仅渲染可视区域）
          </h2>
          <div className="text-sm text-text2">
            状态:
            {' '}
            { scrollState.isScrolling
              ? '已启用滚动'
              : '全屏显示' }
            {' '}
            | 点位:
            {' '}
            { scrollData.length }
          </div>
        </div>
        <AutoScrollContainer
          minContentWidth={ scrollData.length * minPointWidth }
          onScroll={ setScrollState }
        >
          <LineChart
            data={ scrollData }
            className="h-full"
            virtual={ {
              ...scrollState,
              enabled: scrollState.isScrolling,
            } }
          >
            <Grid horizontal />
            <Line dataKey="kpi" />
            <XAxis numTicks={ 20 } tickerHalfWidth={ 40 } />
            <ChartTooltip />
          </LineChart>
        </AutoScrollContainer>
      </section>

      <section className="w-full max-w-5xl rounded-2xl bg-background2 border border-border shadow-card p-6">
        <h2 className="text-lg font-medium text-text mb-4">
          收入 / 成本（AreaChart）
        </h2>
        <AreaChart
          data={ areaData }
          className="w-full"
        >
          <Grid horizontal />
          <Area dataKey="revenue" showHighlight={ false } />
          <Area dataKey="costs" showHighlight={ false } fill={ chartCssVars.lineSecondary } />
          <XAxis />
          <ChartTooltip />
        </AreaChart>
      </section>

      <section className="w-full max-w-5xl rounded-2xl bg-background2 border border-border shadow-card p-6">
        <h2 className="text-lg font-medium text-text mb-4">
          指标趋势（LineChart）
        </h2>
        <LineChart
          data={ lineData }
          className="w-full"
        >
          <Grid horizontal />
          <Line dataKey="kpi" />
          <Line dataKey="target" stroke={ chartCssVars.lineSecondary } />
          <XAxis />
          <ChartTooltip />
        </LineChart>
      </section>

      <section className="w-full max-w-5xl rounded-2xl bg-background2 border border-border shadow-card p-6">
        <h2 className="text-lg font-medium text-text mb-4">
          月度销售 / 利润（BarChart）
        </h2>
        <BarChart
          data={ barData }
          xDataKey="name"
          className="w-full"
        >
          <Grid horizontal />
          <Bar dataKey="sales" />
          <Bar dataKey="profit" fill={ chartCssVars.lineSecondary } />
          <BarXAxis />
          <ChartTooltip />
        </BarChart>
      </section>
    </div>
  )
}

function generateAreaData(count = 30) {
  const today = new Date()
  return Array.from({ length: count }).map((_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (count - 1 - i))

    const revenue = faker.number.int({ min: 100, max: 300 })
    const costs = Math.round(revenue * faker.number.float({ min: 0.4, max: 0.8 }))

    return {
      date,
      revenue,
      costs,
    }
  })
}

function generateLineData(count = 30) {
  const today = new Date()
  let current = faker.number.int({ min: 60, max: 80 })

  return Array.from({ length: count }).map((_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (count - 1 - i))

    current = Math.max(
      0,
      current + faker.number.int({ min: -8, max: 8 }),
    )

    const target = 75

    return {
      date,
      kpi: current,
      target,
    }
  })
}

function generateBarData(count = 12) {
  return Array.from({ length: count }).map((_, i) => {
    const month = faker.date.month({ abbreviated: true })
    const name = `${month} ${i + 1}`

    const sales = faker.number.int({ min: 200, max: 1200 })
    const profit = Math.round(sales * faker.number.float({ min: 0.15, max: 0.45 }))

    return {
      name,
      sales,
      profit,
    }
  })
}
