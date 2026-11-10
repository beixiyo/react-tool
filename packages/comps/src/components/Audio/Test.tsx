import { Pause, Play, RefreshCw, Square, Volume2, VolumeX } from 'lucide-react'
import type { AudioRef } from './index'

import { useEffect, useRef, useState } from 'react'
import { Button, Card, Slider, Switch } from '../'
import { Loading } from '../Loading'
import { ThemeToggle } from '../ThemeToggle'
import { Audio } from './index'

/**
 * Audio 组件使用示例
 */
function AudioTest() {
  const audioRef = useRef<AudioRef>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [targetRate, setTargetRate] = useState(1)
  const [controlled, setControlled] = useState(false)
  const [acceptRequests, setAcceptRequests] = useState(true)
  const [preserveRate, setPreserveRate] = useState(true)
  const [requestedRate, setRequestedRate] = useState<number>()
  const [sourceIndex, setSourceIndex] = useState(1)
  const [volume, setVolume] = useState(1.0)
  const [muted, setMuted] = useState(false)
  const [loop, setLoop] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customLoading, setCustomLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDuration(audioRef.current?.getState().duration ?? 0)
  }, [])

  const handleToggle = () => {
    void audioRef.current?.toggle().catch((error: unknown) => setError(String(error)))
  }

  const handleSetLoop = (loopValue: boolean) => {
    audioRef.current?.setLoop(loopValue)
    setLoop(loopValue)
  }

  const [stateText, setStateText] = useState('')

  const handleGetState = () => {
    const state = audioRef.current?.getState()
    setStateText(
      state
        ? JSON.stringify(state, null, 2)
        : '',
    )
  }

  /** 格式化时间显示 */
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-background text-text min-h-screen p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              Audio 组件测试
            </h2>
          </div>
          <ThemeToggle />
        </header>

        { /* 隐藏的音频元素 */ }
        <Audio
          ref={ audioRef }
          src={ `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${sourceIndex}.mp3` }
          playbackRate={ controlled
            ? targetRate
            : undefined }
          preservePlaybackRateOnSourceChange={ preserveRate }
          onPlaybackRateChange={ (rate) => {
            setRequestedRate(rate)
            if (acceptRequests) setTargetRate(rate)
          } }
          preload="auto"
          onLoadingChange={ setLoading }
          onLoadStart={ () => setError(null) }
          onTimeUpdate={ (event) => setCurrentTime(event.currentTarget.currentTime) }
          onLoadedMetadata={ (event) => setDuration(event.currentTarget.duration) }
          onPlay={ () => setPlaying(true) }
          onPause={ () => setPlaying(false) }
          onEnded={ () => setPlaying(false) }
          onEmptied={ () => {
            setPlaying(false)
            setCurrentTime(0)
            setDuration(0)
          } }
          onRateChange={ (event) => setPlaybackRate(event.currentTarget.playbackRate) }
          onVolumeChange={ (event) => {
            setVolume(event.currentTarget.volume)
            setMuted(event.currentTarget.muted)
          } }
          onError={ (event) => setError(event.currentTarget.error?.message ?? 'Failed to load audio') }
        />

        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">音频加载状态</h3>
            <Switch checked={ customLoading } onChange={ setCustomLoading } label="自定义 Loading" />
          </div>
          <div
            role="status"
            aria-live="polite"
            aria-busy={ loading }
            className="bg-background2 relative flex min-h-24 items-center justify-center overflow-hidden rounded-sm p-4"
          >
            { loading && <span className="sr-only">音频加载中</span> }
            { loading
              ? (
                <Loading
                  loading
                  variant={ customLoading
                    ? 'custom'
                    : 'spinner' }
                  size={ 32 }
                  zIndex={ 1 }
                >
                  <div className="text-text2 text-center">
                    <p className="font-medium">正在准备音频…</p>
                    <p className="text-sm">这段内容由播放器页面自定义</p>
                  </div>
                </Loading>
              )
              : (
                <p className="text-text2 text-sm">
                  { error
                    ? `加载失败：${error}`
                    : '初始加载已结束' }
                </p>
              ) }
          </div>
          <p className="text-text2 text-sm">实际加载开始后显示，元数据就绪或出错时结束；不遮挡播放控制。Audio 本身不包含展示布局</p>
        </Card>

        <Card className="space-y-4 p-6">
          <h3 className="text-lg font-semibold">倍速控制契约</h3>
          <div className="flex flex-wrap items-center gap-6">
            <Switch checked={ controlled } onChange={ setControlled } label="受控倍速" />
            <Switch checked={ preserveRate } onChange={ setPreserveRate } label="换源保留目标倍速" />
            <Switch checked={ acceptRequests } onChange={ setAcceptRequests } disabled={ !controlled } label="接受倍速请求" />
          </div>
          <p className="text-text2 text-sm">
            实际倍速：{ playbackRate }x；受控目标：{ targetRate }x；最近请求：{ requestedRate ?? '无' }
            。关闭请求接受后，滑块只发请求；外部临时修改只报告实际值，不立即抢回
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={ () => {
                audioRef.current?.pause()
                setPlaying(false)
                setCurrentTime(0)
                setDuration(0)
                setSourceIndex((index) =>
                  index === 1
                    ? 2
                    : 1
                )
              } }
            >
              切换音源（当前 { sourceIndex }）
            </Button>
            <Button disabled={ !controlled } onClick={ () => setTargetRate(1.5) }>
              设为 1.5x
            </Button>
          </div>
        </Card>

        { /* 主播放器卡片 */ }
        <Card className="p-6">
          { /* 进度条区域 */ }
          <div className="mb-6">
            <div className="text-text2 mb-2 flex items-center justify-between text-sm">
              <span>{ formatTime(currentTime) }</span>
              <span>{ formatTime(duration) }</span>
            </div>

            <Slider
              value={ currentTime }
              min={ 0 }
              max={ duration || 100 }
              step={ 0.1 }
              onChange={ (time) => audioRef.current?.seek(time) }
              className="w-full"
              tooltip={ {
                formatter: (value) => formatTime(value),
              } }
            />
          </div>

          { /* 主控制按钮 */ }
          <div className="mb-6 flex items-center justify-center gap-4">
            <Button
              onClick={ handleToggle }
              tooltip="播放或暂停"
              size="lg"
              className="h-16 w-16 rounded-full"
              variant={ playing
                ? 'default'
                : 'primary' }
              leftIcon={ playing
                ? <Pause className="h-6 w-6" />
                : <Play className="h-6 w-6" /> }
            />

            <Button
              onClick={ () => audioRef.current?.stop() }
              tooltip="停止播放"
              variant="default"
              size="lg"
              className="h-12 w-12 rounded-full"
              leftIcon={ <Square className="h-5 w-5" /> }
            />

            <Button
              onClick={ () => audioRef.current?.reload() }
              tooltip="重新加载音频"
              variant="default"
              size="lg"
              className="h-12 w-12 rounded-full"
              leftIcon={ <RefreshCw className="h-5 w-5" /> }
            />
          </div>

          { /* 音量控制 */ }
          <div className="mb-4 flex items-center gap-4">
            <Button
              onClick={ () => audioRef.current?.toggleMute() }
              tooltip="切换静音"
              variant="default"
              size="sm"
              className="h-10 w-10 rounded-full"
            >
              { muted
                ? <VolumeX className="h-4 w-4" />
                : <Volume2 className="h-4 w-4" /> }
            </Button>

            <div className="flex-1">
              <Slider
                value={ muted
                  ? 0
                  : volume }
                min={ 0 }
                max={ 1 }
                step={ 0.01 }
                onChange={ (value) => {
                  audioRef.current?.setVolume(value)
                  if (muted) audioRef.current?.setMuted(false)
                } }
                className="w-full"
                tooltip={ {
                  formatter: (value) => `${Math.round(value * 100)}%`,
                } }
              />
            </div>

            <span className="text-text2 w-12 text-right text-sm">
              { Math.round(volume * 100) }
              %
            </span>
          </div>

          { /* 高级控制切换 */ }
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">
            高级设置
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            { /* 循环播放控制 */ }
            <div>
              <label className="text-text2 mb-2 block text-sm font-medium">
                循环播放
              </label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={ loop }
                  onChange={ handleSetLoop }
                />
                <span className="text-text2 text-sm">
                  { loop
                    ? '已开启'
                    : '已关闭' }
                </span>
              </div>
            </div>

            { /* 播放倍速控制 */ }
            <div>
              <label className="text-text2 mb-2 block text-sm font-medium">
                播放倍速: { playbackRate }
                x
              </label>
              <Slider
                value={ playbackRate }
                min={ 0.25 }
                max={ 4 }
                step={ 0.25 }
                onChange={ (rate) => audioRef.current?.setPlaybackRate(rate) }
                marks={ {
                  0.25: '0.25x',
                  0.5: '0.5x',
                  1: '1x',
                  1.5: '1.5x',
                  2: '2x',
                  4: '4x',
                } }
                tooltip={ {
                  formatter: (value) => `${value}x`,
                } }
              />
            </div>

            { /* 快速跳转 */ }
            <div>
              <label className="text-text2 mb-2 block text-sm font-medium">
                快速跳转
              </label>
              <div className="flex gap-2">
                { [0, 0.25, 0.5, 0.75, 1].map((fraction) => (
                  <Button
                    key={ fraction }
                    onClick={ () => audioRef.current?.seek(duration * fraction) }
                    variant="default"
                    size="sm"
                  >
                    { fraction * 100 }%
                  </Button>
                )) }
              </div>
            </div>
          </div>

          { /* 调试信息 */ }
          <div className="border-border mt-6 border-t pt-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-text2 text-sm font-medium">
                调试信息
              </h4>
              <Button
                onClick={ handleGetState }
                variant="default"
                size="sm"
              >
                获取状态
              </Button>
            </div>

            { stateText && (
              <pre className="bg-background2 text-text2 mt-4 overflow-x-auto rounded-sm p-3 text-xs">
                { stateText }
              </pre>
            ) }
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AudioTest
