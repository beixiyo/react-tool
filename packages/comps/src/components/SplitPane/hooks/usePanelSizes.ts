import type { PanelConfig, PanelState, PersistedState, SplitPaneLayoutResolver, SplitPaneToggleResolver } from '../types'
import { clamp } from '@jl-org/tool'
import { useLatestCallback } from 'hooks'
import { useCallback, useEffect, useRef, useState } from 'react'
import { calculateInitialWidths, shouldAutoCollapse } from '../utils'

/**
 * 面板尺寸管理 Hook
 */
export function usePanelSizes(options: UsePanelSizesOptions): UsePanelSizesReturn {
  const { configs, containerWidth, dividerSize, dividerSizes, gap = 0, persistedState, onLayoutChange, onResizeEnd, resolveLayout, resolveToggle } = options

  /** 用最新引用包裹，避免把回调放进依赖导致闭包陈旧 */
  const handleResizeEnd = useLatestCallback((sizes: number[], collapsedStates: boolean[]) => {
    onResizeEnd?.(sizes, collapsedStates)
  })
  const resolvePanelLayout = useLatestCallback((baseStates: PanelState[], reason: 'init' | 'resize') => {
    return resolveLayout?.({
      configs,
      states: baseStates,
      containerWidth,
      dividerSize,
      dividerSizes,
      gap,
      reason,
    }) ?? baseStates
  })

  const [states, setStates] = useState<PanelState[]>([])
  const [activeDivider, setActiveDivider] = useState<number | null>(null)
  const dragStartStatesRef = useRef<PanelState[]>([])
  const isInitializedRef = useRef(false)
  const previousContainerWidthRef = useRef(0)

  /** 初始化状态 */
  useEffect(() => {
    if (containerWidth <= 0 || configs.length === 0)
      return
    if (isInitializedRef.current && states.length === configs.length)
      return

    let initialStates: PanelState[]

    if (persistedState && persistedState.sizes.length === configs.length) {
      /** 从持久化状态恢复 */
      initialStates = configs.map((_config, i) => ({
        width: persistedState.sizes[i],
        collapsed: persistedState.collapsedStates[i],
        widthBeforeCollapse: persistedState.widthsBeforeCollapse[i],
        responsiveCollapsed: false,
      }))
    }
    else {
      /** 计算初始宽度 */
      const initialWidths = calculateInitialWidths(configs, containerWidth, dividerSize, gap, dividerSizes)
      initialStates = configs.map((_config, i) => ({
        width: initialWidths[i],
        collapsed: false,
        widthBeforeCollapse: initialWidths[i],
        responsiveCollapsed: false,
      }))
    }

    const resolvedInitialStates = resolvePanelLayout(initialStates, 'init')
    setStates(resolvedInitialStates)
    isInitializedRef.current = true
    previousContainerWidthRef.current = containerWidth
  }, [configs, containerWidth, dividerSize, dividerSizes, gap, persistedState, resolvePanelLayout, states.length])

  /** 容器宽度变化后按调用方规则重算布局；用户手动展开 / 收起不会触发此处 */
  useEffect(() => {
    if (!isInitializedRef.current || containerWidth <= 0)
      return

    if (previousContainerWidthRef.current === containerWidth)
      return

    previousContainerWidthRef.current = containerWidth

    setStates((prev) => {
      if (prev.length !== configs.length)
        return prev

      return resolvePanelLayout(prev, 'resize')
    })
  }, [configs.length, containerWidth, resolvePanelLayout])

  /** 布局变化回调 */
  useEffect(() => {
    if (states.length > 0 && onLayoutChange) {
      onLayoutChange(
        states.map(s => s.width),
        states.map(s => s.collapsed),
      )
    }
  }, [states, onLayoutChange])

  const startDrag = useCallback((dividerIndex: number) => {
    setActiveDivider(dividerIndex)
    dragStartStatesRef.current = [...states]
  }, [states])

  const onDrag = useCallback(
    (delta: number) => {
      if (activeDivider === null)
        return

      const leftIndex = activeDivider
      const rightIndex = activeDivider + 1
      const leftConfig = configs[leftIndex]
      const rightConfig = configs[rightIndex]
      const startStates = dragStartStatesRef.current

      if (!startStates[leftIndex] || !startStates[rightIndex])
        return

      const leftStartWidth = startStates[leftIndex].width
      const rightStartWidth = startStates[rightIndex].width
      const leftCollapsed = startStates[leftIndex].collapsed
      const rightCollapsed = startStates[rightIndex].collapsed

      /** 处理 collapsed 状态下向外拖拽的情况 */
      if (leftCollapsed && delta > 0) {
        /** 左侧面板收起，向右拖拽：展开左侧面板到最小宽度 */
        const leftMin = leftConfig.minWidth ?? 100
        const leftCollapsedWidth = leftConfig.collapsedWidth ?? 0
        const expandDelta = leftMin - leftCollapsedWidth

        /** 只要向外拖拽就展开到最小宽度 */
        setStates((prev) => {
          const newStates = [...prev]
          /** 使用初始状态的右侧宽度，而不是当前状态（可能已经被修改） */
          const newRightWidth = rightStartWidth - expandDelta

          newStates[leftIndex] = {
            ...newStates[leftIndex],
            width: leftMin,
            collapsed: false,
            widthBeforeCollapse: leftMin,
          }
          newStates[rightIndex] = {
            ...newStates[rightIndex],
            width: newRightWidth,
            widthBeforeCollapse: newRightWidth,
          }

          /** 更新拖拽起始状态，以便后续拖拽能正常工作 */
          dragStartStatesRef.current = [...newStates]

          return newStates
        })
        return
      }

      if (rightCollapsed && delta < 0) {
        /** 右侧面板收起，向左拖拽：展开右侧面板到最小宽度 */
        const rightMin = rightConfig.minWidth ?? 100
        const rightCollapsedWidth = rightConfig.collapsedWidth ?? 0
        const expandDelta = rightMin - rightCollapsedWidth

        /** 只要向外拖拽就展开到最小宽度 */
        setStates((prev) => {
          const newStates = [...prev]
          /** 使用初始状态的左侧宽度，而不是当前状态（可能已经被修改） */
          const newLeftWidth = leftStartWidth - expandDelta

          newStates[leftIndex] = {
            ...newStates[leftIndex],
            width: newLeftWidth,
            widthBeforeCollapse: newLeftWidth,
          }
          newStates[rightIndex] = {
            ...newStates[rightIndex],
            width: rightMin,
            collapsed: false,
            widthBeforeCollapse: rightMin,
          }

          /** 更新拖拽起始状态，以便后续拖拽能正常工作 */
          dragStartStatesRef.current = [...newStates]

          return newStates
        })
        return
      }

      /** 如果任一面板已收起，但不满足展开条件，不允许拖拽 */
      if (leftCollapsed || rightCollapsed)
        return

      /** 计算新宽度 */
      const desiredLeftWidth = leftStartWidth + delta

      /** 应用约束 */
      const leftMin = leftConfig.minWidth ?? 100
      const leftMax = leftConfig.maxWidth ?? Infinity
      const rightMin = rightConfig.minWidth ?? 100
      const rightMax = rightConfig.maxWidth ?? Infinity
      const totalWidth = leftStartWidth + rightStartWidth
      const {
        leftWidth: newLeftWidth,
        rightWidth: newRightWidth,
      } = resolveConstrainedPairWidths({
        desiredLeftWidth,
        totalWidth,
        leftMin,
        leftMax,
        rightMin,
        rightMax,
      })

      setStates((prev) => {
        const newStates = [...prev]
        newStates[leftIndex] = {
          ...newStates[leftIndex],
          width: newLeftWidth,
          widthBeforeCollapse: newLeftWidth,
        }
        newStates[rightIndex] = {
          ...newStates[rightIndex],
          width: newRightWidth,
          widthBeforeCollapse: newRightWidth,
        }
        return newStates
      })
    },
    [activeDivider, configs],
  )

  const endDrag = useCallback(() => {
    if (activeDivider === null)
      return

    /** 检查自动收起 */
    const leftIndex = activeDivider
    const rightIndex = activeDivider + 1
    const leftConfig = configs[leftIndex]
    const rightConfig = configs[rightIndex]

    let finalStates: PanelState[] = []

    setStates((prev) => {
      const newStates = [...prev]

      /** 检查左侧面板是否需要自动收起 */
      if (
        leftConfig.autoCollapseThreshold
        && shouldAutoCollapse(newStates[leftIndex].width, leftConfig.autoCollapseThreshold)
      ) {
        newStates[leftIndex] = {
          ...newStates[leftIndex],
          width: leftConfig.collapsedWidth ?? 0,
          collapsed: true,
        }
      }

      /** 检查右侧面板是否需要自动收起 */
      if (
        rightConfig.autoCollapseThreshold
        && shouldAutoCollapse(newStates[rightIndex].width, rightConfig.autoCollapseThreshold)
      ) {
        newStates[rightIndex] = {
          ...newStates[rightIndex],
          width: rightConfig.collapsedWidth ?? 0,
          collapsed: true,
        }
      }

      finalStates = newStates
      return newStates
    })

    setActiveDivider(null)

    /** 拖拽结束后回传一次最终布局（低频，适合持久化 / 重计算） */
    if (finalStates.length > 0) {
      handleResizeEnd(
        finalStates.map(s => s.width),
        finalStates.map(s => s.collapsed),
      )
    }
  }, [activeDivider, configs])

  const resizeToContainerWidth = useLatestCallback((nextContainerWidth: number) => {
    if (!isInitializedRef.current || nextContainerWidth <= 0)
      return

    if (previousContainerWidthRef.current === nextContainerWidth)
      return

    previousContainerWidthRef.current = nextContainerWidth

    setStates((prev) => {
      if (prev.length !== configs.length)
        return prev

      return resolveLayout?.({
        configs,
        states: prev,
        containerWidth: nextContainerWidth,
        dividerSize,
        dividerSizes,
        gap,
        reason: 'resize',
      }) ?? prev
    })
  })

  const toggleCollapse = useCallback(
    (panelIndex: number) => {
      const config = configs[panelIndex]
      if (!config.collapsible)
        return

      setStates((prev) => {
        const resolvedStates = resolveToggle?.({
          configs,
          states: prev,
          containerWidth,
          dividerSize,
          dividerSizes,
          gap,
          reason: 'toggle',
          panelIndex,
          panelId: config.id,
        })
        if (resolvedStates)
          return resolvedStates

        const newStates = [...prev]
        const current = newStates[panelIndex]

        /** 找到相邻的可调整面板（非收起状态的面板） */
        const findAdjacentFlexPanel = (excludeIndex: number): number => {
          /** 优先找没有设置 defaultWidth 的面板（flex 面板） */
          for (let i = 0; i < configs.length; i++) {
            if (i !== excludeIndex && !newStates[i].collapsed && configs[i].defaultWidth === 'auto') {
              return i
            }
          }
          /** 否则找相邻的非收起面板 */
          const adjacentIndex = panelIndex === 0
            ? 1
            : panelIndex - 1
          if (adjacentIndex >= 0 && adjacentIndex < configs.length && !newStates[adjacentIndex].collapsed) {
            return adjacentIndex
          }
          return -1
        }

        const adjacentIndex = findAdjacentFlexPanel(panelIndex)

        if (current.collapsed) {
          /** 展开 */
          const expandWidth = current.widthBeforeCollapse - (config.collapsedWidth ?? 0)
          newStates[panelIndex] = {
            ...current,
            width: current.widthBeforeCollapse,
            collapsed: false,
            responsiveCollapsed: false,
          }
          /** 从相邻面板减去宽度 */
          if (adjacentIndex !== -1) {
            newStates[adjacentIndex] = {
              ...newStates[adjacentIndex],
              width: newStates[adjacentIndex].width - expandWidth,
            }
          }
        }
        else {
          /** 收起 */
          const collapsedWidth = config.collapsedWidth ?? 0
          const freedWidth = current.width - collapsedWidth
          newStates[panelIndex] = {
            ...current,
            widthBeforeCollapse: current.width,
            width: collapsedWidth,
            collapsed: true,
            responsiveCollapsed: false,
          }
          /** 将释放的宽度分配给相邻面板 */
          if (adjacentIndex !== -1) {
            newStates[adjacentIndex] = {
              ...newStates[adjacentIndex],
              width: newStates[adjacentIndex].width + freedWidth,
            }
          }
        }

        return newStates
      })
    },
    [configs, containerWidth, dividerSize, dividerSizes, gap, resolveToggle],
  )

  return {
    states,
    startDrag,
    onDrag,
    endDrag,
    toggleCollapse,
    resizeToContainerWidth,
    activeDivider,
  }
}

function resolveConstrainedPairWidths(options: ConstrainedPairWidthOptions) {
  const {
    desiredLeftWidth,
    totalWidth,
    leftMin,
    leftMax,
    rightMin,
    rightMax,
  } = options
  const minLeftByRightMax = totalWidth - rightMax
  const maxLeftByRightMin = totalWidth - rightMin
  const effectiveLeftMin = Math.max(leftMin, minLeftByRightMax)
  const effectiveLeftMax = Math.min(leftMax, maxLeftByRightMin)

  if (effectiveLeftMin <= effectiveLeftMax) {
    const leftWidth = clamp(desiredLeftWidth, effectiveLeftMin, effectiveLeftMax)

    return {
      leftWidth,
      rightWidth: totalWidth - leftWidth,
    }
  }

  const fallbackLeftMin = Math.max(0, Math.min(leftMin, totalWidth))
  const fallbackLeftMax = Math.max(fallbackLeftMin, Math.min(leftMax, totalWidth))
  const leftWidth = clamp(desiredLeftWidth, fallbackLeftMin, fallbackLeftMax)

  return {
    leftWidth,
    rightWidth: totalWidth - leftWidth,
  }
}

export type UsePanelSizesOptions = {
  /**
   * 面板配置列表
   */
  configs: PanelConfig[]
  /**
   * 容器宽度
   */
  containerWidth: number
  /**
   * 分隔条尺寸
   */
  dividerSize: number
  /**
   * 分隔条尺寸列表，按分隔条索引覆盖 dividerSize
   */
  dividerSizes?: readonly number[]
  /**
   * 面板间距
   */
  gap?: number
  /**
   * 持久化的初始状态
   */
  persistedState?: PersistedState | null
  /**
   * 布局变化回调（拖拽过程中高频触发）
   */
  onLayoutChange?: (sizes: number[], collapsedStates: boolean[]) => void
  /**
   * 拖拽结束（含自动收起结算后）触发一次
   */
  onResizeEnd?: (sizes: number[], collapsedStates: boolean[]) => void
  /**
   * 自定义响应式布局重算
   */
  resolveLayout?: SplitPaneLayoutResolver
  /**
   * 自定义显式切换结算
   */
  resolveToggle?: SplitPaneToggleResolver
}

export type UsePanelSizesReturn = {
  /**
   * 面板状态列表
   */
  states: PanelState[]
  /**
   * 开始拖拽
   */
  startDrag: (dividerIndex: number) => void
  /**
   * 拖拽中
   */
  onDrag: (delta: number) => void
  /**
   * 结束拖拽
   */
  endDrag: () => void
  /**
   * 收起/展开面板
   */
  toggleCollapse: (panelIndex: number) => void
  /**
   * 按外部测量到的容器宽度重算布局
   */
  resizeToContainerWidth: (containerWidth: number) => void
  /**
   * 当前拖拽的分隔条索引
   */
  activeDivider: number | null
}

type ConstrainedPairWidthOptions = {
  desiredLeftWidth: number
  totalWidth: number
  leftMin: number
  leftMax: number
  rightMin: number
  rightMax: number
}
