import type { CaptureKind, RecorderState } from '@/utils'
import { Button, Checkbox, NumberInput, Select } from 'comps'
import { memo } from 'react'

/** 将选项数组移到组件外部，避免每次渲染创建新引用 */
const cursorOptions = [
  { value: '', label: '默认' },
  { value: 'always', label: '总是显示' },
  { value: 'motion', label: '移动时显示' },
  { value: 'never', label: '不显示' },
]

const kindOptions = [
  { value: 'video', label: '音视频' },
  { value: 'audio', label: '仅音频' },
]

/**
 * 屏幕录制控制与参数面板
 */
export const RecorderOptions = memo((props: RecorderOptionsProps) => {
  const {
    recState,
    systemAudio,
    micAudio,
    captureKind,
    timeslice,
    isStarting,
    onChangeSystemAudio,
    onChangeMicAudio,
    onChangeCaptureKind,
    onChangeTimeslice,
    onStart,
    onPause,
    onResume,
    onStop,
  } = props

  return (
    <div className="col-span-1 space-y-4">
      <div>
        <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">录制类型</label>
        <Select
          options={ kindOptions }
          value={ captureKind }
          onChange={ v => onChangeCaptureKind(v) }
          dropdownHeight={ 140 }
        />
      </div>
      <div>
        <Checkbox
          checked={ systemAudio }
          onChange={ checked => onChangeSystemAudio(checked) }
          label="系统音频"
          labelClassName="text-sm text-zinc-700 dark:text-zinc-300"
        />
      </div>
      <div>
        <Checkbox
          checked={ micAudio }
          onChange={ checked => onChangeMicAudio(checked) }
          label="麦克风"
          labelClassName="text-sm text-zinc-700 dark:text-zinc-300"
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">分片时长(ms)</label>
        <NumberInput
          value={ timeslice === ''
            ? ''
            : Number(timeslice) }
          onChange={ val => onChangeTimeslice(Number.isNaN(val)
            ? ''
            : val) }
          min={ 100 }
          step={ 100 }
          placeholder="不分片留空"
        />
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          onClick={ onStart }
          disabled={ recState === 'recording' || recState === 'paused' }
          loading={ isStarting }
          variant="primary"
        >
          开始
        </Button>
        <Button
          onClick={ onPause }
          disabled={ recState !== 'recording' }
        >
          暂停
        </Button>
        <Button
          onClick={ onResume }
          disabled={ recState !== 'paused' }
        >
          恢复
        </Button>
        <Button
          onClick={ onStop }
          disabled={ recState !== 'recording' && recState !== 'paused' }
          variant="danger"
        >
          停止
        </Button>
      </div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400 pt-1">
        状态：
        { recState }
      </div>
    </div>
  )
})

RecorderOptions.displayName = 'RecorderOptions'

export type RecorderOptionsProps = {
  recState: RecorderState
  systemAudio: boolean
  micAudio: boolean
  /** 'video' 录音+录屏，'audio' 仅录音 */
  captureKind: CaptureKind
  timeslice: number | ''
  /** 是否正在启动录制 */
  isStarting: boolean
  onChangeSystemAudio: (v: boolean) => void
  onChangeMicAudio: (v: boolean) => void
  onChangeCaptureKind: (v: CaptureKind) => void
  onChangeTimeslice: (v: number | '') => void
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
}
