/** @vitest-environment jsdom */
import { act, fireEvent, render } from '@testing-library/react'
import { createRef } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Audio } from '../Audio'
import type { AudioRef } from '../types'

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
})

describe('Audio 加载状态', () => {
  it('实际加载开始后通知，元数据就绪时结束并透传原生事件', () => {
    const ref = createRef<AudioRef>()
    const onLoadingChange = vi.fn()
    const onLoadedMetadata = vi.fn()
    const { container } = render(<Audio ref={ ref } src="/first.wav" onLoadingChange={ onLoadingChange } onLoadedMetadata={ onLoadedMetadata } />)
    const audio = container.querySelector('audio')!
    expect(onLoadingChange).not.toHaveBeenCalled()
    fireEvent.loadStart(audio)
    fireEvent.loadStart(audio)
    expect(ref.current!.getState().loading).toBe(true)
    fireEvent.loadedMetadata(audio)
    expect(ref.current!.getState().loading).toBe(false)
    expect(onLoadingChange.mock.calls).toEqual([[true], [false]])
    expect(onLoadedMetadata.mock.calls[0][0].type).toBe('loadedmetadata')
    fireEvent.waiting(audio)
    expect(ref.current!.getState().loading).toBe(false)
  })

  it('错误、取消和清空结束加载，换源及重新加载可再次开始', () => {
    const ref = createRef<AudioRef>()
    const onLoadingChange = vi.fn()
    const { container, rerender } = render(<Audio ref={ ref } src="/first.wav" onLoadingChange={ onLoadingChange } />)
    const audio = container.querySelector('audio')!
    fireEvent.loadStart(audio)
    fireEvent.error(audio)
    rerender(<Audio ref={ ref } src="/second.wav" onLoadingChange={ onLoadingChange } />)
    fireEvent.loadStart(audio)
    fireEvent.abort(audio)
    act(() => ref.current!.reload())
    fireEvent.loadStart(audio)
    fireEvent.emptied(audio)
    expect(onLoadingChange.mock.calls).toEqual([[true], [false], [true], [false], [true], [false]])
  })

  it('换源后使用最新回调，重复事件不重复通知且透传 canplay', () => {
    const first = vi.fn()
    const latest = vi.fn()
    const onCanPlay = vi.fn()
    const { container, rerender } = render(<Audio src="/first.wav" onLoadingChange={ first } />)
    const audio = container.querySelector('audio')!
    fireEvent.loadStart(audio)
    fireEvent.loadedData(audio)
    rerender(<Audio src="/second.wav" onLoadingChange={ latest } onCanPlay={ onCanPlay } />)
    fireEvent.loadStart(audio)
    fireEvent.loadedMetadata(audio)
    fireEvent.canPlay(audio)
    expect(first.mock.calls).toEqual([[true], [false]])
    expect(latest.mock.calls).toEqual([[true], [false]])
    expect(onCanPlay.mock.calls[0][0].type).toBe('canplay')
  })

  it('none 预加载及无音源不主动进入加载状态', () => {
    const onLoadingChange = vi.fn()
    const { rerender } = render(<Audio preload="none" src="/first.wav" onLoadingChange={ onLoadingChange } />)
    rerender(<Audio preload="none" onLoadingChange={ onLoadingChange } />)
    expect(onLoadingChange).not.toHaveBeenCalled()
  })
})
