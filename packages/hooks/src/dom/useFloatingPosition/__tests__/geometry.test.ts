import { describe, expect, it } from 'vitest'
import {
  buildPlacement,
  calcCoords,
  calcOverflow,
  oppositeSide,
  parsePlacement,
} from '../geometry'

describe('浮动位置几何计算', () => {
  it('解析并构建定位方式', () => {
    expect(parsePlacement('bottom-end')).toEqual({
      side: 'bottom',
      align: 'end',
    })
    expect(parsePlacement('top')).toEqual({
      side: 'top',
      align: 'center',
    })
    expect(buildPlacement('left', 'start')).toBe('left-start')
    expect(buildPlacement('right', 'center')).toBe('right')
  })

  it('映射相对方向', () => {
    expect(oppositeSide('top')).toBe('bottom')
    expect(oppositeSide('bottom')).toBe('top')
    expect(oppositeSide('left')).toBe('right')
    expect(oppositeSide('right')).toBe('left')
  })

  it('计算各方向和对齐方式的坐标', () => {
    const reference = rect({ top: 100, left: 200, width: 80, height: 40 })
    const floating = rect({ top: 0, left: 0, width: 50, height: 20 })

    expect(calcCoords(reference, floating, 'bottom', 8)).toEqual({ x: 215, y: 148 })
    expect(calcCoords(reference, floating, 'top-start', 8)).toEqual({ x: 200, y: 72 })
    expect(calcCoords(reference, floating, 'right-end', 8)).toEqual({ x: 288, y: 120 })
    expect(calcCoords(reference, floating, 'left', 8)).toEqual({ x: 142, y: 110 })
  })

  it('结合边界内边距计算视口溢出', () => {
    const floating = rect({ top: 0, left: 0, width: 120, height: 80 })

    expect(calcOverflow(-10, 40, floating, 300, 200, 8)).toEqual({
      left: 18,
      right: 0,
      top: 0,
      bottom: 0,
      total: 18,
    })
    expect(calcOverflow(210, 150, floating, 300, 200, 8)).toEqual({
      left: 0,
      right: 38,
      top: 0,
      bottom: 38,
      total: 76,
    })
  })
})

function rect(input: Pick<DOMRect, 'top' | 'left' | 'width' | 'height'>) {
  return {
    ...input,
    right: input.left + input.width,
    bottom: input.top + input.height,
  }
}
