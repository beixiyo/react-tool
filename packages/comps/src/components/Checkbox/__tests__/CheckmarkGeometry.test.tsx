import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Checkbox } from '../Checkbox'
import { Checkmark } from '../subcomponents/Checkmark'

/** 读取实际渲染的打勾路径，排除圆圈与半选横线 */
function readCheckPath(container: HTMLElement): { d: string; points: number[] } {
  const d = container.querySelector('path')?.getAttribute('d') ?? ''
  return {
    d,
    points: [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0])),
  }
}

describe('Checkmark 设计稿几何契约', () => {
  it('独立 Checkmark 默认仅显示设计稿打勾，按需开启外圈', () => {
    const { container, rerender } = render(<Checkmark />)
    expect(readCheckPath(container).d).toBe('M4.72 13.72 L9.83 18.83 L19.72 5.15')
    expect(container.querySelector('path')?.getAttribute('stroke-width')).toBe('1.92')
    expect(container.querySelector('circle')).toBeNull()

    rerender(<Checkmark showCircle />)
    expect(container.querySelector('circle')).not.toBeNull()
  })

  it('显示外圈时让不同线宽的圆头与圆圈内缘保持间隙，无圈时仍是设计稿原始尺寸', () => {
    const { container, rerender } = render(<Checkmark showCircle strokeWidth={ 2 } />)
    for (const width of [2, 4]) {
      rerender(<Checkmark showCircle strokeWidth={ width } />)
      const points = readCheckPath(container).points
      for (let index = 0; index < points.length; index += 2) {
        const radius = Math.hypot(points[index] - 12, points[index + 1] - 12)
        expect(radius + width / 2).toBeLessThan(10 - width / 2)
      }
      expect(container.querySelector('circle')?.getAttribute('r')).toBe('10')
      expect(container.querySelector('path')?.getAttribute('stroke-width')).toBe(String(width))
    }

    rerender(<Checkmark strokeWidth={ 4 } />)
    expect(readCheckPath(container).d).toBe('M4.72 13.72 L9.83 18.83 L19.72 5.15')
  })

  it('Checkbox 默认保持原有紧凑打勾及线宽，仅显式设置角度时切换到设计稿几何', () => {
    const { container, rerender } = render(<Checkbox checked />)
    expect(readCheckPath(container).d).toBe('M7.61 11.88 10.95 16.34 16.4 7.6')
    expect(container.querySelector('path')?.getAttribute('stroke-width')).toBe('2')

    rerender(<Checkbox checked checkVertexAngle={ 81 } />)
    expect(readCheckPath(container).d).toBe('M4.72 13.72 L9.83 18.83 L19.72 5.15')
  })

  it('调成 90° 时只旋转短笔，顶点及长笔保持不动且两笔近似垂直', () => {
    const { container, rerender } = render(<Checkbox checked checkVertexAngle={ 81 } />)
    const original = readCheckPath(container).points
    rerender(<Checkbox checked checkVertexAngle={ 90 } />)
    const rotated = readCheckPath(container).points

    expect(rotated.slice(2)).toEqual(original.slice(2))
    const short = [rotated[0] - rotated[2], rotated[1] - rotated[3]]
    const long = [rotated[4] - rotated[2], rotated[5] - rotated[3]]
    expect(Math.hypot(...short)).toBeCloseTo(Math.hypot(original[0] - original[2], original[1] - original[3]), 2)
    // 设计稿坐标和 81° 均已舍入；点积允许小于 0.2° 的舍入偏差
    const cosine = (short[0] * long[0] + short[1] * long[1]) / (Math.hypot(...short) * Math.hypot(...long))
    expect(Math.abs(cosine)).toBeLessThan(0.0035)
  })
})
