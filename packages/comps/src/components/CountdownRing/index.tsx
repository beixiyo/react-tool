import type { CSSProperties } from 'react'
import { colorAddOpacity } from '@jl-org/tool'
import { useLatestCallback } from 'hooks'
import { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import styles from './styles.module.css'

export const CountdownRing = memo(forwardRef<CountdownRingRef, CountdownRingProps>((props, ref) => {
  const {
    initialTime = 60,
    size = 200,
    startColor = '#00ff00',
    gradientDegree = 0.4,
    fontSize = 48,
    backgroundColor = '#1E1F22',
    centerColor = '#2d2d2d',
    autoStart = true,
    onComplete,
    onTick,
    className,
    style,
  } = props
  const textColor = props.textColor || startColor

  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(autoStart)
  const intervalId = useRef<number | null>(null)
  const [maskAngle, setMaskAngle] = useState(0)
  const restartTimerId = useRef<number | null>(null)

  /** 用稳定引用持有回调，避免父组件内联回调导致计时 effect 反复重建 interval（计时漂移） */
  const handleTick = useLatestCallback((time: number) => onTick?.(time))
  const handleComplete = useLatestCallback(() => onComplete?.())

  const containerStyle = useMemo(() => {
    return {
      '--mask-angle': `${maskAngle}deg`,
      '--faded-color1': colorAddOpacity(startColor, gradientDegree),
      '--start-color': startColor,
      '--bg-color': backgroundColor,
      'width': `${size}px`,
      'height': `${size}px`,
    } as CSSProperties
  }, [maskAngle, startColor, gradientDegree, backgroundColor, size])

  useEffect(() => {
    if (intervalId.current)
      clearInterval(intervalId.current)

    intervalId.current = null

    if (isRunning && timeLeft > 0) {
      intervalId.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1
          handleTick(newTime)

          if (newTime <= 0) {
            setIsRunning(false)
            handleComplete()
            if (intervalId.current)
              clearInterval(intervalId.current)
            return 0
          }
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (intervalId.current)
        clearInterval(intervalId.current)
    }
    /** 仅在运行状态切换时创建/销毁 interval；回调通过稳定引用读取，避免漂移 */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning])

  useEffect(() => {
    const progress = (timeLeft > 0
      ? timeLeft / initialTime
      : 0)
    setMaskAngle((1 - progress) * 360)
  }, [timeLeft, initialTime])

  useEffect(() => {
    setTimeLeft(initialTime)
  }, [initialTime])

  /** 卸载时清理 restart 延时器，避免对已卸载组件 setState */
  useEffect(() => {
    return () => {
      if (restartTimerId.current)
        clearTimeout(restartTimerId.current)
    }
  }, [])

  useImperativeHandle(ref, () => ({
    start: () => {
      if (timeLeft > 0)
        setIsRunning(true)
    },
    pause: () => {
      setIsRunning(false)
    },
    reset: () => {
      setIsRunning(false)
      setTimeLeft(initialTime)
    },
    restart: () => {
      if (restartTimerId.current)
        clearTimeout(restartTimerId.current)

      setIsRunning(false)
      setTimeLeft(initialTime)
      /** 下一帧再启动，确保 reset 先生效；保存 id 以便卸载时清理 */
      restartTimerId.current = window.setTimeout(() => {
        restartTimerId.current = null
        setIsRunning(true)
      }, 16)
    },
  }))

  return (
    <div
      className={ cn(
        styles.container,
        'relative flex items-center justify-center rounded-full',
        className,
      ) }
      style={ { ...style, ...containerStyle } }
    >
      <div
        className="absolute z-0 rounded-full"
        style={ {
          width: `${size * 0.8}px`,
          height: `${size * 0.8}px`,
          background: centerColor,
        } }
      />
      <div
        className="relative z-10 select-none font-bold"
        style={ {
          color: textColor,
          fontSize: `${fontSize}px`,
          textShadow: `0 0 20px ${startColor}`,
        } }
      >
        { timeLeft }
      </div>
    </div>
  )
}))

CountdownRing.displayName = 'CountdownRing'

export type CountdownRingRef = {
  start: () => void
  pause: () => void
  reset: () => void
  restart: () => void
}

export type CountdownRingProps = {
  /**
   * 初始倒计时秒数
   * @default 60
   */
  initialTime?: number
  /**
   * 圆环大小（直径）
   * @default 200
   */
  size?: number
  /**
   * 渐变主颜色
   * @default '#00ff00'
   */
  startColor?: string
  /**
   * 渐变程度
   * @default 0.4
   */
  gradientDegree?: number
  /**
   * 数字颜色, 默认与startColor相同
   */
  textColor?: string
  /**
   * 数字字体大小
   * @default 48
   */
  fontSize?: number
  /**
   * 背景圆环颜色
   * @default '#1E1F22'
   */
  backgroundColor?: string
  /**
   * 中心背景颜色
   * @default '#2d2d2d'
   */
  centerColor?: string
  /**
   * 是否自动开始
   * @default true
   */
  autoStart?: boolean
  /** 倒计时结束回调 */
  onComplete?: () => void
  /** 每秒回调 */
  onTick?: (timeLeft: number) => void
} & React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
