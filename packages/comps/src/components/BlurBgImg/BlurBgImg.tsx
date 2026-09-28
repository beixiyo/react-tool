import { memo, useInsertionEffect } from 'react'
import { cn } from 'utils'
import type { BlurBgImgProps } from './types'

const FLOW_STYLE_ID = 'blur-bg-img-flow-css'

// --flow-amp 控制所有振幅（位移 + 色相 + 饱和），默认 1
const FLOW_CSS = `
  @keyframes blurImgDrift {
    0%   { transform: translate(0%,                           0%                          ); }
    20%  { transform: translate(calc(var(--flow-amp,1)*-1.8%), calc(var(--flow-amp,1)*-1.2%)); }
    40%  { transform: translate(calc(var(--flow-amp,1)*-0.9%), calc(var(--flow-amp,1)*-2.7%)); }
    60%  { transform: translate(calc(var(--flow-amp,1)*-2.7%), calc(var(--flow-amp,1)*-0.9%)); }
    80%  { transform: translate(calc(var(--flow-amp,1)*-1.5%), calc(var(--flow-amp,1)*-2.1%)); }
    100% { transform: translate(calc(var(--flow-amp,1)*-2.4%), calc(var(--flow-amp,1)*-0.6%)); }
  }
  @keyframes blurHueShift {
    0%   { filter: hue-rotate(calc(var(--flow-amp,1)*-3deg))  saturate(calc(1 + var(--flow-amp,1)*0.05)); }
    50%  { filter: hue-rotate(calc(var(--flow-amp,1)* 4deg))  saturate(calc(1 + var(--flow-amp,1)*0.12)); }
    100% { filter: hue-rotate(calc(var(--flow-amp,1)*-2deg))  saturate(calc(1 + var(--flow-amp,1)*0.07)); }
  }
`

export const BlurBgImg = memo<BlurBgImgProps>((
  {
    style,
    className,
    imgClassName,
    img,
    children,
    blur = '15px',
    showForeground = true,
    flow = false,
    flowDuration = 20,
    flowAmplitude = 1,
    bgScale = 1.25,
    ...imgProps
  },
) => {
  useInsertionEffect(() => {
    if (!flow || document.getElementById(FLOW_STYLE_ID)) return
    const el = document.createElement('style')
    el.id = FLOW_STYLE_ID
    el.textContent = FLOW_CSS
    document.head.appendChild(el)
  }, [flow])

  const blurImg = (
    <img
      src={ img }
      alt=""
      aria-hidden
      className="absolute left-0 top-0 object-cover"
      style={ {
        width: `${bgScale * 100}%`,
        height: `${bgScale * 100}%`,
        filter: `blur(${blur})`,
        animation: flow
          ? `blurImgDrift ${flowDuration}s ease-in-out infinite alternate both`
          : undefined,
      } }
    />
  )

  return (
    <div
      className={ cn(
        'BlurBgImgContainer relative overflow-hidden',
        className,
      ) }
      style={ { '--flow-amp': flowAmplitude, ...style } as React.CSSProperties }
    >
      { flow
        ? (
          <div
            className="absolute inset-0 overflow-hidden"
            style={ { animation: `blurHueShift ${(flowDuration * 1.7).toFixed(1)}s ease-in-out infinite alternate both` } }
          >
            { blurImg }
          </div>
        )
        : blurImg }

      { showForeground && (
        <div
          className={ cn(
            'relative z-2 flex justify-center items-center size-full',
            imgClassName,
          ) }
        >
          { children
            ? <>{ children }</>
            : (
              <img
                alt=""
                src={ img }
                className="h-full object-contain"
                { ...imgProps }
              />
            ) }
        </div>
      ) }
    </div>
  )
})

BlurBgImg.displayName = 'BlurBgImg'
