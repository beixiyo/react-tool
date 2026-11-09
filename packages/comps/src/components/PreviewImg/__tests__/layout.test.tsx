// @vitest-environment jsdom

import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePreviewLayout } from '../hooks/usePreviewLayout'

describe('预览缩略图默认位置', () => {
  it('横向缩略图默认在顶部，纵向默认在右侧，显式位置优先', () => {
    const { result, rerender } = renderHook(
      ({ orientation, thumbnailPlacement }: { orientation: 'horizontal' | 'vertical'; thumbnailPlacement?: 'bottom' }) =>
        usePreviewLayout({
          orientation,
          thumbnailPlacement,
          showThumbnails: true,
          showNavArrows: true,
          imageCount: 2,
        }),
      { initialProps: { orientation: 'horizontal' as 'horizontal' | 'vertical', thumbnailPlacement: undefined as 'bottom' | undefined } },
    )

    expect(result.current.placement).toBe('top')
    rerender({ orientation: 'vertical', thumbnailPlacement: undefined })
    expect(result.current.placement).toBe('right')
    rerender({ orientation: 'horizontal', thumbnailPlacement: 'bottom' })
    expect(result.current.placement).toBe('bottom')
  })
})
