'use client'

import type {
  ChartInteractionState,
  ChartStaticState,
  ChartVirtualContextState,
} from './types/context'
import { createContext, use } from 'react'

const ChartStaticContext = createContext<ChartStaticState | null>(null)
const ChartInteractionContext = createContext<ChartInteractionState | null>(null)
const ChartVirtualContext = createContext<ChartVirtualContextState | null>(null)

/** CSS 变量引用，用于主题化 */
export const chartCssVars = {
  background: 'rgb(var(--background))',
  foreground: 'rgb(var(--text))',
  foregroundMuted: 'rgb(var(--text2))',
  label: 'rgb(var(--text2))',
  linePrimary: 'rgb(var(--systemBlue))',
  lineSecondary: 'rgb(var(--systemGreen))',
  crosshair: 'rgba(var(--text3), 0.7)',
  grid: 'rgb(var(--border2))',
  indicatorColor: 'rgb(var(--systemBlue))',
  indicatorSecondaryColor: 'rgb(var(--systemOrange))',
  markerBackground: 'rgb(var(--background2))',
  markerBorder: 'rgb(var(--border2))',
  markerForeground: 'rgb(var(--text))',
  badgeBackground: 'rgba(var(--systemBlue), 0.1)',
  badgeForeground: 'rgb(var(--systemBlue))',
  segmentBackground: 'rgba(var(--systemBlue), 0.06)',
  segmentLine: 'rgba(var(--systemBlue), 0.6)',
}

export function ChartProvider({
  children,
  staticValue,
  interactionValue,
  virtualValue,
}: {
  children: React.ReactNode
  staticValue: ChartStaticState
  interactionValue: ChartInteractionState
  virtualValue: ChartVirtualContextState
}) {
  return (
    <ChartStaticContext value={ staticValue }>
      <ChartInteractionContext value={ interactionValue }>
        <ChartVirtualContext value={ virtualValue }>
          { children }
        </ChartVirtualContext>
      </ChartInteractionContext>
    </ChartStaticContext>
  )
}

export function useChartStatic(): ChartStaticState {
  const context = use(ChartStaticContext)
  if (!context)
    throw new Error('useChartStatic must be used within ChartProvider')
  return context
}

export function useChartInteraction(): ChartInteractionState {
  const context = use(ChartInteractionContext)
  if (!context)
    throw new Error('useChartInteraction must be used within ChartProvider')
  return context
}

export function useChartVirtual(): ChartVirtualContextState {
  const context = use(ChartVirtualContext)
  /**
   * 如果没有虚拟滚动上下文，返回一个默认的非虚拟状态，而不是抛出错误。
   * 这允许 useChart() 在非虚拟化的图表（如旧版 BarChart）中安全运行。
   */
  if (!context) {
    return {
      startIndex: 0,
      endIndex: 0,
      isVirtual: false,
    }
  }
  return context
}
