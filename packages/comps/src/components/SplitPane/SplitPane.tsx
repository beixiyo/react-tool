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
}: SplitPaneProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const dragStartXRef = useRef(0)

  /** 解析 children 获取面板配置 */
  const { panelConfigs, panelContents } = useMemo(() => {
    const configs: PanelConfig[] = []
    const contents: ReactNode[] = []

    Children.forEach(children, (child, index) => {
      if (isValidElement(child) && child.type === SplitPanePanel) {
        const props = child.props as SplitPanePanelProps
        const isEdgePanel = index === 0 || index === Children.count(children) - 1

        configs.push({
          id: generateId(),
          minWidth: props.minWidth ?? 100,
          maxWidth: props.maxWidth ?? Infinity,
          collapsedWidth: props.collapsedWidth ?? 0,
          collapsible: isEdgePanel
            ? props.collapsible ?? true
            : false,
          autoCollapseThreshold: props.autoCollapseThreshold,
          defaultWidth: props.defaultWidth ?? 'auto',
        })
        contents.push(props.children)
      }
    })

    return { panelConfigs: configs, panelContents: contents }
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
      dragStartXRef.current = event.clientX
      startDrag(index)
    },
    [startDrag],
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

  /** 判断面板是否是中间面板 */
  const isMiddlePanel = useCallback(
    (index: number) => {
      return index > 0 && index < panelConfigs.length - 1
    },
    [panelConfigs.length],
  )

  if (states.length === 0) {
    return (
      <div
        ref={ containerRef }
        className={ `flex h-full w-full overflow-hidden ${className}` }
      />
    )
  }

  return (
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
            isMiddle={ isMiddlePanel(index) }
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
            />
          ) }
        </div>
      )) }
    </div>
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
})
