import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { PanelConfig } from '../../types'
import { usePanelSizes } from '../usePanelSizes'

const configs: PanelConfig[] = [
  { id: 'left', minWidth: 200, defaultWidth: 280, collapsible: true },
  { id: 'center', minWidth: 100, defaultWidth: 'auto', collapsible: false },
  { id: 'right', minWidth: 240, defaultWidth: 320, collapsible: true },
]

function setup(panelConfigs = configs) {
  const onResizeEnd = vi.fn()
  const hook = renderHook(() =>
    usePanelSizes({
      configs: panelConfigs,
      containerWidth: 1200,
      dividerSize: 6,
      onResizeEnd,
    })
  )
  const drag = (delta: number) => act(() => hook.result.current.onDrag(delta))
  return { ...hook, drag, onResizeEnd }
}

describe('分栏拖拽收起', () => {
  it('另一侧扩张后没有足够空间时保持原侧收起，不产生负宽度', () => {
    const { result, drag } = setup()
    act(() => result.current.toggleCollapse(0))
    act(() => result.current.startDrag(1))
    drag(-768)
    act(() => result.current.endDrag())
    act(() => result.current.toggleCollapse(0))
    expect(result.current.states.map((state) => state.width)).toEqual([0, 100, 1088])
    expect(result.current.states[0].collapsed).toBe(true)
  })

  it('空间不够恢复原宽度时，展开到邻栏可提供的宽度', () => {
    const { result, drag } = setup()
    act(() => result.current.toggleCollapse(0))
    act(() => result.current.startDrag(1))
    drag(-518)
    act(() => result.current.endDrag())
    act(() => result.current.toggleCollapse(0))
    expect(result.current.states.map((state) => state.width)).toEqual([250, 100, 838])
    expect(result.current.states[0].collapsed).toBe(false)
  })

  it.each([false, true])('收起不能突破接收面板的最大宽度（镜像：%s）', (mirror) => {
    const pair: PanelConfig[] = [
      { id: 'edge', minWidth: 100, defaultWidth: 100, collapsible: true },
      { id: 'receiver', minWidth: 100, maxWidth: 300, defaultWidth: 300, collapsible: false },
    ]
    if (mirror) pair.reverse()
    const { result } = renderHook(() => usePanelSizes({ configs: pair, containerWidth: 406, dividerSize: 6 }))
    act(() => result.current.startDrag(0))
    act(() =>
      result.current.onDrag(
        mirror
          ? 101
          : -101,
      )
    )
    expect(result.current.states.map((state) => state.width)).toEqual(
      mirror
        ? [300, 100]
        : [100, 300],
    )
    expect(result.current.states.every((state) => !state.collapsed)).toBe(true)
    act(() => result.current.endDrag())
    act(() =>
      result.current.toggleCollapse(
        mirror
          ? 1
          : 0,
      )
    )
    expect(result.current.states.map((state) => state.width)).toEqual(
      mirror
        ? [300, 100]
        : [100, 300],
    )
    expect(result.current.states.every((state) => !state.collapsed)).toBe(true)
  })

  it('缩放后同步宽度预算，拖拽不会侵占其他栏的最小宽度', () => {
    const { result, rerender } = renderHook(({ width }) => usePanelSizes({ configs, containerWidth: width, dividerSize: 6 }), {
      initialProps: { width: 1200 },
    })
    rerender({ width: 800 })
    expect(result.current.states.map((state) => state.width)).toEqual([280, 188, 320])
    act(() => result.current.startDrag(0))
    act(() => result.current.onDrag(200))
    expect(result.current.states.map((state) => state.width)).toEqual([368, 100, 320])
    act(() => result.current.endDrag())
    rerender({ width: 400 })
    expect(result.current.states.map((state) => state.width)).toEqual([200, 100, 240])
  })

  it('自定义收起距离统一作用于左右栏', () => {
    const { result } = renderHook(() =>
      usePanelSizes({
        configs,
        containerWidth: 1200,
        dividerSize: 6,
        collapseDragDistance: 80,
      })
    )
    act(() => result.current.startDrag(0))
    act(() => result.current.onDrag(-121))
    expect(result.current.states[0]).toMatchObject({ width: 200, collapsed: false })
    act(() => result.current.onDrag(-160))
    expect(result.current.states[0].collapsed).toBe(false)
    act(() => result.current.onDrag(-161))
    expect(result.current.states[0].collapsed).toBe(true)
    act(() => result.current.endDrag())

    act(() => result.current.startDrag(1))
    act(() => result.current.onDrag(160))
    expect(result.current.states[2]).toMatchObject({ width: 240, collapsed: false })
    act(() => result.current.onDrag(161))
    expect(result.current.states[2].collapsed).toBe(true)
  })

  it('全零但标记展开的旧缓存应恢复初始布局并允许左右调整', () => {
    const { result } = renderHook(() =>
      usePanelSizes({
        configs,
        containerWidth: 1200,
        dividerSize: 6,
        persistedState: {
          sizes: [0, 0, 0],
          collapsedStates: [false, false, false],
          widthsBeforeCollapse: [0, 0, 0],
        },
      })
    )
    expect(result.current.states.map((state) => state.width)).toEqual([280, 588, 320])
    act(() => result.current.startDrag(0))
    act(() => result.current.onDrag(30))
    expect(result.current.states[0].width).toBe(310)
    act(() => result.current.onDrag(-30))
    expect(result.current.states[0].width).toBe(250)
  })

  it('有效缓存中的收起状态和恢复宽度应保留', () => {
    const { result } = renderHook(() =>
      usePanelSizes({
        configs,
        containerWidth: 1200,
        dividerSize: 6,
        persistedState: {
          sizes: [0, 868, 320],
          collapsedStates: [true, false, false],
          widthsBeforeCollapse: [280, 868, 320],
        },
      })
    )
    expect(result.current.states[0]).toMatchObject({ width: 0, collapsed: true, widthBeforeCollapse: 280 })
  })

  it.each([
    { index: 0, panel: 0, min: 200, toMin: -80, direction: -1 },
    { index: 1, panel: 2, min: 240, toMin: 80, direction: 1 },
  ])('面板 $panel 仅在按住并超过最小宽度 100px 后立即收起', ({ index, panel, min, toMin, direction }) => {
    const { result, drag, onResizeEnd } = setup()
    act(() => result.current.startDrag(index))
    drag(toMin)
    expect(result.current.states[panel]).toMatchObject({ width: min, collapsed: false })
    drag(toMin + direction * 100)
    expect(result.current.states[panel]).toMatchObject({ width: min, collapsed: false })
    drag(toMin + direction * 101)
    expect(result.current.activeDivider).toBe(index)
    expect(result.current.states[panel]).toMatchObject({ width: 0, collapsed: true })
    expect(result.current.states.reduce((sum, state) => sum + state.width, 0)).toBe(1188)
    // 继续向内拖保持收起，反向拖动才展开，展开后不重复使用之前的位移
    drag(toMin + direction * 110)
    expect(result.current.states[panel].collapsed).toBe(true)
    drag(toMin + direction * 90)
    expect(result.current.states[panel]).toMatchObject({ width: min, collapsed: false })
    drag(toMin + direction * 80)
    expect(result.current.states[panel]).toMatchObject({ width: min + 10, collapsed: false })
    act(() => result.current.endDrag())
    expect(onResizeEnd).toHaveBeenCalledTimes(1)
    expect(onResizeEnd.mock.calls[0][0][panel]).toBe(min + 10)
  })

  it('在最小宽度松手或原地点击不会收起', () => {
    const { result, drag } = setup()
    act(() => result.current.startDrag(0))
    drag(-80)
    act(() => result.current.endDrag())
    act(() => result.current.startDrag(0))
    act(() => result.current.endDrag())
    expect(result.current.states[0]).toMatchObject({ width: 200, collapsed: false })
  })

  it('禁止收起的面板即使越过距离也保持最小宽度', () => {
    const { result, drag } = setup(configs.map((config) => ({ ...config, collapsible: false })))
    act(() => result.current.startDrag(0))
    drag(-200)
    expect(result.current.states[0]).toMatchObject({ width: 200, collapsed: false })
  })
})
