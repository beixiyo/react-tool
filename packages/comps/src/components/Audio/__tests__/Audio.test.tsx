/** @vitest-environment jsdom */

import { act, fireEvent, render } from '@testing-library/react'
import { createRef, StrictMode, useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Audio } from '../Audio'
import type { AudioProps, AudioRef } from '../types'

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  // jsdom 不实现媒体加载；模拟规范中的倍速恢复，真实加载另由浏览器验证
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(function(this: HTMLMediaElement) {
    this.playbackRate = this.defaultPlaybackRate
    this.dispatchEvent(new Event('ratechange'))
  })
})

function setup(props: AudioProps = {}) {
  const ref = createRef<AudioRef>()
  const view = render(<Audio ref={ ref } src="/first.wav" { ...props } />)
  const audio = view.container.querySelector('audio')!
  return { ...view, ref, audio }
}

function changeNativeRate(audio: HTMLAudioElement, rate: number) {
  act(() => {
    audio.playbackRate = rate
    fireEvent.rateChange(audio)
  })
}

describe('Audio 倍速', () => {
  it('显式开启后，重新加载与换源均保留倍速且不重复通知', () => {
    const onRateChange = vi.fn()
    const { audio, ref, rerender, container } = setup({ preservePlaybackRateOnSourceChange: true, onRateChange })

    act(() => ref.current!.setPlaybackRate(2))
    fireEvent.rateChange(audio)
    act(() => ref.current!.reload())
    fireEvent.loadedMetadata(audio)
    expect(audio.playbackRate).toBe(2)

    rerender(<Audio ref={ ref } src="/second.wav" preservePlaybackRateOnSourceChange onRateChange={ onRateChange } />)
    act(() => audio.load())
    fireEvent.loadedMetadata(audio)

    expect(container.querySelector('audio')).toBe(audio)
    expect(audio.playbackRate).toBe(2)
    expect(ref.current!.getState().playbackRate).toBe(2)
    expect(onRateChange).toHaveBeenCalled()
    expect(onRateChange.mock.lastCall?.[0].type).toBe('ratechange')
  })

  it('默认不保留，换源和 reload 恢复初始倍速；defaultPlaybackRate 只在挂载时读取', () => {
    const { audio, ref, rerender } = setup({ defaultPlaybackRate: 1.25 })
    expect(audio.playbackRate).toBe(1.25)
    act(() => ref.current!.setPlaybackRate(2))
    rerender(<Audio ref={ ref } src="/second.wav" defaultPlaybackRate={ 1.75 } />)
    act(() => audio.load())
    fireEvent.loadedMetadata(audio)
    expect(audio.playbackRate).toBe(1.25)

    act(() => ref.current!.setPlaybackRate(3))
    act(() => ref.current!.reload())
    fireEvent.loadedMetadata(audio)
    expect(audio.playbackRate).toBe(1.25)
    expect(ref.current!.getState().playbackRate).toBe(1.25)
  })

  it('外部临时倍速只同步实际状态，不抢回或污染换源目标', () => {
    const onRateChange = vi.fn()
    const { audio, ref, rerender } = setup({ preservePlaybackRateOnSourceChange: true, onRateChange })
    act(() => ref.current!.setPlaybackRate(2))
    onRateChange.mockClear()

    changeNativeRate(audio, 1.75)
    fireEvent.rateChange(audio)
    expect(audio.playbackRate).toBe(1.75)
    expect(ref.current!.getState().playbackRate).toBe(1.75)
    expect(audio.defaultPlaybackRate).toBe(2)
    expect(onRateChange).toHaveBeenCalled()
    expect(onRateChange.mock.lastCall?.[0].type).toBe('ratechange')

    rerender(<Audio ref={ ref } src="/second.wav" preservePlaybackRateOnSourceChange onRateChange={ onRateChange } />)
    act(() => audio.load())
    fireEvent.loadedMetadata(audio)
    expect(audio.playbackRate).toBe(2)
    expect(ref.current!.getState().playbackRate).toBe(2)
  })

  it('受控 ref 只请求变更，父组件未接受时不更改实际值', () => {
    const onPlaybackRateChange = vi.fn()
    const onRateChange = vi.fn()
    const { audio, ref, rerender } = setup({ playbackRate: 1.5, onPlaybackRateChange, onRateChange })
    onRateChange.mockClear()

    act(() => ref.current!.setPlaybackRate(2))
    expect(onPlaybackRateChange).toHaveBeenCalledExactlyOnceWith(2)
    expect(audio.playbackRate).toBe(1.5)
    expect(ref.current!.getState().playbackRate).toBe(1.5)
    expect(onRateChange).not.toHaveBeenCalled()

    rerender(<Audio ref={ ref } src="/first.wav" playbackRate={ 2 } onPlaybackRateChange={ onPlaybackRateChange } onRateChange={ onRateChange } />)
    fireEvent.rateChange(audio)
    expect(audio.playbackRate).toBe(2)
    expect(ref.current!.getState().playbackRate).toBe(2)
    expect(onRateChange).toHaveBeenCalled()
    expect(onRateChange.mock.lastCall?.[0].type).toBe('ratechange')
    expect(onPlaybackRateChange).toHaveBeenCalledOnce()
  })

  it('父组件可接受受控请求，StrictMode 下同步实际倍速', () => {
    const ref = createRef<AudioRef>()
    const onRateChange = vi.fn()
    function ControlledAudio() {
      const [rate, setRate] = useState(1)
      return <Audio ref={ ref } playbackRate={ rate } onPlaybackRateChange={ setRate } onRateChange={ onRateChange } />
    }
    const { container } = render(
      <StrictMode>
        <ControlledAudio />
      </StrictMode>,
    )
    act(() => ref.current!.setPlaybackRate(2))
    fireEvent.rateChange(container.querySelector('audio')!)
    expect(container.querySelector('audio')!.playbackRate).toBe(2)
    expect(onRateChange).toHaveBeenCalled()
    expect(onRateChange.mock.lastCall?.[0].type).toBe('ratechange')
  })

  it('受控模式对外部写入只观察，prop 更新或加载时才恢复目标', () => {
    const onRateChange = vi.fn()
    const onPlaybackRateChange = vi.fn()
    const { audio, ref, rerender } = setup({ playbackRate: 2, onRateChange, onPlaybackRateChange })
    onRateChange.mockClear()

    changeNativeRate(audio, 1.5)
    // 相同受控值的普通重渲染不能发起抢回
    rerender(
      <Audio ref={ ref } src="/first.wav" playbackRate={ 2 } onRateChange={ onRateChange } onPlaybackRateChange={ onPlaybackRateChange } className="test" />,
    )
    expect(audio.playbackRate).toBe(1.5)
    expect(ref.current!.getState().playbackRate).toBe(1.5)
    expect(onRateChange).toHaveBeenCalled()
    expect(onRateChange.mock.lastCall?.[0].type).toBe('ratechange')
    expect(onPlaybackRateChange).not.toHaveBeenCalled()

    act(() => ref.current!.reload())
    fireEvent.loadedMetadata(audio)
    expect(audio.playbackRate).toBe(2)
    rerender(<Audio ref={ ref } src="/second.wav" playbackRate={ 1.25 } />)
    act(() => audio.load())
    fireEvent.loadedMetadata(audio)
    expect(audio.playbackRate).toBe(1.25)
  })

  it('最新倍速限制适用于 prop、非受控方法及受控请求', () => {
    const { audio, ref, rerender } = setup({ maxRate: 4 })
    const onRateChange = vi.fn()
    rerender(<Audio ref={ ref } src="/first.wav" maxRate={ 2 } onRateChange={ onRateChange } />)
    act(() => ref.current!.setPlaybackRate(3))
    fireEvent.rateChange(audio)
    expect(audio.playbackRate).toBe(2)
    expect(onRateChange).toHaveBeenCalled()
    expect(onRateChange.mock.lastCall?.[0].type).toBe('ratechange')

    const onPlaybackRateChange = vi.fn()
    rerender(<Audio ref={ ref } src="/first.wav" playbackRate={ 3 } maxRate={ 1.75 } onPlaybackRateChange={ onPlaybackRateChange } />)
    expect(audio.playbackRate).toBe(1.75)
    act(() => ref.current!.setPlaybackRate(4))
    expect(onPlaybackRateChange).toHaveBeenCalledExactlyOnceWith(1.75)
  })
})
