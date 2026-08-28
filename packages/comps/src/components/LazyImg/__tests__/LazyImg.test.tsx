import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { PreviewImgProps } from '../../PreviewImg/types'
import { LazyImg } from '../index'
import { loadedImageCache } from '../loadedImageCache'
import type { LazyImgResolveContext, LazyImgResolvedSource } from '../types'

class ControllableIntersectionObserver implements IntersectionObserver {
  static instance: ControllableIntersectionObserver | undefined

  readonly root = null
  readonly rootMargin = '20px'
  readonly scrollMargin = ''
  readonly thresholds = [0.01]
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    ControllableIntersectionObserver.instance = this
  }
  disconnect() {}

  observe() {}

  takeRecords() {
    return []
  }

  unobserve() {}

  intersect(target: Element) {
    this.callback([
      {
        target,
        isIntersecting: true,
      } as IntersectionObserverEntry,
    ], this)
  }
}

const OriginalIntersectionObserver = globalThis.IntersectionObserver

beforeAll(() => {
  globalThis.IntersectionObserver = ControllableIntersectionObserver
})

afterAll(() => {
  globalThis.IntersectionObserver = OriginalIntersectionObserver
})

afterEach(() => {
  loadedImageCache.clear()
})

describe('LazyImg 加载生命周期', () => {
  it('浏览器不支持 IntersectionObserver 时退化为立即加载', () => {
    const Observer = globalThis.IntersectionObserver
    globalThis.IntersectionObserver = undefined as unknown as typeof IntersectionObserver

    try {
      render(<LazyImg src="/fallback-lazy.png" alt="兼容图片" />)
      const image = screen.getByAltText('兼容图片') as HTMLImageElement
      expect(image.src).toBe(new URL('/fallback-lazy.png', window.location.href).href)
    }
    finally {
      globalThis.IntersectionObserver = Observer
    }
  })

  it('进入预加载范围前不下发图片地址，进入后才开始请求', () => {
    render(<LazyImg src="/lazy.png" alt="懒加载图片" loadingText="正在加载" />)

    const image = screen.getByAltText('懒加载图片') as HTMLImageElement
    expect(image.hasAttribute('src')).toBe(false)

    act(() => {
      ControllableIntersectionObserver.instance?.intersect(image)
    })

    expect(image.src).toBe(new URL('/lazy.png', window.location.href).href)
  })

  it('响应式图片进入预加载范围前不会通过 srcSet 提前请求', () => {
    render(
      <LazyImg
        src="/fallback.png"
        srcSet="/small.png 1x, /large.png 2x"
        sizes="100vw"
        alt="响应式图片"
      />,
    )

    const image = screen.getByAltText('响应式图片') as HTMLImageElement
    expect(image.hasAttribute('src')).toBe(false)
    expect(image.hasAttribute('srcset')).toBe(false)
    expect(image.hasAttribute('sizes')).toBe(false)

    act(() => {
      ControllableIntersectionObserver.instance?.intersect(image)
    })

    expect(image.getAttribute('src')).toBe('/fallback.png')
    expect(image.getAttribute('srcset')).toBe('/small.png 1x, /large.png 2x')
    expect(image.getAttribute('sizes')).toBe('100vw')
  })

  it('进入预加载范围后才解析资源，并只使用解析器返回的完整图片源', async () => {
    const resolveSource = vi.fn(() => ({ src: '/resolved.png' }))
    render(
      <LazyImg
        sourceKey="stable-image"
        src="/signed.png"
        srcSet="/signed-small.png 1x, /signed-large.png 2x"
        sizes="100vw"
        resolveSource={ resolveSource }
        alt="异步解析图片"
      />,
    )

    const image = screen.getByAltText('异步解析图片') as HTMLImageElement
    expect(resolveSource).not.toHaveBeenCalled()
    expect(image.hasAttribute('src')).toBe(false)

    act(() => {
      ControllableIntersectionObserver.instance?.intersect(image)
    })

    await waitFor(() => expect(resolveSource).toHaveBeenCalledOnce())
    expect(image.getAttribute('src')).toBe('/resolved.png')
    expect(image.hasAttribute('srcset')).toBe(false)
    expect(image.hasAttribute('sizes')).toBe(false)
  })

  it('相同 sourceKey 下签名地址变化不重新解析、不重置或 remount 图片', async () => {
    const resolveSource = vi.fn(() => ({ src: '/cached-object-url' }))
    const { rerender } = render(
      <LazyImg
        lazy={ false }
        sourceKey="canonical-url"
        src="/image.png?signature=first"
        resolveSource={ resolveSource }
        alt="稳定身份图片"
      />,
    )

    const firstImage = screen.getByAltText('稳定身份图片') as HTMLImageElement
    await waitFor(() => expect(firstImage.getAttribute('src')).toBe('/cached-object-url'))
    fireEvent.load(firstImage)

    rerender(
      <LazyImg
        lazy={ false }
        sourceKey="canonical-url"
        src="/image.png?signature=second"
        resolveSource={ resolveSource }
        alt="稳定身份图片"
      />,
    )
    const currentImage = screen.getByAltText('稳定身份图片') as HTMLImageElement

    expect(currentImage).toBe(firstImage)
    expect(currentImage.getAttribute('src')).toBe('/cached-object-url')
    expect(resolveSource).toHaveBeenCalledOnce()
  })

  it('重新挂载时同步复用已加载的驻留资源，不重新显示 loading', () => {
    const firstDispose = vi.fn()
    const firstView = render(
      <LazyImg
        lazy={ false }
        sourceKey="resident-image"
        src="/signed.png?first"
        resolveSource={ () => ({ src: '/resident-object-url', dispose: firstDispose }) }
        loading={ <span>图片加载中</span> }
        alt="驻留缓存图片"
      />,
    )
    const firstImage = screen.getByAltText('驻留缓存图片') as HTMLImageElement
    fireEvent.load(firstImage)
    firstView.unmount()

    const secondDispose = vi.fn()
    const secondView = render(
      <LazyImg
        lazy={ false }
        sourceKey="resident-image"
        src="/signed.png?second"
        resolveSource={ () => ({
          src: '/resident-object-url',
          dispose: secondDispose,
          reuseLoadedState: true,
        }) }
        loading={ <span>图片加载中</span> }
        alt="驻留缓存图片"
      />,
    )

    const remountedImage = screen.getByAltText('驻留缓存图片') as HTMLImageElement
    expect(remountedImage.getAttribute('src')).toBe('/resident-object-url')
    expect(screen.queryByText('图片加载中')).toBeNull()
    expect(firstDispose).toHaveBeenCalledOnce()

    secondView.unmount()
    expect(secondDispose).toHaveBeenCalledOnce()
  })

  it('更换 sourceKey 时 abort 并 dispose 旧结果，卸载时释放当前结果', async () => {
    const firstDispose = vi.fn()
    const secondDispose = vi.fn()
    const contexts = new Map<string, LazyImgResolveContext>()
    const resolveSource = vi.fn((context: LazyImgResolveContext) => {
      contexts.set(context.sourceKey, context)
      return context.sourceKey === 'first-key'
        ? { src: '/first-object-url', dispose: firstDispose }
        : { src: '/second-object-url', dispose: secondDispose }
    })
    const view = render(
      <LazyImg
        lazy={ false }
        sourceKey="first-key"
        src="/first-signed.png"
        resolveSource={ resolveSource }
        alt="可释放图片"
      />,
    )

    await waitFor(() => expect(screen.getByAltText('可释放图片').getAttribute('src')).toBe('/first-object-url'))
    view.rerender(
      <LazyImg
        lazy={ false }
        sourceKey="second-key"
        src="/second-signed.png"
        resolveSource={ resolveSource }
        alt="可释放图片"
      />,
    )

    expect(contexts.get('first-key')?.signal.aborted).toBe(true)
    expect(firstDispose).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.getByAltText('可释放图片').getAttribute('src')).toBe('/second-object-url'))

    view.unmount()
    expect(contexts.get('second-key')?.signal.aborted).toBe(true)
    expect(firstDispose).toHaveBeenCalledOnce()
    expect(secondDispose).toHaveBeenCalledOnce()
  })

  it('过期 Promise 晚到时立即 dispose，且不能覆盖新图片', async () => {
    const oldResult = createDeferred<LazyImgResolvedSource>()
    const oldDispose = vi.fn()
    const newDispose = vi.fn()
    const onResolveError = vi.fn()
    let oldSignal: AbortSignal | undefined
    const resolveSource = vi.fn((context: LazyImgResolveContext) => {
      if (context.sourceKey === 'old-key') {
        oldSignal = context.signal
        return oldResult.promise
      }
      return { src: '/new-object-url', dispose: newDispose }
    })
    const view = render(
      <LazyImg
        lazy={ false }
        sourceKey="old-key"
        src="/old-signed.png"
        resolveSource={ resolveSource }
        onResolveError={ onResolveError }
        alt="竞态解析图片"
      />,
    )
    await waitFor(() => expect(resolveSource).toHaveBeenCalledOnce())

    view.rerender(
      <LazyImg
        lazy={ false }
        sourceKey="new-key"
        src="/new-signed.png"
        resolveSource={ resolveSource }
        onResolveError={ onResolveError }
        alt="竞态解析图片"
      />,
    )
    await waitFor(() => expect(screen.getByAltText('竞态解析图片').getAttribute('src')).toBe('/new-object-url'))
    expect(oldSignal?.aborted).toBe(true)

    await act(async () => {
      oldResult.resolve({ src: '/late-old-object-url', dispose: oldDispose })
      await oldResult.promise
    })

    expect(screen.getByAltText('竞态解析图片').getAttribute('src')).toBe('/new-object-url')
    expect(oldDispose).toHaveBeenCalledOnce()
    expect(onResolveError).not.toHaveBeenCalled()

    view.unmount()
    expect(oldDispose).toHaveBeenCalledOnce()
    expect(newDispose).toHaveBeenCalledOnce()
  })

  it('卸载时 dispose 当前解析结果恰好一次', async () => {
    const dispose = vi.fn()
    const view = render(
      <LazyImg
        lazy={ false }
        sourceKey="object-url-key"
        src="/signed.png"
        resolveSource={ () => ({ src: '/object-url', dispose }) }
        alt="卸载图片"
      />,
    )
    await waitFor(() => expect(screen.getByAltText('卸载图片').getAttribute('src')).toBe('/object-url'))

    view.unmount()
    view.unmount()

    expect(dispose).toHaveBeenCalledOnce()
  })

  it('dispose 抛错时透传 onDisposeError，且不阻断新资源加载', async () => {
    const disposeError = new Error('release object URL failed')
    const onDisposeError = vi.fn()
    const resolveSource = vi.fn((context: LazyImgResolveContext) => ({
      src: `/${context.sourceKey}.png`,
      dispose: context.sourceKey === 'first-key'
        ? () => {
          throw disposeError
        }
        : undefined,
    }))
    const view = render(
      <LazyImg
        lazy={ false }
        sourceKey="first-key"
        src="/first-signed.png"
        resolveSource={ resolveSource }
        onDisposeError={ onDisposeError }
        alt="释放异常图片"
      />,
    )

    await waitFor(() => expect(screen.getByAltText('释放异常图片').getAttribute('src')).toBe('/first-key.png'))
    view.rerender(
      <LazyImg
        lazy={ false }
        sourceKey="second-key"
        src="/second-signed.png"
        resolveSource={ resolveSource }
        onDisposeError={ onDisposeError }
        alt="释放异常图片"
      />,
    )

    expect(onDisposeError).toHaveBeenCalledOnce()
    expect(onDisposeError).toHaveBeenCalledWith(disposeError)
    await waitFor(() => expect(screen.getByAltText('释放异常图片').getAttribute('src')).toBe('/second-key.png'))
  })

  it('当前资源解析失败时进入错误态并透传 onResolveError', async () => {
    const resolveError = new Error('cache unavailable')
    const onResolveError = vi.fn()
    render(
      <LazyImg
        lazy={ false }
        sourceKey="resolve-error-key"
        src="/signed.png"
        resolveSource={ () => Promise.reject(resolveError) }
        onResolveError={ onResolveError }
        errorText="解析失败"
        alt="解析失败图片"
      />,
    )

    await waitFor(() => expect(onResolveError).toHaveBeenCalledWith(resolveError))
    expect(screen.getByText('解析失败')).not.toBeNull()
    expect(screen.getByAltText('解析失败图片').hasAttribute('src')).toBe(false)
  })

  it('renderPreview 只在图片加载成功且用户点击后调用', () => {
    const renderPreview = vi.fn((props: PreviewImgProps) => <button type="button" onClick={ props.onClose }>关闭自定义预览</button>)
    render(
      <LazyImg
        lazy={ false }
        src="/preview.png"
        alt="可预览图片"
        renderPreview={ renderPreview }
      />,
    )
    const image = screen.getByAltText('可预览图片')

    fireEvent.click(image)
    expect(renderPreview).not.toHaveBeenCalled()

    fireEvent.load(image)
    expect(renderPreview).not.toHaveBeenCalled()

    fireEvent.click(image)
    expect(renderPreview).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: '关闭自定义预览' })).not.toBeNull()
  })

  it('加载失败后换成有效地址，成功时恢复图片并移除错误占位', () => {
    const { rerender } = render(
      <LazyImg lazy={ false } src="/broken.png" alt="动态图片" errorText="加载失败" />,
    )
    const failedImage = screen.getByAltText('动态图片') as HTMLImageElement

    fireEvent.error(failedImage)
    expect(screen.getByText('加载失败')).not.toBeNull()

    rerender(<LazyImg lazy={ false } src="/valid.png" alt="动态图片" errorText="加载失败" />)
    const validImage = screen.getByAltText('动态图片') as HTMLImageElement
    fireEvent.load(validImage)

    expect(validImage.style.display).not.toBe('none')
    expect(screen.queryByText('加载失败')).toBeNull()
  })

  it('同一相对地址再次挂载时命中组件缓存，不再等待视口观察', () => {
    const first = render(<LazyImg lazy={ false } src="images/cached.png" alt="首次图片" />)
    fireEvent.load(screen.getByAltText('首次图片'))
    first.unmount()

    render(<LazyImg src="images/cached.png" alt="缓存图片" loadingText="正在加载" />)
    const cachedImage = screen.getByAltText('缓存图片') as HTMLImageElement

    expect(cachedImage.src).toBe(new URL('images/cached.png', window.location.href).href)
    expect(screen.queryByText('正在加载')).toBeNull()
  })

  it('地址切换后忽略旧图片元素迟到的失败事件', () => {
    const onError = vi.fn()
    const { rerender } = render(
      <LazyImg lazy={ false } src="/old.png" alt="竞态图片" errorText="加载失败" onError={ onError } />,
    )
    const oldImage = screen.getByAltText('竞态图片')

    rerender(
      <LazyImg lazy={ false } src="/new.png" alt="竞态图片" errorText="加载失败" onError={ onError } />,
    )
    fireEvent.error(oldImage)

    expect(onError).not.toHaveBeenCalled()
    expect(screen.queryByText('加载失败')).toBeNull()
  })

  it('自定义错误图片也失败时回退到内置图标', () => {
    const { container } = render(
      <LazyImg
        lazy={ false }
        src="/broken.png"
        errorSrc="/broken-fallback.png"
        alt="错误图片"
        errorText="加载失败"
      />,
    )

    fireEvent.error(screen.getByAltText('错误图片'))
    const customErrorImage = container.querySelector('img[alt=""]')
    expect(customErrorImage).not.toBeNull()

    fireEvent.error(customErrorImage!)
    expect(container.querySelector('svg')).not.toBeNull()
    expect(screen.getByText('加载失败')).not.toBeNull()
  })
})

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}
