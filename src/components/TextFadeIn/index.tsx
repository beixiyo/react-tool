'use client'

import { memo, useEffect, useRef, useState } from 'react'

/**
 * 文字渐显
 */
export const TextFadeIn = memo<FadeInTextProps>(({
  text,
  duration = 24,
  fadeWidth = '6em',
}: FadeInTextProps) => {
  /** 追踪已经动画化的字符数量（可以是小数，表示动画进行中） */
  const [animatedCharCount, setAnimatedCharCount] = useState(0)
  /** 控制渐变区域的当前宽度 */
  const [currentFadeWidth, setCurrentFadeWidth] = useState(fadeWidth)

  const animationFrameId = useRef<number | null>(null)
  const animationStartTimeRef = useRef<number>(0)
  /** 存储当前动画段开始时的字符数 */
  const segmentStartCharCountRef = useRef(0)

  useEffect(() => {
    /** 清理上一个动画帧 */
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }
    animationStartTimeRef.current = 0 // 重置动画开始时间

    /** 获取 effect 触发时已显示的字符数 */
    const currentCharsShown = animatedCharCount
    const newTotalChars = text.length

    /** 情况1: 文本为空 */
    if (newTotalChars === 0) {
      setAnimatedCharCount(0)
      setCurrentFadeWidth(fadeWidth) // 重置渐变宽度
      segmentStartCharCountRef.current = 0
      return
    }

    /** 情况2: 文本变短或长度不变（且之前可能已完全显示） */
    if (newTotalChars <= currentCharsShown) {
      setAnimatedCharCount(newTotalChars) // 直接设置为新的字符数
      /** 如果新文本长度大于0（即有内容），则渐变完成，宽度为0；否则（新文本为空），使用配置的fadeWidth */
      setCurrentFadeWidth(newTotalChars > 0
        ? '0rem'
        : fadeWidth)
      segmentStartCharCountRef.current = newTotalChars
      return
    }

    /** 情况3: 文本变长，需要开始新的动画段 */
    setCurrentFadeWidth(fadeWidth) // 为新出现的字符激活渐变效果
    segmentStartCharCountRef.current = currentCharsShown // 动画从已显示的字符数开始

    const charsToAnimateInThisSegment = newTotalChars - currentCharsShown

    // --- 核心改动：实现恒定速度 ---
    // 'duration' prop 现在代表每个字符的动画毫秒数
    const msPerChar = duration
    const segmentDuration = charsToAnimateInThisSegment * msPerChar
    // --- 改动结束 ---

    /** 如果计算出的段持续时间无效（例如 msPerChar <= 0），则直接显示全部 */
    if (segmentDuration <= 0) {
      setAnimatedCharCount(newTotalChars)
      setCurrentFadeWidth('0rem')
      return
    }

    const animate = (timestamp: number) => {
      if (animationStartTimeRef.current === 0) {
        animationStartTimeRef.current = timestamp // 记录第一帧的时间戳
      }

      const elapsedTime = timestamp - animationStartTimeRef.current
      /** 当前动画段的进度 (0 到 1) */
      const progressInSegment = Math.min(1, elapsedTime / segmentDuration)

      /** 在当前动画段中新揭示的字符数 */
      const newCharsRevealedInSegment = progressInSegment * charsToAnimateInThisSegment
      /** 总共应显示的字符数（包括之前已显示的） */
      const totalCharsToShow = segmentStartCharCountRef.current + newCharsRevealedInSegment

      setAnimatedCharCount(totalCharsToShow)

      if (progressInSegment >= 1) { // 当前动画段完成
        setAnimatedCharCount(newTotalChars) // 精确设置到总字符数，避免浮点误差
        setCurrentFadeWidth('0rem') // 动画完成，渐变消失
        animationFrameId.current = null
      }
      else {
        animationFrameId.current = requestAnimationFrame(animate)
      }
    }

    animationFrameId.current = requestAnimationFrame(animate)

    /** 清理函数：组件卸载或依赖项变化时取消动画 */
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
      animationStartTimeRef.current = 0
    }
  // `animatedCharCount` 不应作为此 effect 的依赖项，
  /** 因为 effect 本身是用来管理 `animatedCharCount` 的动画过程的。 */
  // effect 应该在外部因素（text, duration, fadeWidth）变化时运行，
  /** 并基于当时的 `animatedCharCount` 启动新的动画段。 */
  }, [text, duration, fadeWidth])

  /** 计算渐变的百分比进度 */
  const progressPercent = text.length > 0
    ? (animatedCharCount / text.length) * 100
    : 0
  const displayText = text // 始终渲染完整文本，渐变控制可见性

  return (
    <span
      style={ {
        position: 'relative',
        backgroundImage: `linear-gradient(to right, #000 0%, #000 calc(${progressPercent}% - ${currentFadeWidth}), #0000 ${progressPercent}%)`,
        color: 'transparent',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text', // 兼容 Safari
      } }
      className="break-words"
    >
      {displayText}
    </span>
  )
})

TextFadeIn.displayName = 'FadeInText'

export type FadeInTextProps = {
  /**
   * 要显示的文本内容
   * @required
   */
  text: string
  /**
   * 每个字符动画的持续时间（单位：毫秒）
   * 例如：如果设置为 50，则每个字符将花费 50 毫秒出现。
   * @default 24
   */
  duration?: number // 含义已更改：现在是 ms/字符
  /**
   * 控制渐变区域的宽度
   * @default '6em'
   */
  fadeWidth?: string
}
