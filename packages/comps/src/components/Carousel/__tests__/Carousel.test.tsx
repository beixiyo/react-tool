import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Carousel } from '../index'

describe('Carousel keyboard lifecycle', () => {
  it('方向键只响应当前获得焦点的轮播容器', () => {
    const onFirstSlideChange = vi.fn()
    const onSecondSlideChange = vi.fn()
    render(
      <>
        <Carousel
          imgs={ ['one.png', 'two.png'] }
          autoPlayInterval={ 0 }
          onSlideChange={ onFirstSlideChange }
        />
        <Carousel
          imgs={ ['three.png', 'four.png'] }
          autoPlayInterval={ 0 }
          onSlideChange={ onSecondSlideChange }
        />
      </>,
    )

    const secondCarousel = screen.getAllByRole('region')[1]
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onFirstSlideChange).not.toHaveBeenCalled()
    expect(onSecondSlideChange).not.toHaveBeenCalled()

    secondCarousel.focus()
    fireEvent.keyDown(secondCarousel, { key: 'ArrowRight' })
    expect(onFirstSlideChange).not.toHaveBeenCalled()
    expect(onSecondSlideChange).toHaveBeenCalledWith(1)
  })

  it('显式 global 时响应 window，并在禁用后注销监听', () => {
    const onSlideChange = vi.fn()
    const { rerender } = render(
      <>
        <input aria-label="Editor" />
        <Carousel
          imgs={ ['one.png', 'two.png'] }
          autoPlayInterval={ 0 }
          keyboardScope="global"
          onSlideChange={ onSlideChange }
        />
      </>,
    )

    const input = screen.getByRole('textbox', { name: 'Editor' })
    input.focus()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onSlideChange).not.toHaveBeenCalled()

    input.blur()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onSlideChange).toHaveBeenCalledWith(1)

    onSlideChange.mockClear()
    rerender(
      <Carousel
        imgs={ ['one.png', 'two.png'] }
        autoPlayInterval={ 0 }
        enableKeyboardNav={ false }
        keyboardScope="global"
        onSlideChange={ onSlideChange }
      />,
    )
    const disabledCarousel = screen.getByRole('region')
    expect(disabledCarousel.getAttribute('tabindex')).toBeNull()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onSlideChange).not.toHaveBeenCalled()
  })
})
