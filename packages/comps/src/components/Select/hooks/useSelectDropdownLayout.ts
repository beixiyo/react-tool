/**
 * 下拉面板布局：翻面方向、空间限高、与触发器等宽在同一次测量里决定，
 * `useFloatingPosition` 只按选定方向计算坐标（不再自行翻面）
 *
 * 不能直接用 `useFloatingPosition` 的 flip：它按面板当前 offsetHeight 判断，
 * 而面板一旦按某一侧的剩余空间限高，这一侧就必然「放得下」，于是永远不会翻面——
 * 打开时默认在下方，触发器靠近视口底部时面板被压到只剩一项，直到滚动让下方空间变大才恢复
 * 这里改用「不受空间限制时的期望高度」选方向，再只按所选一侧限高
 */
import { useFloatingPosition, useLatestCallback, useResizeObserver } from 'hooks'
import type { CSSProperties, RefObject } from 'react'
import { useEffect, useLayoutEffect, useState } from 'react'

/** 面板与触发器的间距（px） */
const PANEL_OFFSET = 4
/** 面板与视口边缘的最小间距（px） */
const PANEL_BOUNDARY_PADDING = 8

const INITIAL_MEASURE: PanelMeasure = { side: 'bottom', width: undefined, space: undefined, chrome: 0 }

export function useSelectDropdownLayout(
  triggerRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  options: UseSelectDropdownLayoutOptions,
): SelectDropdownLayout {
  const { open, heightScope, maxHeight, fixedHeight } = options
  const [measured, setMeasured] = useState<PanelMeasure>(INITIAL_MEASURE)

  const floating = useFloatingPosition(triggerRef, panelRef, {
    enabled: open,
    placement: measured.side === 'top'
      ? 'top-start'
      : 'bottom-start',
    offset: PANEL_OFFSET,
    boundaryPadding: PANEL_BOUNDARY_PADDING,
    flip: false,
    shift: true,
    /** 滚动 / 缩放由下方统一监听，先重新决定方向与限高，再更新坐标 */
    autoUpdate: false,
    strategy: 'fixed',
  })

  const measure = useLatestCallback(() => {
    const trigger = triggerRef.current
    const panel = panelRef.current
    if (!trigger || !panel) return

    const rect = trigger.getBoundingClientRect()
    const reserved = PANEL_OFFSET + PANEL_BOUNDARY_PADDING
    const spaceBelow = Math.max(0, window.innerHeight - rect.bottom - reserved)
    const spaceAbove = Math.max(0, rect.top - reserved)

    /**
     * 自然高度 = 面板外框（padding / border / 搜索框 / footer 等固定部分）+ 列表内容高度
     * 列表是 min-h-0 的滚动区，限高只压缩列表，外框高度不随限高变化，测量结果不会被自身限高反向影响
     */
    const listboxes = Array.from(panel.querySelectorAll<HTMLElement>('[role="listbox"]'))
    const listboxHeight = Math.max(0, ...listboxes.map((el) => el.offsetHeight))
    const contentHeight = Math.max(0, ...listboxes.map((el) => el.scrollHeight))
    const chrome = Math.max(0, panel.offsetHeight - listboxHeight)
    const desired = fixedHeight ?? (heightScope === 'panel'
      ? Math.min(maxHeight, chrome + contentHeight)
      : chrome + Math.min(maxHeight, contentHeight))

    const side: PanelSide = desired <= spaceBelow
      ? 'bottom'
      : desired <= spaceAbove || spaceAbove > spaceBelow
      ? 'top'
      : 'bottom'
    const next: PanelMeasure = {
      side,
      width: rect.width,
      space: side === 'top'
        ? spaceAbove
        : spaceBelow,
      chrome,
    }

    setMeasured((prev) =>
      prev.side === next.side && prev.width === next.width && prev.space === next.space && prev.chrome === next.chrome
        ? prev
        : next
    )
  })

  /** 先定方向与限高，再按（可能是上一轮渲染的）方向更新坐标；方向变化引起的重渲染会在绘制前再同步一次 */
  const sync = useLatestCallback(() => {
    measure()
    floating.update()
  })

  /**
   * 打开期间每次渲染都在绘制前同步：选项过滤、footer 变化等都会改变自然高度
   * 状态未变时 setState 直接跳过，不会形成渲染循环
   */
  useLayoutEffect(() => {
    if (open) sync()
  })

  /** 窗口缩放与任意滚动（捕获阶段可覆盖滚动容器）时重新测量 */
  useEffect(() => {
    if (!open) return
    window.addEventListener('resize', sync, { passive: true })
    window.addEventListener('scroll', sync, { capture: true, passive: true })
    return () => {
      window.removeEventListener('resize', sync)
      window.removeEventListener('scroll', sync, { capture: true })
    }
  }, [open, sync])

  /** 触发器宽度变化、面板内容（如 footer 自身状态）变化而 Select 未重渲染时也要重新测量 */
  useResizeObserver([triggerRef, panelRef] as RefObject<HTMLElement>[], () => {
    if (open) sync()
  })

  const { space, chrome } = measured
  const sizeStyle: CSSProperties = {}
  let listboxMaxHeight = maxHeight

  if (heightScope === 'panel') {
    sizeStyle.width = measured.width || undefined
    if (fixedHeight != null) {
      sizeStyle.height = fixedHeight
      if (space != null && space < fixedHeight) sizeStyle.maxHeight = space
    }
    else {
      sizeStyle.maxHeight = space == null
        ? maxHeight
        : Math.min(maxHeight, space)
    }
  }
  else if (space != null) {
    listboxMaxHeight = Math.max(0, Math.min(maxHeight, space - chrome))
  }

  return {
    side: measured.side,
    panelStyle: { ...floating.style, ...sizeStyle },
    listboxMaxHeight,
  }
}

type PanelSide = 'top' | 'bottom'

type PanelMeasure = {
  side: PanelSide
  /** 触发器宽度，尚未测量时为 undefined */
  width: number | undefined
  /** 所选一侧可容纳面板的高度，尚未测量时为 undefined */
  space: number | undefined
  /** 面板除列表外的固定高度 */
  chrome: number
}

export type UseSelectDropdownLayoutOptions = {
  /** 面板是否展开；收起后保留最后一次测量结果，避免退出动画期间尺寸跳变 */
  open: boolean
  /**
   * `maxHeight` 作用范围
   * - `panel`：整个面板（非级联），面板宽度同时跟随触发器
   * - `listbox`：每一列列表（级联），面板宽度随列数变化
   */
  heightScope: 'panel' | 'listbox'
  /** 调用方配置的最大高度（px），空间不足时进一步收缩 */
  maxHeight: number
  /** 固定高度（px），仅 `heightScope: 'panel'` 生效，空间不足时同样收缩 */
  fixedHeight?: number
}

export type SelectDropdownLayout = {
  /** 面板相对触发器的方向，用于动画原点 */
  side: PanelSide
  /** 面板定位与尺寸样式 */
  panelStyle: CSSProperties
  /** 级联模式下每列列表的最大高度（px） */
  listboxMaxHeight: number
}
