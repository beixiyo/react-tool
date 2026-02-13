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
  /** 存储上一次的文本内容，用于检测是否是前缀扩展 */
  const prevTextRef = useRef('')
  /** 存储目标字符数（应该立即显示的字符数，不考虑动画） */
  const targetCharCountRef = useRef(0)
  /** 使用 ref 追踪当前动画字符数，确保获取最新值 */
  const animatedCharCountRef = useRef(0)

  useEffect(() => {
    const prevText = prevTextRef.current
    const newText = text
    const newTotalChars = newText.length

    /** 检测是否是前缀扩展：新文本是否以旧文本开头 */
    const isPrefixExtension = prevText && newText.indexOf(prevText) === 0

    /** 情况1: 文本为空 */
    if (newTotalChars === 0) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
      setAnimatedCharCount(0)
      animatedCharCountRef.current = 0
      setCurrentFadeWidth(fadeWidth)
      segmentStartCharCountRef.current = 0
      targetCharCountRef.current = 0
      prevTextRef.current = ''
      animationStartTimeRef.current = 0
      return
    }

    /** 情况2: 文本完全改变（不是前缀扩展），重置并重新开始动画 */
    if (!isPrefixExtension) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
      setAnimatedCharCount(0)
      animatedCharCountRef.current = 0
      setCurrentFadeWidth(fadeWidth)
      segmentStartCharCountRef.current = 0
      targetCharCountRef.current = 0
      prevTextRef.current = newText
      animationStartTimeRef.current = 0
      // 继续执行后续逻辑，让新文本从头开始动画
    }
    else {
      /** 是前缀扩展，更新 prevTextRef */
      prevTextRef.current = newText
    }

    /** 更新目标字符数 */
    targetCharCountRef.current = newTotalChars

    /** 如果当前有动画在进行，取消它，准备从当前位置重新开始 */
    const wasAnimating = !!animationFrameId.current
    if (wasAnimating) {
      cancelAnimationFrame(animationFrameId.current!)
      animationFrameId.current = null
    }

    /** 获取当前应该从哪个位置开始动画（使用 ref 确保获取最新值） */
    const currentAnimatedCount = animatedCharCountRef.current
    const targetCount = targetCharCountRef.current

    /** 如果目标字符数小于等于当前已动画的字符数，直接完成 */
    if (targetCount <= currentAnimatedCount) {
      setAnimatedCharCount(targetCount)
      animatedCharCountRef.current = targetCount
      setCurrentFadeWidth(targetCount > 0 ? '0rem' : fadeWidth)
      segmentStartCharCountRef.current = targetCount
      animationStartTimeRef.current = 0
      return
    }

    /** 需要动画的字符数 */
    const charsToAnimate = targetCount - currentAnimatedCount

    /** 设置新的动画起始点 */
    setCurrentFadeWidth(fadeWidth)
    segmentStartCharCountRef.current = currentAnimatedCount
    animationStartTimeRef.current = 0

    const msPerChar = duration
    const segmentDuration = charsToAnimate * msPerChar

    /** 如果计算出的段持续时间无效，则直接显示全部 */
    if (segmentDuration <= 0) {
      setAnimatedCharCount(targetCount)
      animatedCharCountRef.current = targetCount
      setCurrentFadeWidth('0rem')
      segmentStartCharCountRef.current = targetCount
      return
    }

    const animate = (timestamp: number) => {
      /** 获取最新的目标和起始点（可能在新文本到达时已更新） */
      const currentTarget = targetCharCountRef.current
      const currentStart = segmentStartCharCountRef.current

      if (animationStartTimeRef.current === 0) {
        animationStartTimeRef.current = timestamp
      }

      const elapsedTime = timestamp - animationStartTimeRef.current
      /** 需要动画的字符数 */
      const currentCharsToAnimate = currentTarget - currentStart

      /** 如果目标已达成或无效，完成动画 */
      if (currentCharsToAnimate <= 0) {
        setAnimatedCharCount(currentTarget)
        animatedCharCountRef.current = currentTarget
        setCurrentFadeWidth('0rem')
        animationFrameId.current = null
        animationStartTimeRef.current = 0
        return
      }

      const currentSegmentDuration = currentCharsToAnimate * msPerChar

      /** 当前动画段的进度 (0 到 1) */
      const progressInSegment = Math.min(1, elapsedTime / currentSegmentDuration)

      /** 在当前动画段中新揭示的字符数 */
      const newCharsRevealedInSegment = progressInSegment * currentCharsToAnimate
      /** 总共应显示的字符数（包括之前已显示的） */
      const totalCharsToShow = currentStart + newCharsRevealedInSegment

      setAnimatedCharCount(totalCharsToShow)
      animatedCharCountRef.current = totalCharsToShow

      if (progressInSegment >= 1) { // 当前动画段完成
        setAnimatedCharCount(currentTarget) // 精确设置到目标字符数
        animatedCharCountRef.current = currentTarget
        setCurrentFadeWidth('0rem') // 动画完成，渐变消失
        animationFrameId.current = null
        animationStartTimeRef.current = 0
      }
      else {
        animationFrameId.current = requestAnimationFrame(animate)
      }
    }

    /** 启动动画 */
    animationFrameId.current = requestAnimationFrame(animate)

    /** 清理函数：组件卸载或依赖项变化时取消动画 */
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
      animationStartTimeRef.current = 0
    }
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
        backgroundImage: `linear-gradient(to right, rgb(var(--text)) 0%, rgb(var(--text)) calc(${progressPercent}% - ${currentFadeWidth}), #0000 ${progressPercent}%)`,
        color: 'transparent',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text', // 兼容 Safari
      } }
      className="break-words"
    >
      { displayText }
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
