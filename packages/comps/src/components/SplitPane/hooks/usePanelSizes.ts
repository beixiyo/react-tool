import { useLatestCallback } from 'hooks'
import { useCallback, useEffect, useRef, useState } from 'react'
import { fitPanelWidths, getPairLimits, resizePanelPair, togglePanelPair } from '../layout'
import type { PanelConfig, PanelState, PersistedState, SplitPaneLayoutResolver, SplitPaneToggleResolver } from '../types'
import { calculateInitialWidths } from '../utils'

/**
 * 面板尺寸管理 Hook
 */
export function usePanelSizes(options: UsePanelSizesOptions): UsePanelSizesReturn {
  const {
    configs,
    containerWidth,
    dividerSize,
    dividerSizes,
    gap = 0,
    collapseDragDistance = 100,
    persistedState,
    onLayoutChange,
    onResizeEnd,
    resolveLayout,
    resolveToggle,
  } = options

  /** 用最新引用包裹，避免把回调放进依赖导致闭包陈旧 */
  const handleResizeEnd = useLatestCallback((sizes: number[], collapsedStates: boolean[]) => {
    onResizeEnd?.(sizes, collapsedStates)
  })
  const resolvePanelLayout = useLatestCallback((baseStates: PanelState[], reason: 'init' | 'resize') => {
    const context = { configs, states: baseStates, containerWidth, dividerSize, dividerSizes, gap, reason }
    return resolveLayout
      ? resolveLayout(context) ?? baseStates
      : fitPanelWidths(context)
  })

  const fitDefaultLayout = useLatestCallback((next: PanelState[]) =>
    resolveLayout
      ? next
      : fitPanelWidths({ configs, states: next, containerWidth, dividerSize, dividerSizes, gap })
  )

  const [states, setStates] = useState<PanelState[]>([])
  const [activeDivider, setActiveDivider] = useState<number | null>(null)
  const [isDragTransition, setIsDragTransition] = useState(false)
  const dragStartStatesRef = useRef<PanelState[]>([])
  const dragOriginDeltaRef = useRef(0)
  const isInitializedRef = useRef(false)
  const previousContainerWidthRef = useRef(0)

  /** 初始化状态 */
  useEffect(() => {
    if (containerWidth <= 0 || configs.length === 0) return
    if (isInitializedRef.current && states.length === configs.length) return

    let initialStates: PanelState[]

    const canRestore = persistedState
      && persistedState.sizes.length === configs.length
      && persistedState.collapsedStates.length === configs.length
      && persistedState.widthsBeforeCollapse.length === configs.length
      && configs.every((config, index) => {
        const width = persistedState.sizes[index]
        const previousWidth = persistedState.widthsBeforeCollapse[index]
        const collapsed = persistedState.collapsedStates[index]
        const min = config.minWidth ?? 100
        const max = config.maxWidth ?? Infinity
        return Number.isFinite(width)
          && Number.isFinite(previousWidth)
          && previousWidth >= min
          && previousWidth <= max
          && typeof collapsed === 'boolean'
          && (collapsed
            ? config.collapsible && width === (config.collapsedWidth ?? 0)
            : width >= min && width <= max)
      })

    if (persistedState && canRestore) {
      /** 只恢复与当前面板约束一致的缓存，避免 CSS 最小宽度掩盖全零等非法状态 */
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
    if (!isInitializedRef.current || containerWidth <= 0) return

    if (previousContainerWidthRef.current === containerWidth) return

    previousContainerWidthRef.current = containerWidth
    setActiveDivider(null)

    setStates((prev) => {
      if (prev.length !== configs.length) return prev

      return resolvePanelLayout(prev, 'resize')
    })
  }, [configs.length, containerWidth, resolvePanelLayout])

  /** 布局变化回调 */
  useEffect(() => {
    if (states.length > 0 && onLayoutChange) {
      onLayoutChange(
        states.map((s) => s.width),
        states.map((s) => s.collapsed),
      )
    }
  }, [states, onLayoutChange])

  const startDrag = useCallback((dividerIndex: number) => {
    setActiveDivider(dividerIndex)
    setIsDragTransition(false)
    dragStartStatesRef.current = [...states]
    dragOriginDeltaRef.current = 0
  }, [states])

  const onDrag = useCallback(
    (delta: number) => {
      if (activeDivider === null) return

      const leftIndex = activeDivider
      const rightIndex = activeDivider + 1
      const startStates = dragStartStatesRef.current
      if (!startStates[leftIndex] || !startStates[rightIndex]) return

      const left = startStates[leftIndex]
      const right = startStates[rightIndex]
      const leftConfig = configs[leftIndex]
      const rightConfig = configs[rightIndex]
      const leftMin = leftConfig.minWidth ?? 100
      const rightMin = rightConfig.minWidth ?? 100
      const movement = delta - dragOriginDeltaRef.current
      let next = startStates

      /** 收起 / 展开后重新锚定鼠标，避免同一段位移被重复计算或立即反弹 */
      const commitTransition = () => {
        next = fitDefaultLayout(next)
        dragStartStatesRef.current = next
        dragOriginDeltaRef.current = delta
        setIsDragTransition(true)
        setStates(next)
      }

      if (left.collapsed || right.collapsed) {
        if (left.collapsed && movement > 0) {
          next = togglePanelPair(configs, startStates, leftIndex, rightIndex, leftMin)
        }
        else if (right.collapsed && movement < 0) {
          next = togglePanelPair(configs, startStates, rightIndex, leftIndex, rightMin)
        }
        if (next !== startStates) commitTransition()
        return
      }

      const desiredLeftWidth = left.width + movement
      const desiredRightWidth = right.width - movement
      const resized = resizePanelPair(configs, startStates, leftIndex, desiredLeftWidth)

      if (leftConfig.collapsible && movement < 0 && resized[leftIndex].width === leftMin && desiredLeftWidth < leftMin - collapseDragDistance) {
        next = togglePanelPair(configs, resized, leftIndex, rightIndex)
      }
      else if (rightConfig.collapsible && movement > 0 && resized[rightIndex].width === rightMin && desiredRightWidth < rightMin - collapseDragDistance) {
        next = togglePanelPair(configs, resized, rightIndex, leftIndex)
      }
      if (next !== startStates && next !== resized) {
        commitTransition()
        return
      }

      setIsDragTransition(false)
      setStates(resized)
    },
    [activeDivider, configs, collapseDragDistance, fitDefaultLayout],
  )

  const endDrag = useCallback(() => {
    if (activeDivider === null) return

    setActiveDivider(null)
    handleResizeEnd(
      states.map((s) => s.width),
      states.map((s) => s.collapsed),
    )
  }, [activeDivider, states, handleResizeEnd])

  const resizeToContainerWidth = useLatestCallback((nextContainerWidth: number) => {
    if (!isInitializedRef.current || nextContainerWidth <= 0) return

    if (previousContainerWidthRef.current === nextContainerWidth) return

    previousContainerWidthRef.current = nextContainerWidth
    setActiveDivider(null)

    setStates((prev) => {
      if (prev.length !== configs.length) return prev

      const context = { configs, states: prev, containerWidth: nextContainerWidth, dividerSize, dividerSizes, gap, reason: 'resize' as const }
      return resolveLayout
        ? resolveLayout(context) ?? prev
        : fitPanelWidths(context)
    })
  })

  const toggleCollapse = useCallback(
    (panelIndex: number) => {
      const config = configs[panelIndex]
      if (!config.collapsible) return

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
        if (resolvedStates) return resolvedStates

        // 优先向自适应栏借还空间，其次选择相邻展开栏
        let adjacent = configs.findIndex((item, index) =>
          index !== panelIndex && !prev[index].collapsed && (item.defaultWidth === 'auto' || item.defaultWidth === undefined)
        )
        if (adjacent === -1) {
          adjacent = panelIndex === 0
            ? 1
            : panelIndex - 1
        }
        const next = togglePanelPair(configs, prev, panelIndex, adjacent)
        return next === prev
          ? prev
          : fitDefaultLayout(next)
      })
    },
    [configs, containerWidth, dividerSize, dividerSizes, gap, resolveToggle, fitDefaultLayout],
  )

  const resizeDivider = useLatestCallback((index: number, movement: number | 'min' | 'max') => {
    if (!states[index] || !states[index + 1]) return
    const limits = getPairLimits(configs, states, index)
    const desired = movement === 'min'
      ? limits.min
      : movement === 'max'
      ? limits.max
      : states[index].width + movement
    const next = resizePanelPair(configs, states, index, desired)
    setIsDragTransition(false)
    setStates(next)
    handleResizeEnd(next.map((state) => state.width), next.map((state) => state.collapsed))
  })

  return {
    states,
    startDrag,
    onDrag,
    endDrag,
    toggleCollapse,
    resizeDivider,
    resizeToContainerWidth,
    activeDivider,
    isDragTransition,
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
   * 超过最小宽度后的收起拖拽距离（像素）
   * @default 100
   */
  collapseDragDistance?: number
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
  /** 通过键盘调整分隔条，min / max 为两侧约束允许的边界 */
  resizeDivider: (index: number, movement: number | 'min' | 'max') => void
  /**
   * 按外部测量到的容器宽度重算布局
   */
  resizeToContainerWidth: (containerWidth: number) => void
  /**
   * 当前拖拽的分隔条索引
   */
  activeDivider: number | null
  /** 当前是否正在拖拽触发的收起 / 展开过渡中 */
  isDragTransition: boolean
}
