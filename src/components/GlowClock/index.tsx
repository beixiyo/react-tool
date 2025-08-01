'use client'

import { useEffect, useRef } from 'react'

export const GlowClock = memo<GlowClockProps>(({
  radius,
  strokeWidth = 4,
  gradientStartAngle = -60,
  gradientEndAngle = 240,
  hourHandLength = 0.5,
  minuteHandLength = 0.7,
  glowIntensity = 0.15,
  glowColor = '#00ff00',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const drawClock = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, centerX * 2, centerY * 2)

    // Convert angles to radians and normalize for createConicGradient
    // createConicGradient uses radians starting from the positive x-axis
    const startRad = (gradientStartAngle - 90) * Math.PI / 180
    const endRad = (gradientEndAngle - 90) * Math.PI / 180

    // Create conic gradient
    const gradient = ctx.createConicGradient(0, centerX, centerY)

    // Convert angles to normalized positions (0-1)
    const startPos = (startRad + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2)
    const endPos = (endRad + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2)

    // Add color stops for sharp transition
    if (startPos < endPos) {
      gradient.addColorStop(0, glowColor)
      gradient.addColorStop(startPos, glowColor)
      gradient.addColorStop(startPos, 'transparent')
      gradient.addColorStop(endPos, glowColor)
      gradient.addColorStop(1, glowColor)
    }
    else {
      gradient.addColorStop(0, 'transparent')
      gradient.addColorStop(endPos, glowColor)
      gradient.addColorStop(startPos, glowColor)
      gradient.addColorStop(startPos + 0.001, 'transparent')
      gradient.addColorStop(1, 'transparent')
    }

    // Set glow effect
    ctx.shadowBlur = radius * glowIntensity
    ctx.shadowColor = glowColor
    ctx.strokeStyle = gradient
    ctx.lineWidth = strokeWidth

    // Draw outer circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius - strokeWidth / 2, 0, Math.PI * 2)
    ctx.stroke()

    // Get current time
    const now = new Date()
    const hours = now.getHours() % 12
    const minutes = now.getMinutes()

    // Set solid color for hands
    ctx.strokeStyle = glowColor
    ctx.lineWidth = strokeWidth * 0.75

    // Draw hour hand
    const hourAngle = (hours + minutes / 60) * (Math.PI * 2) / 12 - Math.PI / 2
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(
      centerX + Math.cos(hourAngle) * radius * hourHandLength,
      centerY + Math.sin(hourAngle) * radius * hourHandLength,
    )
    ctx.stroke()

    // Draw minute hand
    const minuteAngle = minutes * (Math.PI * 2) / 60 - Math.PI / 2
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(
      centerX + Math.cos(minuteAngle) * radius * minuteHandLength,
      centerY + Math.sin(minuteAngle) * radius * minuteHandLength,
    )
    ctx.stroke()

    // Draw center dot
    ctx.fillStyle = glowColor
    ctx.beginPath()
    ctx.arc(centerX, centerY, strokeWidth, 0, Math.PI * 2)
    ctx.fill()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas)
      return

    const ctx = canvas.getContext('2d')
    if (!ctx)
      return

    // Set canvas size with higher resolution for better glow effect
    const scale = window.devicePixelRatio || 1
    const size = radius * 2.2
    canvas.width = size * scale
    canvas.height = size * scale
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`

    ctx.scale(scale, scale)
    const centerX = size / 2
    const centerY = size / 2

    // Initial draw
    drawClock(ctx, centerX, centerY)

    // Update every second
    const interval = setInterval(() => {
      drawClock(ctx, centerX, centerY)
    }, 1000)

    return () => clearInterval(interval)
  }, [radius, strokeWidth, gradientStartAngle, gradientEndAngle, hourHandLength, minuteHandLength, glowIntensity, glowColor])

  return (
    <canvas
      ref={ canvasRef }
      style={ {
        background: 'black',
        borderRadius: '50%',
      } }
    />
  )
})

export interface GlowClockProps {
  /**
   * 控制半径
   */
  radius: number
  /**
   * 控制圆环的宽度
   */
  strokeWidth?: number
  /**
   * 控制渐变色的起始角度
   */
  gradientStartAngle?: number
  /**
   * 控制渐变色的结束角度
   */
  gradientEndAngle?: number
  /**
   * 控制时针长度（相对于半径的比例）
   */
  hourHandLength?: number
  /**
   * 控制分针长度（相对于半径的比例）
   */
  minuteHandLength?: number
  /**
   * 控制发光效果的强度
   */
  glowIntensity?: number
  /**
   * 控制发光颜色
   */
  glowColor?: string
}
