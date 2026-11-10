/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Audio } from '../Audio'
import AudioTest from '../Test'
import type { AudioRef } from '../types'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Audio 原生事件与控制', () => {
  it('挂载前元数据已就绪时，同步状态快照和演示页时长', () => {
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
    vi.spyOn(HTMLMediaElement.prototype, 'readyState', 'get').mockReturnValue(1)
    vi.spyOn(HTMLMediaElement.prototype, 'duration', 'get').mockReturnValue(372)
    const ref = createRef<AudioRef>()
    render(<Audio ref={ ref } src="/cached.wav" />)
    expect(ref.current!.getState().duration).toBe(372)
    render(<AudioTest />)
    expect(screen.getByText('06:12')).toBeTruthy()
  })

  it('原生事件保留元素和事件对象，命令不会伪造重复事件', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)

    const ref = createRef<AudioRef>()
    const onPlay = vi.fn()
    const onMetadata = vi.fn((event: React.SyntheticEvent<HTMLAudioElement>) => event.currentTarget.duration)
    const { container, unmount } = render(<Audio ref={ ref } onPlay={ onPlay } onLoadedMetadata={ onMetadata } />)
    const audio = container.querySelector('audio')!

    expect(ref.current!.element).toBe(audio)
    Object.defineProperty(audio, 'duration', { configurable: true, value: 42 })
    fireEvent.loadedMetadata(audio)

    expect(onMetadata).toHaveReturnedWith(42)
    await act(async () => ref.current!.play())

    expect(onPlay).not.toHaveBeenCalled()
    fireEvent.play(audio)

    expect(onPlay).toHaveBeenCalledOnce()
    expect(onPlay.mock.calls[0][0].type).toBe('play')
    expect(ref.current!.getState().playing).toBe(true)
    unmount()
    expect(ref.current).toBeNull()
  })

  it('播放拒绝向调用方传播，不触发成功观察', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
    const error = new Error('Playback blocked')
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(error)

    const ref = createRef<AudioRef>()
    const onStarted = vi.fn()

    render(<Audio ref={ ref } />)
    await expect(ref.current!.play({ onStarted })).rejects.toBe(error)
    expect(onStarted).not.toHaveBeenCalled()
  })
})
