import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TanstackVirtualList } from '../TanstackVirtualList'
import { VirtualGroupList } from '../VirtualGroupList'

const { measureElement, useVirtualizer } = vi.hoisted(() => ({
  measureElement: vi.fn(),
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
      measureElement,
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

  it('动画模式用外层分组容器统一裁切，item 保持原尺寸', () => {
    const item = { id: 1 }
    const getItemLayoutId = vi.fn(({ id }: typeof item) => `todo-${id}`)
    const { container } = render(
      <VirtualGroupList
        sections={ [{ key: 'todo', header: <h2>Todo</h2>, items: [item] }] }
        renderItem={ (current) => <span>{ current.id }</span> }
        layoutAnimation={ { getItemLayoutId } }
      />,
    )

    const rows = container.querySelectorAll<HTMLElement>('[data-index]')
    const group = container.querySelector<HTMLElement>('[data-vv-virtual-animation-group="header-todo"]')
    expect(rows).toHaveLength(2)
    expect(rows[0].style.top).toBe('24px')
    expect(rows[0].style.transform).toBe('')
    expect(group?.style.top).toBe('104px')
    expect(rows[1].parentElement?.parentElement).toBe(group)
    expect(rows[1].style.top).toBe('0px')
    expect(rows[1].style.transform).toBe('')
    expect(rows[1].style.clipPath).toBe('')
    expect(getItemLayoutId).toHaveBeenCalledOnce()
    expect(getItemLayoutId).toHaveBeenCalledWith(
      item,
      expect.objectContaining({
        indexInSection: 0,
        isFirst: true,
        isLast: true,
      }),
    )
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

  it('动画模式让离屏分组头常驻，同时继续虚拟化普通 item', () => {
    render(
      <VirtualGroupList
        sections={ [
          { key: 'first', header: <h2>First</h2>, items: [{ id: 1 }, { id: 2 }] },
          { key: 'second', header: <h2>Second</h2>, items: [{ id: 3 }] },
        ] }
        renderItem={ (item) => <span>{ item.id }</span> }
        layoutAnimation={ {} }
      />,
    )

    const options = useVirtualizer.mock.calls.at(-1)?.[0] as {
      rangeExtractor: (range: {
        startIndex: number
        endIndex: number
        overscan: number
        count: number
      }) => number[]
    }

    expect(options.rangeExtractor({
      startIndex: 1,
      endIndex: 1,
      overscan: 0,
      count: 5,
    })).toEqual([0, 1, 3])
  })

  it('离屏常驻行不污染可视范围或误触发加载更多', () => {
    const onVisibleRangeChange = vi.fn()
    const loadMore = vi.fn().mockResolvedValue(undefined)
    render(
      <TanstackVirtualList
        data={ Array.from({ length: 10 }, (_, id) => ({ id })) }
        getItemKey={ (item) => item.id }
        layoutAnimation={ {
          shouldKeepMounted: (_, index) => index === 0 || index === 9,
        } }
        overscan={ 0 }
        hasMore
        loadMore={ loadMore }
        onVisibleRangeChange={ onVisibleRangeChange }
      >
        { (item) => <span>{ item.id }</span> }
      </TanstackVirtualList>,
    )

    const options = useVirtualizer.mock.calls.at(-1)?.[0] as {
      onChange: (instance: unknown) => void
    }
    act(() => {
      options.onChange({
        range: { startIndex: 4, endIndex: 4 },
        options: { overscan: 0 },
        getVirtualItems: () => [{ index: 0 }, { index: 4 }, { index: 9 }],
      })
    })

    expect(onVisibleRangeChange).toHaveBeenCalledWith(4, 4)
    expect(loadMore).not.toHaveBeenCalled()
  })
})
