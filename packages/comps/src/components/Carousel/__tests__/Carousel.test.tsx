import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Carousel } from '../index'

describe('Carousel continuous track', () => {
  it('快速点击箭头只保留最近一次意图，停止后不会回放积压操作', async () => {
    const onSlideChange = vi.fn()
    render(<Carousel imgs={ ['one.png', 'two.png', 'three.png', 'four.png'] } transitionType="continuous" autoPlayInterval={ 0 } onSlideChange={ onSlideChange } />)
    const track = screen.getByRole('region').querySelector('.flex.h-full.w-full') as HTMLElement
    const next = screen.getByRole('button', { name: 'Next slide' })
    for (let index = 0; index < 8; index++) fireEvent.click(next)
    expect(onSlideChange).toHaveBeenCalledTimes(1)

    fireEvent(track, Object.assign(new Event('transitionend', { bubbles: true }), { propertyName: 'transform' }))
    await vi.waitFor(() => expect(onSlideChange).toHaveBeenCalledTimes(2))
    fireEvent(track, Object.assign(new Event('transitionend', { bubbles: true }), { propertyName: 'transform' }))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    expect(onSlideChange).toHaveBeenCalledTimes(2)
  })

  it('过渡动画中连续快速拖动不会丢失第二次翻页意图', async () => {
    const onSlideChange = vi.fn()
    render(<Carousel imgs={ ['one.png', 'two.png', 'three.png'] } transitionType="continuous" autoPlayInterval={ 0 } onSlideChange={ onSlideChange } />)
    const viewport = screen.getByRole('region').querySelector('.touch-pan-y') as HTMLElement
    const track = viewport.querySelector('.flex.h-full.w-full') as HTMLElement
    Object.defineProperty(viewport, 'clientWidth', { value: 400 })

    for (const id of [1, 2]) {
      firePointer(viewport, 'pointerdown', { pointerId: id, pointerType: 'mouse', button: 0, clientX: 300 })
      firePointer(viewport, 'pointermove', { pointerId: id, clientX: 100 })
      firePointer(viewport, 'pointerup', { pointerId: id, clientX: 100 })
    }
    expect(onSlideChange).toHaveBeenCalledTimes(1)
    fireEvent(track, Object.assign(new Event('transitionend', { bubbles: true }), { propertyName: 'transform' }))
    await vi.waitFor(() => expect(onSlideChange).toHaveBeenCalledTimes(2))
    expect(onSlideChange).toHaveBeenLastCalledWith(2)
  })

  it('连续模式保留相邻图，默认模式只渲染当前图；素材更新无需重新挂载', () => {
    const images = ['one.png', 'two.png', 'three.png']
    const { rerender } = render(<Carousel imgs={ images } transitionType="continuous" autoPlayInterval={ 0 } />)
    expect(screen.getByRole('region').querySelectorAll('img')).toHaveLength(5)
    const viewport = screen.getByRole('region').querySelector('.touch-pan-y')
    rerender(<Carousel imgs={ ['new-one.png', 'new-two.png', 'new-three.png'] } transitionType="continuous" autoPlayInterval={ 0 } />)
    expect(screen.getByRole('region').querySelector('.touch-pan-y')).toBe(viewport)
    expect(screen.getByRole('region').querySelectorAll('img')[1].getAttribute('src')).toBe('new-one.png')
    rerender(<Carousel imgs={ images } transitionType="slide" autoPlayInterval={ 0 } />)
    expect(screen.getByRole('region').querySelectorAll('img')).toHaveLength(1)
  })

  it('鼠标和触摸指针拖动轨道，松开后翻页；小幅拖动回弹', () => {
    const onSlideChange = vi.fn()
    render(<Carousel imgs={ ['one.png', 'two.png', 'three.png'] } transitionType="continuous" autoPlayInterval={ 0 } onSlideChange={ onSlideChange } />)
    const viewport = screen.getByRole('region').querySelector('.touch-pan-y') as HTMLElement
    const track = viewport.querySelector('.flex.h-full.w-full') as HTMLElement
    Object.defineProperty(viewport, 'clientWidth', { value: 400 })

    firePointer(viewport, 'pointerdown', { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 300 })
    expect(viewport.className).toContain('cursor-grabbing')
    expect(document.documentElement.style.cursor).toBe('grabbing')
    firePointer(viewport, 'pointermove', { pointerId: 1, clientX: 100 })
    expect(track.style.transform).toContain('-200px')
    firePointer(viewport, 'pointerup', { pointerId: 1, clientX: 100 })
    expect(onSlideChange).toHaveBeenCalledWith(1)
    expect(document.documentElement.style.cursor).not.toBe('grabbing')
    fireEvent(track, Object.assign(new Event('transitionend', { bubbles: true }), { propertyName: 'transform' }))

    // 修复回归：第一轮普通翻页结束后，还能继续触摸拖动
    firePointer(viewport, 'pointerdown', { pointerId: 2, pointerType: 'touch', clientX: 100 })
    firePointer(viewport, 'pointermove', { pointerId: 2, clientX: 110 })
    expect(track.style.transform).toContain('10px')
    firePointer(viewport, 'pointerup', { pointerId: 2, clientX: 110 })
    expect(onSlideChange).toHaveBeenCalledTimes(1)
  })

  it('圆点切换相邻的首尾图片也沿循环方向播放', async () => {
    render(<Carousel imgs={ ['one.png', 'two.png', 'three.png'] } transitionType="continuous" autoPlayInterval={ 0 } />)
    const track = screen.getByRole('region').querySelector('.flex.h-full.w-full') as HTMLElement
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }))
    fireEvent(track, Object.assign(new Event('transitionend', { bubbles: true }), { propertyName: 'transform' }))
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 1' }))
    expect(track.style.transform).toContain('-400%')
  })

  it('快速向前跨越首尾时，先无动画归位，再继续向前而非从克隆帧反向滑动', async () => {
    render(<Carousel imgs={ ['one.png', 'two.png', 'three.png'] } transitionType="continuous" autoPlayInterval={ 0 } />)
    const track = screen.getByRole('region').querySelector('.flex.h-full.w-full') as HTMLElement
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }))
    fireEvent(track, Object.assign(new Event('transitionend', { bubbles: true }), { propertyName: 'transform' }))
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(track.style.transform).toContain('-400%')
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    fireEvent(track, Object.assign(new Event('transitionend', { bubbles: true }), { propertyName: 'transform' }))
    expect(track.style.transform).toContain('-100%')
    expect(track.style.transition).toBe('none')
    await vi.waitFor(() => expect(track.style.transform).toContain('-200%'))
    expect(track.style.transition).toContain('0.4s')
  })

  it('切到末尾再向前时保留相邻的首图，并在过渡结束后无动画归位', async () => {
    render(<Carousel imgs={ ['one.png', 'two.png', 'three.png'] } transitionType="continuous" autoPlayInterval={ 0 } />)
    const region = screen.getByRole('region')
    const track = region.querySelector('.flex.h-full.w-full') as HTMLElement
    expect(track.querySelectorAll('img')).toHaveLength(5)
    expect(track.style.transform).toContain('-100%')

    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }))
    expect(track.style.transform).toContain('-0%')
    fireEvent(track, Object.assign(new Event('transitionend', { bubbles: true }), { propertyName: 'transform' }))
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(track.style.transform).toContain('-400%')
    fireEvent(track, Object.assign(new Event('transitionend', { bubbles: true }), { propertyName: 'transform' }))
    expect(track.style.transform).toContain('-100%')
    expect(track.style.transition).toBe('none')
  })
})

function firePointer(element: HTMLElement, type: string, data: Record<string, number | string>) {
  fireEvent(element, Object.assign(new Event(type, { bubbles: true }), data))
}

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
