'use client'

/**
 * Installed from https://reactbits.dev/ts/default/
 */

import { Color, Mesh, Program, Renderer, Triangle } from 'ogl'
import { useEffect, useRef } from 'react'
import { FRAG, VERT } from './shader'

export const Aurora = memo<AuroraProps>((props) => {
  const {
    colorStops = ['#00d8ff', '#7cff67', '#00d8ff'],
    amplitude = 1.0,
    blend = 0.5,
    className,
  } = props
  const propsRef = useRef<AuroraProps>(props)
  propsRef.current = props

  const ctnDom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctn = ctnDom.current
    if (!ctn)
      return

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.canvas.style.backgroundColor = 'transparent'

    const geometry = new Triangle(gl)
    if (geometry.attributes.uv) {
      // TypeScript may require a type assertion here.
      delete (geometry.attributes as any).uv
    }

    const colorStopsArray = colorStops.map((hex) => {
      const c = new Color(hex)
      return [c.r, c.g, c.b]
    })

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: colorStopsArray },
        uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
        uBlend: { value: blend },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })
    ctn.appendChild(gl.canvas)

    let animateId = 0
    const update = (t: number) => {
      animateId = requestAnimationFrame(update)
      const { time = t * 0.01, speed = 1.0 } = propsRef.current

      program.uniforms.uTime.value = time * speed * 0.1
      program.uniforms.uAmplitude.value = propsRef.current.amplitude ?? 1.0
      program.uniforms.uBlend.value = propsRef.current.blend ?? blend
      const stops = propsRef.current.colorStops ?? colorStops
      program.uniforms.uColorStops.value = stops.map((hex: string) => {
        const c = new Color(hex)
        return [c.r, c.g, c.b]
      })
      renderer.render({ scene: mesh })
    }
    animateId = requestAnimationFrame(update)

    resize()
    window.addEventListener('resize', resize)

    function resize() {
      if (!ctn)
        return
      const { width, height } = ctn.getBoundingClientRect()
      renderer.setSize(width, height)
      if (program) {
        program.uniforms.uResolution.value = [width, height]
      }
    }

    return () => {
      cancelAnimationFrame(animateId)
      window.removeEventListener('resize', resize)
      if (ctn && gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas)
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [amplitude, blend, colorStops])

  return <div ref={ ctnDom } className={ `size-full ${className}` } />
})

export interface AuroraProps {
  colorStops?: string[]
  amplitude?: number
  blend?: number
  time?: number
  speed?: number
  className?: string
}
