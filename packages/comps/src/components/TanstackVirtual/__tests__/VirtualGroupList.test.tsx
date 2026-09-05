import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VirtualGroupList } from '../VirtualGroupList'

const { measureElement, resizeItem, itemSizeCache, elementsCache, useVirtualizer } = vi.hoisted(() => ({
  measureElement: vi.fn(),
  resizeItem: vi.fn(),
  itemSizeCache: new Map<string | number, number>(),
  elementsCache: new Map<string | number, Element>(),
  useVirtualizer: vi.fn(),
}))

vi.mock('@tanstack/react-virtual', () => ({
  defaultRangeExtractor: ({
    startIndex,
    endIndex,
    overscan,
    count,
  }: {
    startIndex: number
    endIndex: number
    overscan: number
    count: number
  }) =>
    Array.from(
      {
        length: Math.min(endIndex + overscan, count - 1)
          - Math.max(startIndex - overscan, 0)
          + 1,
      },
      (_, offset) => Math.max(startIndex - overscan, 0) + offset,
    ),
  useVirtualizer: (options: {
    count: number
    getItemKey: (index: number) => string | number
    overscan: number
  }) => {
    useVirtualizer(options)

    return {
      isScrolling: false,
      options: { overscan: options.overscan },
      range: options.count > 0
        ? { startIndex: 0, endIndex: options.count - 1 }
        : null,
      getTotalSize: () => 24 + options.count * 80,
      getVirtualItems: () =>
        Array.from({ length: options.count }, (_, index) => ({
          index,
          key: options.getItemKey(index),
          start: 24 + index * 80,
          end: 24 + (index + 1) * 80,
          size: 80,
          lane: 0,
        })),
      /** 记录挂载节点，供驱动行量取内容高度 */
      measureElement: (node: HTMLElement | null) => {
        measureElement(node)
        if (node) elementsCache.set(options.getItemKey(Number(node.dataset.index)), node)
      },
      resizeItem,
      itemSizeCache,
      elementsCache,
      scrollToIndex: vi.fn(),
      scrollToOffset: vi.fn(),
    }
  },
}))

describe('VirtualGroupList 公共属性', () => {
  beforeEach(() => {
    measureElement.mockClear()
    useVirtualizer.mockClear()
  })

  it('将 contentClassName 透传到虚拟内容容器', () => {
    const { container } = render(
      <VirtualGroupList
        sections={ [] }
        renderItem={ () => null }
        contentClassName="virtual-content"
      />,
    )

    expect(container.querySelector('.virtual-content')).toBeTruthy()
  })

  it('默认仍由 TanStack 的 transform 定位虚拟行', () => {
    const { container } = render(
      <VirtualGroupList
        sections={ [{ key: 'todo', items: [{ id: 1 }] }] }
        renderItem={ (item) => <span>{ item.id }</span> }
      />,
    )

    const row = container.querySelector<HTMLElement>('[data-index="0"]')
    expect(row?.style.transform).toBe('translateY(24px)')
    expect(row?.style.top).toBe('')
  })

  it('动画模式不额外包裹行内容，保持原有 DOM 与测量契约', () => {
    const { container } = render(
      <VirtualGroupList
        sections={ [{ key: 'todo', items: [{ id: 1 }] }] }
        renderItem={ () => <article data-testid="card" /> }
        layoutAnimation={ {} }
      />,
    )

    const row = container.querySelector<HTMLElement>('[data-index="0"]')
    expect(row?.firstElementChild).toBe(container.querySelector('[data-testid="card"]'))
  })
})

describe('VirtualGroupList 出入场', () => {
  it('从数据里删除的行原地播退场后卸载，行模型本身同步切换', async () => {
    const renderCard = (item: { id: number }) => <span data-testid={ `card-${item.id}` }>{ item.id }</span>
    const { container, rerender } = render(
      <VirtualGroupList
        sections={ [{ key: 'todo', items: [{ id: 1 }, { id: 2 }] }] }
        renderItem={ renderCard }
        layoutAnimation={ {} }
      />,
    )

    rerender(
      <VirtualGroupList
        sections={ [{ key: 'todo', items: [{ id: 2 }] }] }
        renderItem={ renderCard }
        layoutAnimation={ {} }
      />,
    )

    /** 虚拟行只剩 1 条；被删的行以退场快照留在原坐标，不再是虚拟行 */
    expect(container.querySelectorAll('[data-index]')).toHaveLength(1)
    const exiting = container.querySelector('[data-testid="card-1"]')?.parentElement
    expect(exiting).toBeTruthy()
    expect(exiting?.hasAttribute('data-index')).toBe(false)
    expect(exiting?.style.top).toBe('24px')

    await waitFor(() => expect(container.querySelector('[data-testid="card-1"]')).toBeNull(), { timeout: 2000 })
  })
})

describe('VirtualGroupList 收放动画', () => {
  /** 永不结束的过渡，测试期间驱动组始终在场 */
  const collapseAnimation = { transition: { duration: 10 } }
  const sections = [{
    key: 'todo',
    header: <h2>Todo</h2>,
    items: [{ id: 1 }, { id: 2 }],
    collapsedPreview: <em data-testid="preview" />,
  }]
  const renderCard = (item: { id: number }) => <span data-testid="card">{ item.id }</span>
  const drivenRows = (container: HTMLElement) => container.querySelectorAll<HTMLElement>('[data-vv-virtual-driven]')

  beforeEach(() => {
    measureElement.mockClear()
    resizeItem.mockClear()
    itemSizeCache.clear()
    elementsCache.clear()
    /** jsdom 没有布局：含卡片的节点内容高 80，其余为 0；全局配置会在每个用例后自动还原 */
    vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockImplementation(function (this: Element) {
      return this.querySelector('[data-testid="card"]')
        ? 80
        : 0
    })
  })

  it('收起时整组 item 行留在行模型里被驱动，测量不再覆盖动画尺寸', () => {
    itemSizeCache.set('item-todo-1', 80)
    itemSizeCache.set('item-todo-2', 80)
    const { container, rerender } = render(
      <VirtualGroupList
        sections={ sections }
        renderItem={ renderCard }
        expanded={ ['todo'] }
        collapseAnimation={ collapseAnimation }
        layoutAnimation={ {} }
      />,
    )
    expect(drivenRows(container)).toHaveLength(0)

    rerender(
      <VirtualGroupList
        sections={ sections }
        renderItem={ renderCard }
        expanded={ [] }
        collapseAnimation={ collapseAnimation }
        layoutAnimation={ {} }
      />,
    )

    /** 行模型：组头 / 两条被驱动的 item 行 / 预览行；起播不挂载也不卸载任何行 */
    expect(container.querySelectorAll('[data-index]')).toHaveLength(4)
    expect(drivenRows(container)).toHaveLength(2)
    expect(container.querySelector('[data-testid="preview"]')).toBeTruthy()
    /** 驱动行的盒子高度由 virtualizer 给出并裁切内容 */
    const driven = drivenRows(container)[0]
    expect(driven.style.height).toBe('80px')
    expect(driven.style.overflow).toBe('hidden')
    /** 起点就是当前满高，不需要改写尺寸 */
    expect(resizeItem).not.toHaveBeenCalled()

    /** ResizeObserver 仍挂着，但对驱动行的测量必须原样返回缓存，不能用盒子高度覆盖动画 */
    const options = useVirtualizer.mock.calls.at(-1)?.[0] as {
      measureElement: (element: Element, entry: undefined, instance: unknown) => number
    }
    const instance = {
      indexFromElement: () => 1,
      itemSizeCache: new Map([['item-todo-1', 42.5]]),
      options: { getItemKey: () => 'item-todo-1' },
    }
    expect(options.measureElement(driven, undefined, instance)).toBe(42.5)
  })

  it('展开带预览的分组时，先播完的驱动组不会让另一组重新起播，也不提前切回终态', () => {
    itemSizeCache.set('preview-todo', 0)
    const { container, rerender } = render(
      <VirtualGroupList
        sections={ sections }
        renderItem={ renderCard }
        expanded={ [] }
        collapseAnimation={ collapseAnimation }
      />,
    )
    expect(container.querySelector('[data-testid="preview"]')).toBeTruthy()

    rerender(
      <VirtualGroupList
        sections={ sections }
        renderItem={ renderCard }
        expanded={ ['todo'] }
        collapseAnimation={ collapseAnimation }
      />,
    )

    /** item 组从 0 起播（写入起点），预览组零距离立即播完 */
    expect(drivenRows(container)).toHaveLength(3)
    const itemCalls = () => resizeItem.mock.calls.filter(([index]) => index === 1 || index === 2)
    expect(itemCalls()).toEqual([[1, 0], [2, 0]])

    rerender(
      <VirtualGroupList
        sections={ [...sections] }
        renderItem={ renderCard }
        expanded={ ['todo'] }
        collapseAnimation={ collapseAnimation }
      />,
    )

    /** 预览组播完引发的重渲染没有让 item 组重新写起点；item 组未播完，分组不能切回普通行 */
    expect(itemCalls()).toHaveLength(2)
    expect(drivenRows(container)).toHaveLength(3)
  })
})
