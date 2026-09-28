'use client'

import { StarField } from '@jl-org/cvs'
import { getWinHeight, getWinWidth } from '@jl-org/tool'
import { useIntersectionObserver, usePageVisibility } from 'hooks'
import { memo, useEffect, useRef, useState } from 'react'
import { cn } from 'utils'

export const Sparkles = memo<SparklesProps>((
  {
    style,
    className,
  },
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starFieldRef = useRef<StarField | null>(null)

  const pageVisible = usePageVisibility() === 'visible'
  const [inViewport, setInViewport] = useState(true)

  /** 创建实例 + resize 接线，卸载时销毁 */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const starField = new StarField(canvas, {
      backgroundColor: 'transparent',
      sizeRange: [0.7, 2.2],
      colors: ['#ffffff', '#ffff00', '#d4fbff'],
    })
    starFieldRef.current = starField

    const onResize = () => starField.onResize(getWinWidth(), getWinHeight())
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      starField.dispose()
      starFieldRef.current = null
    }
  }, [])

  /** 离屏观察：离开视口暂停，回到视口恢复 */
  useIntersectionObserver(
    [canvasRef],
    (entry) => {
      setInViewport(entry.isIntersecting)
    },
  )

  /** 可见性驱动启停：StarField 构造即自动 start，这里只负责停与续 */
  useEffect(() => {
    const starField = starFieldRef.current
    if (!starField) {
      return
    }

    if (inViewport && pageVisible) {
      starField.start()
    }
    else {
      starField.stop()
    }
  }, [inViewport, pageVisible])

  return (
    <canvas
      ref={ canvasRef }
      className={ cn(
        'SparklesContainer',
        className,
      ) }
      style={ style }
    >
    </canvas>
  )
})

Sparkles.displayName = 'Sparkles'

export type SparklesProps =
  & {}
  & React.PropsWithChildren<React.HTMLAttributes<HTMLCanvasElement>>
