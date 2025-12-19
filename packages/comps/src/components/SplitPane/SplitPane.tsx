import type { ReactElement, MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import type { PanelConfig, SplitPanePanelProps, SplitPaneProps } from './types'
import {
  Children,
  isValidElement,
  memo,

  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { SplitPaneContext, usePanelState, useTogglePanel } from './context'
import { Divider } from './Divider'
import { usePanelSizes } from './hooks/usePanelSizes'
import { usePersistence } from './hooks/usePersistence'
import { PanelInternal } from './Panel'
import { generateId } from './utils'

/**
 * SplitPane.Panel 子组件
 */
function SplitPanePanel({ children }: SplitPanePanelProps) {
  return <>{ children }</>
}
SplitPanePanel.displayName = 'SplitPane.Panel'

/**
 * 分栏布局主组件
 */
const SplitPaneRoot = memo(({
  children,
  storageKey,
  dividerSize = 4,
  onLayoutChange,
  theme,
  className = '',
  animationDuration = 200,
  dividerStyleConfig,
  draggableDividers,
}: SplitPaneProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const dragStartXRef = useRef(0)

  /** 解析 children 获取面板配置 */
  const { panelConfigs, panelContents, panelIds } = useMemo(() => {
    const configs: PanelConfig[] = []
    const contents: ReactNode[] = []
    const ids: (string | undefined)[] = []

    Children.forEach(children, (child, index) => {
      if (isValidElement(child) && child.type === SplitPanePanel) {
        const props = child.props as SplitPanePanelProps
        const childCount = Children.count(children)
        const isEdgePanel = index === 0 || index === childCount - 1
        /** 两栏布局时，只有第一个面板可收起；多栏布局时，边缘面板可收起 */
        const defaultCollapsible = childCount === 2
          ? index === 0
          : isEdgePanel

        configs.push({
          id: generateId(),
          minWidth: props.minWidth ?? 100,
          maxWidth: props.maxWidth ?? Infinity,
          collapsedWidth: props.collapsedWidth ?? 0,
          collapsible: props.collapsible ?? defaultCollapsible,
          autoCollapseThreshold: props.autoCollapseThreshold,
          defaultWidth: props.defaultWidth ?? 'auto',
        })
        contents.push(props.children)
        ids.push(props.id)
      }
    })

    return { panelConfigs: configs, panelContents: contents, panelIds: ids }
  }, [children])

  /** 持久化 Hook */
  const { loadState } = usePersistence({
    storageKey,
    panelCount: panelConfigs.length,
    states: [],
  })

  /** 加载持久化状态 */
  const persistedState = useMemo(() => loadState(), [loadState])

  /** 面板尺寸管理 */
  const {
    states,
    startDrag,
    onDrag,
    endDrag,
    toggleCollapse,
    activeDivider,
  } = usePanelSizes({
    configs: panelConfigs,
    containerWidth,
    dividerSize,
    persistedState,
    onLayoutChange,
  })

  const handleDividerDragStart = useCallback(
    (index: number, event: ReactMouseEvent) => {
      /** 如果对应分隔条被配置为不可拖拽，则直接返回 */
      if (Array.isArray(draggableDividers) && draggableDividers[index] === false)
        return

      dragStartXRef.current = event.clientX
      startDrag(index)
    },
    [startDrag, draggableDividers],
  )

  /** 状态持久化 */
  usePersistence({
    storageKey,
    panelCount: panelConfigs.length,
    states,
  })

  /** 监听容器尺寸变化 */
  useEffect(() => {
    const container = containerRef.current
    if (!container)
      return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  /** 全局拖拽事件处理 */
  useEffect(() => {
    if (activeDivider === null)
      return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - dragStartXRef.current
      onDrag(delta)
    }

    const handleMouseUp = () => {
      endDrag()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [activeDivider, onDrag, endDrag])

  /** 处理面板收起 */
  const handleCollapseLeft = useCallback(
    (dividerIndex: number) => {
      toggleCollapse(dividerIndex)
    },
    [toggleCollapse],
  )

  const handleCollapseRight = useCallback(
    (dividerIndex: number) => {
      toggleCollapse(dividerIndex + 1)
    },
    [toggleCollapse],
  )

  /** 判断面板是否是 flex 面板（自动填充剩余空间） */
  const isFlexPanel = useCallback(
    (index: number) => {
      /** 两栏布局时，最后一个面板是 flex */
      if (panelConfigs.length === 2) {
        return index === 1
      }
      /** 多栏布局时，中间面板是 flex */
      return index > 0 && index < panelConfigs.length - 1
    },
    [panelConfigs.length],
  )

  /** 通过 id 切换面板状态 */
  const togglePanelById = useCallback((id: string) => {
    const index = panelIds.indexOf(id)
    if (index !== -1) {
      toggleCollapse(index)
    }
  }, [panelIds, toggleCollapse])

  /** 构建 Context 值 */
  const contextValue = useMemo(() => {
    const panelStates: Record<string, typeof states[number]> = {}
    panelIds.forEach((id, index) => {
      if (id && states[index]) {
        panelStates[id] = states[index]
      }
    })
    return { panelStates, togglePanel: togglePanelById }
  }, [panelIds, states, togglePanelById])

  if (states.length === 0) {
    return (
      <div
        ref={ containerRef }
        className={ `flex h-full w-full overflow-hidden ${className}` }
      />
    )
  }

  return (
    <SplitPaneContext value={ contextValue }>
      <div
        ref={ containerRef }
        className={ `flex h-full w-full select-none overflow-hidden ${className}` }
        style={ {
          cursor: activeDivider !== null
            ? 'col-resize'
            : undefined,
        } }
      >
        { panelContents.map((content, index) => (
          <div key={ panelConfigs[index].id } className="contents">
            <PanelInternal
              width={ states[index]?.width ?? 0 }
              collapsed={ states[index]?.collapsed ?? false }
              isMiddle={ isFlexPanel(index) }
              isDragging={ activeDivider !== null }
              animationDuration={ animationDuration }
              className={ (Children.toArray(children)[index] as ReactElement<SplitPanePanelProps>)?.props?.className }
            >
              { content }
            </PanelInternal>

            {/* 分隔条 */ }
            { index < panelConfigs.length - 1 && (
              <Divider
                index={ index }
                size={ dividerSize }
                leftCollapsible={ panelConfigs[index].collapsible ?? false }
                rightCollapsible={ panelConfigs[index + 1].collapsible ?? false }
                leftCollapsed={ states[index]?.collapsed ?? false }
                rightCollapsed={ states[index + 1]?.collapsed ?? false }
                onDragStart={ handleDividerDragStart }
                onCollapseLeft={ () => handleCollapseLeft(index) }
                onCollapseRight={ () => handleCollapseRight(index) }
                theme={ theme }
                styleConfig={ dividerStyleConfig }
                draggable={ !draggableDividers || draggableDividers[index] !== false }
              />
            ) }
          </div>
        )) }
      </div>
    </SplitPaneContext>
  )
})

/**
 * 分栏布局组件
 *
 * @example
 * ```tsx
 * <SplitPane storageKey="main-layout">
 *   <SplitPane.Panel minWidth={200} maxWidth={400}>
 *     左侧边栏
 *   </SplitPane.Panel>
 *   <SplitPane.Panel>
 *     主内容区域
 *   </SplitPane.Panel>
 *   <SplitPane.Panel minWidth={250}>
 *     右侧面板
 *   </SplitPane.Panel>
 * </SplitPane>
 * ```
 */
export const SplitPane = Object.assign(SplitPaneRoot, {
  Panel: SplitPanePanel,
  usePanelState,
  useTogglePanel,
})
