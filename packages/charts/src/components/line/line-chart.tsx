'use client'

import type { ReactNode } from 'react'
import type { LineConfig } from '../types/chart'
import type { LineChartProps } from './types'
import { memo, useCallback } from 'react'
import { CartesianChartBase } from '../cartesian-chart-base'
import { categorizeChildren } from '../utils'
import { Line } from './line'

/**
 * 从子组件同步提取线条配置
 */
function extractLineConfigs(children: ReactNode): LineConfig[] {
  const { lineComps } = categorizeChildren(children, {
    lineComps: (child) => {
      const props = child.props as any
      return child.type === Line || (props && typeof props.dataKey === 'string' && props.dataKey.length > 0)
    },
  })

  return lineComps.map((child) => {
    const props = child.props as any
    return {
      dataKey: props.dataKey,
      stroke: props.stroke || 'rgb(var(--systemBlue) / 1)',
      strokeWidth: props.strokeWidth || 2.5,
    }
  })
}

function LineChartInner(props: LineChartProps) {
  const { style, className, virtual, ...rest } = props
  const extractConfigs = useCallback((children: ReactNode) => extractLineConfigs(children), [])

  return (
    <CartesianChartBase
      { ...rest }
      className={ className }
      style={ style }
      extractConfigs={ extractConfigs }
      virtual={ virtual }
    />
  )
}

export const LineChart = memo(LineChartInner)

LineChart.displayName = 'LineChart'
