import type { AudioRef } from './index'
import { Pause, Play, RefreshCw, Square, Volume2, VolumeX } from 'lucide-react'

import { useRef, useState } from 'react'
import { Button, Card, ProgressBar, Slider, Switch } from '../'
import { Audio } from './index'

/**
 * Audio 组件使用示例
 */
export default function AudioTest() {
  const audioRef = useRef<AudioRef>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [volume, setVolume] = useState(1.0)
  const [muted, setMuted] = useState(false)
  const [loop, setLoop] = useState(false)

  const handleToggle = () => {
    audioRef.current?.toggle()
  }

  const handleStop = () => {
    audioRef.current?.stop()
  }

  const handleSeek = (time: number) => {
    audioRef.current?.seek(time)
  }

  const handleSetPlaybackRate = (rate: number) => {
    audioRef.current?.setPlaybackRate(rate)
  }

  const handleSetVolume = (vol: number) => {
    audioRef.current?.setVolume(vol)
  }

  const handleToggleMute = () => {
    audioRef.current?.toggleMute()
  }

  const handleSetLoop = (loopValue: boolean) => {
    audioRef.current?.setLoop(loopValue)
    setLoop(loopValue)
  }

  const handleReload = () => {
    audioRef.current?.reload()
  }

  const handleGetState = () => {
    const state = audioRef.current?.getState()
    console.warn('当前音频状态:', state)
  }

  /** 格式化时间显示 */
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  /** 计算进度百分比 */
  const progressPercentage = duration > 0
    ? (currentTime / duration) * 100
    : 0

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Audio 组件测试
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          使用现代化组件构建的音频播放器界面
        </p>
      </div>

      {/* 隐藏的音频元素 */ }
      <Audio
        ref={ audioRef }
        src={ new URL('./地球ぎ - 松澤由美.flac', import.meta.url).href }
        onTimeUpdate={ setCurrentTime }
        onLoadedMetadata={ dur => setDuration(dur) }
        onPlay={ () => setPlaying(true) }
        onPause={ () => setPlaying(false) }
        onRateChange={ setPlaybackRate }
        onVolumeChange={ setVolume }
        onMuteChange={ setMuted }
        onError={ error => console.error('音频错误:', error) }
      />

      {/* 主播放器卡片 */ }
      <Card className="p-6">
        {/* 进度条区域 */ }
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>{ formatTime(currentTime) }</span>
            <span>{ formatTime(duration) }</span>
          </div>

          <Slider
            value={ currentTime }
            min={ 0 }
            max={ duration || 100 }
            step={ 0.1 }
            onChange={ handleSeek }
            className="w-full"
            tooltip={ {
              formatter: value => formatTime(value),
            } }
          />

          {/* 进度条背景显示 */ }
          <div className="mt-2">
            <ProgressBar
              value={ progressPercentage / 100 }
              className="h-1"
            />
          </div>
        </div>

        {/* 主控制按钮 */ }
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            onClick={ handleToggle }
            size="lg"
            className="w-16 h-16 rounded-full"
            variant={ playing
              ? 'default'
              : 'primary' }
            leftIcon={ playing
              ? <Pause className="w-6 h-6" />
              : <Play className="w-6 h-6" /> }
          />

          <Button
            onClick={ handleStop }
            variant="default"
            size="lg"
            className="w-12 h-12 rounded-full"
            leftIcon={ <Square className="w-5 h-5" /> }
          />

          <Button
            onClick={ handleReload }
            variant="default"
            size="lg"
            className="w-12 h-12 rounded-full"
            leftIcon={ <RefreshCw className="w-5 h-5" /> }
          />
        </div>

        {/* 音量控制 */ }
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={ handleToggleMute }
            variant="default"
            size="sm"
            className="w-10 h-10 rounded-full"
          >
            { muted
              ? <VolumeX className="w-4 h-4" />
              : <Volume2 className="w-4 h-4" /> }
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
                handleSetVolume(value)
                if (muted) {
                  handleToggleMute()
                }
              } }
              className="w-full"
              tooltip={ {
                formatter: value => `${Math.round(value * 100)}%`,
              } }
            />
          </div>

          <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
            { Math.round(volume * 100) }
            %
          </span>
        </div>

        {/* 高级控制切换 */ }
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          高级设置
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 循环播放控制 */ }
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              循环播放
            </label>
            <div className="flex items-center gap-2">
              <Switch
                checked={ loop }
                onChange={ handleSetLoop }
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                { loop
                  ? '已开启'
                  : '已关闭' }
              </span>
            </div>
          </div>

          {/* 播放倍速控制 */ }
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              播放倍速:
              { ' ' }
              { playbackRate }
              x
            </label>
            <Slider
              value={ playbackRate }
              min={ 0.25 }
              max={ 4 }
              step={ 0.25 }
              onChange={ handleSetPlaybackRate }
              marks={ {
                0.25: '0.25x',
                0.5: '0.5x',
                1: '1x',
                1.5: '1.5x',
                2: '2x',
                4: '4x',
              } }
              tooltip={ {
                formatter: value => `${value}x`,
              } }
            />
          </div>

          {/* 快速跳转 */ }
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              快速跳转
            </label>
            <div className="flex gap-2">
              <Button
                onClick={ () => handleSeek(0) }
                variant="default"
                size="sm"
              >
                开始
              </Button>
              <Button
                onClick={ () => handleSeek(duration * 0.25) }
                variant="default"
                size="sm"
              >
                25%
              </Button>
              <Button
                onClick={ () => handleSeek(duration * 0.5) }
                variant="default"
                size="sm"
              >
                50%
              </Button>
              <Button
                onClick={ () => handleSeek(duration * 0.75) }
                variant="default"
                size="sm"
              >
                75%
              </Button>
              <Button
                onClick={ () => handleSeek(duration) }
                variant="default"
                size="sm"
              >
                结束
              </Button>
            </div>
          </div>
        </div>

        {/* 调试信息 */ }
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <div className="text-gray-500 dark:text-gray-400">播放状态</div>
              <div className="font-medium text-gray-900 dark:text-white">
                { playing
                  ? '播放中'
                  : '已暂停' }
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <div className="text-gray-500 dark:text-gray-400">当前时间</div>
              <div className="font-medium text-gray-900 dark:text-white">
                { formatTime(currentTime) }
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <div className="text-gray-500 dark:text-gray-400">总时长</div>
              <div className="font-medium text-gray-900 dark:text-white">
                { formatTime(duration) }
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <div className="text-gray-500 dark:text-gray-400">进度</div>
              <div className="font-medium text-gray-900 dark:text-white">
                { progressPercentage.toFixed(1) }
                %
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
