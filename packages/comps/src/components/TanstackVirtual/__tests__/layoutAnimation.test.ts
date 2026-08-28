import { describe, expect, it } from 'vitest'
import { clampPersistentProjectionToViewport, resolveLayoutExit, resolveLayoutInitial } from '../layoutAnimation'

describe('虚拟列表可见区域布局动画', () => {
  it('分组内容进入时不改变 item 自身尺寸', () => {
    const presence = {
      presentKeys: new Set<string | number>(),
      presentLayoutIds: new Set<string>(),
    }

    expect(resolveLayoutInitial(undefined, true)).toBe(false)
    expect(resolveLayoutExit({
      exit: undefined,
      layoutId: undefined,
      presence,
    })).toEqual({ opacity: 0 })
  })

  it('把从视口外进入的长距离投影压缩到视口边缘，并保留动画进度', () => {
    const scrollElement = createScrollElement()
    const projections = new Map()

    const initial = clampPersistentProjectionToViewport({
      generatedTransform: 'translate3d(0px, 1600px, 0px)',
      rowKey: 'next-header',
      targetStart: 400,
      rowSize: 40,
      scrollElement,
      projections,
    })
    const halfway = clampPersistentProjectionToViewport({
      generatedTransform: 'translate3d(0px, 800px, 0px)',
      rowKey: 'next-header',
      targetStart: 400,
      rowSize: 40,
      scrollElement,
      projections,
    })

    expect(initial).toBe('translate3d(0px, 120px, 0px)')
    expect(halfway).toBe('translate3d(0px, 60px, 0px)')
  })
})

function createScrollElement() {
  const content = { offsetTop: 0 } as HTMLElement

  return {
    scrollTop: 0,
    clientHeight: 560,
    firstElementChild: content,
  } as HTMLDivElement
}
