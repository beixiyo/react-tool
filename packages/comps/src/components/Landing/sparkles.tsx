'use client'

import { StarField } from '@jl-org/cvs'
import { getWinHeight, getWinWidth } from '@jl-org/tool'
import { memo, useEffect, useRef } from 'react'
import { cn } from 'utils'

export const Sparkles = memo<SparklesProps>((
  {
    style,
    className,
  },
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const starField = new StarField(canvasRef.current!, {
      backgroundColor: 'transparent',
      sizeRange: [0.7, 2.2],
      colors: ['#ffffff', '#ffff00', '#d4fbff'],
    })

    const resize = () => {
      starField.onResize(getWinWidth(), getWinHeight())
    }

    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return <canvas
    ref={ canvasRef }
    className={ cn(
      'SparklesContainer',
      className,
    ) }
    style={ style }
  >
  </canvas>
})

Sparkles.displayName = 'Sparkles'

export type SparklesProps = {

}
& React.PropsWithChildren<React.HTMLAttributes<HTMLCanvasElement>>
