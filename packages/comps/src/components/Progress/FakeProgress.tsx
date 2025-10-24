'use client'

import type { CSSProperties, ReactNode } from 'react'
import { clamp, FakeProgress as Progress } from '@jl-org/tool'
import classnames from 'clsx'
import { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { ProgressBar } from './ProgressBar'

function InnerFakeProgress({
  style,
  className,

  done,
  onChange: _onChange,
  uniqueKey,
  colors = ['#3276F91A', '#01D0BD'],

  showText = true,
  showBar = true,
  onlyProgressBar,

}: FakeProgressProps, ref: React.Ref<FakeProgressRef>) {
  const [val, setVal] = useState(0)

  const progress = useMemo(() => new Progress({
    autoStart: false,
    timeConstant: 240000,
    initialProgress: uniqueKey
      ? +(localStorage.getItem(uniqueKey) || 0)
      : 0,

    onChange: (val) => {
      setVal(val)
      _onChange?.(val)
      uniqueKey && localStorage.setItem(uniqueKey, val.toString())

      val >= 0.95 && progress.stop()
    },
  }), [_onChange, uniqueKey])

  const clear = useCallback(() => {
    progress.end()
    progress.stop()
    uniqueKey && localStorage.removeItem(uniqueKey)
  }, [progress, uniqueKey])

  /** 将方法暴露给ref */
  useImperativeHandle(ref, () => ({
    getProgress: () => val,
    setProgress: (value: number) => {
      const clampedValue = clamp(value, 0, 1)
      progress.setProgress(clampedValue)
    },
    start: () => progress.start(),
    stop: () => progress.stop(),
    end: () => progress.end(),
    clear,
  }), [clear, val, progress])

  useEffect(() => {
    progress.start()
    return clear
  }, [clear, progress])

  useEffect(() => {
    if (!done)
      return
    clear()
  }, [clear, done])

  if (onlyProgressBar) {
    return <ProgressBar value={ val } />
  }

  return (<div
    className={ classnames(
      'absolute inset-0 bg-gray-100 flex justify-center items-center flex-col',
      className,
    ) }
    style={ style }
  >
    {/* { showLogo && <LogoLoading size={ size } /> } */}

    { showText && <p>
      <span>Estimated 2 minutes, please wait patiently... </span>
      <span className="ml-2 text-blue-600">
        { ' ' }
        { (val * 100).toString().slice(0, 5) }
        %
      </span>
    </p> }

    { showBar && <ProgressBar
      value={ val }
      colors={ colors }
      className="absolute bottom-0 z-5 w-full"
    /> }
  </div>)
}
InnerFakeProgress.displayName = 'FakeProgress'

export const FakeProgress = memo(forwardRef<FakeProgressRef, FakeProgressProps>(InnerFakeProgress))

export type FakeProgressProps = {
  className?: string
  style?: CSSProperties
  children?: ReactNode

  done?: boolean
  onChange?: (val: number) => void

  showText?: boolean
  showBar?: boolean
  onlyProgressBar?: boolean
  /**
   * 渐变颜色数组，支持多个颜色
   * @default ['#3276F91A', '#01D0BD']
   * @example ['#3b82f6', '#a855f7', '#ec4899']
   */
  colors?: string[]

  /**
   * 唯一 ID，保持持久化进度用的
   */
  uniqueKey?: string
}

export type FakeProgressRef = {
  /** 获取当前进度值 (0-1) */
  getProgress: () => number
  /** 设置进度值 (0-1) */
  setProgress: (value: number) => void
  /** 开始进度 */
  start: () => void
  /** 停止进度 */
  stop: () => void
  /** 完成进度 */
  end: () => void
  /** 清除进度 */
  clear: () => void
}
