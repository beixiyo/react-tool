'use client'

import type { ReactNode } from 'react'
import type { LineConfig } from '../types/chart'
import type { AreaChartProps } from './types'
import { memo, useCallback } from 'react'
import { CartesianChartBase } from '../cartesian-chart-base'
import { categorizeChildren } from '../utils'
import { Area } from './area'

/**
 * 从子组件同步提取区域/线条配置
 */
function extractAreaConfigs(children: ReactNode): LineConfig[] {
  const { areaComps } = categorizeChildren(children, {
    areaComps: (child) => {
      const props = child.props as any
      return child.type === Area || (props && typeof props.dataKey === 'string' && props.dataKey.length > 0)
    },
  })

  return areaComps.map((child) => {
    const props = child.props as any
    return {
      dataKey: props.dataKey,
      stroke: props.stroke || props.fill || 'rgb(var(--systemBlue) / 1)',
      strokeWidth: props.strokeWidth || 2,
    }
  })
}

function AreaChartInner(props: AreaChartProps) {
  const { style, className, virtual, ...rest } = props
  const extractConfigs = useCallback((children: ReactNode) => extractAreaConfigs(children), [])

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

export const AreaChart = memo(AreaChartInner)

AreaChart.displayName = 'AreaChart'

export { Area } from './area'
