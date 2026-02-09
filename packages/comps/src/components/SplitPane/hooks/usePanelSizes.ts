import type { PanelConfig, PanelState, PersistedState } from '../types'
import { clamp } from '@jl-org/tool'
import { useCallback, useEffect, useRef, useState } from 'react'
import { calculateInitialWidths, shouldAutoCollapse } from '../utils'

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
   * 持久化的初始状态
   */
  persistedState?: PersistedState | null
  /**
   * 布局变化回调
   */
  onLayoutChange?: (sizes: number[], collapsedStates: boolean[]) => void
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
   * 当前拖拽的分隔条索引
   */
  activeDivider: number | null
}

/**
 * 面板尺寸管理 Hook
 */
export function usePanelSizes(options: UsePanelSizesOptions): UsePanelSizesReturn {
  const { configs, containerWidth, dividerSize, persistedState, onLayoutChange } = options

  const [states, setStates] = useState<PanelState[]>([])
  const [activeDivider, setActiveDivider] = useState<number | null>(null)
  const dragStartStatesRef = useRef<PanelState[]>([])
  const isInitializedRef = useRef(false)

  /** 初始化状态 */
  useEffect(() => {
    if (containerWidth <= 0 || configs.length === 0)
      return
    if (isInitializedRef.current && states.length === configs.length)
      return

    let initialStates: PanelState[]

    if (persistedState && persistedState.sizes.length === configs.length) {
      /** 从持久化状态恢复 */
      initialStates = configs.map((config, i) => ({
        width: persistedState.sizes[i],
        collapsed: persistedState.collapsedStates[i],
        widthBeforeCollapse: persistedState.widthsBeforeCollapse[i],
      }))
    }
    else {
      /** 计算初始宽度 */
      const initialWidths = calculateInitialWidths(configs, containerWidth, dividerSize)
      initialStates = configs.map((config, i) => ({
        width: initialWidths[i],
        collapsed: false,
        widthBeforeCollapse: initialWidths[i],
      }))
    }

    setStates(initialStates)
    isInitializedRef.current = true
  }, [configs, containerWidth, dividerSize, persistedState, states.length])

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
      let newLeftWidth = leftStartWidth + delta
      let newRightWidth = rightStartWidth - delta

      /** 应用约束 */
      const leftMin = leftConfig.minWidth ?? 100
      const leftMax = leftConfig.maxWidth ?? Infinity
      const rightMin = rightConfig.minWidth ?? 100
      const rightMax = rightConfig.maxWidth ?? Infinity

      newLeftWidth = clamp(newLeftWidth, leftMin, leftMax)
      newRightWidth = clamp(newRightWidth, rightMin, rightMax)

      /** 确保总宽度不变 */
      const totalWidth = leftStartWidth + rightStartWidth
      if (newLeftWidth + newRightWidth !== totalWidth) {
        if (delta > 0) {
          newRightWidth = totalWidth - newLeftWidth
        }
        else {
          newLeftWidth = totalWidth - newRightWidth
        }
      }

      /** 再次应用约束 */
      newLeftWidth = clamp(newLeftWidth, leftMin, leftMax)
      newRightWidth = clamp(newRightWidth, rightMin, rightMax)

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

      return newStates
    })

    setActiveDivider(null)
  }, [activeDivider, configs])

  const toggleCollapse = useCallback(
    (panelIndex: number) => {
      const config = configs[panelIndex]
      if (!config.collapsible)
        return

      setStates((prev) => {
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
    [configs],
  )

  return {
    states,
    startDrag,
    onDrag,
    endDrag,
    toggleCollapse,
    activeDivider,
  }
}
