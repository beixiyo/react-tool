import { memo } from 'react'
import { cn } from 'utils'

/**
 * 流体玻璃背景组件
 */
export const LiquidGlassBackground = memo<LiquidGlassBackgroundProps>(({
  children,
  className,
  style,
  backgroundImage = 'https://images.pexels.com/photos/11958639/pexels-photo-11958639.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
  backgroundSize = '500px',
  animationDuration = '60s',
  ...props
}) => {
  return (
    <div
      className={ cn(
        'min-h-screen flex items-center justify-center',
        'font-sans font-light',
        className,
      ) }
      style={ {
        backgroundImage: `url("${backgroundImage}")`,
        backgroundPosition: 'center center',
        backgroundSize,
        animation: `moveBackground ${animationDuration} linear infinite`,
        ...style,
      } }
      { ...props }
    >
      { children }

      {/* SVG滤镜定义 */ }
      <svg style={ { display: 'none' } }>
        <filter
          id="glass-distortion"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          filterUnits="objectBoundingBox"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01 0.01"
            numOctaves="1"
            seed="5"
            result="turbulence"
          />

          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
          </feComponentTransfer>

          <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />

          <feSpecularLighting
            in="softMap"
            surfaceScale="5"
            specularConstant="1"
            specularExponent="100"
            lightingColor="white"
            result="specLight"
          >
            <fePointLight x="-200" y="-200" z="300" />
          </feSpecularLighting>

          <feComposite
            in="specLight"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="1"
            k4="0"
            result="litImage"
          />

          <feDisplacementMap
            in="SourceGraphic"
            in2="softMap"
            scale="150"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <style>
        { `
        @keyframes moveBackground {
          from {
            background-position: 0% 0%;
          }
          to {
            background-position: 0% -1500%;
          }
        }
      `}
      </style>
    </div>
  )
})

LiquidGlassBackground.displayName = 'LiquidGlassBackground'

export type LiquidGlassBackgroundProps = {
  /**
   * 背景图片URL
   * @default 'https://www.publicdomainpictures.net/pictures/610000/velka/seamless-floral-wallpaper-art-1715193626Gct.jpg'
   */
  backgroundImage?: string
  /**
   * 背景图片大小
   * @default '500px'
   */
  backgroundSize?: string
  /**
   * 动画持续时间
   * @default '60s'
   */
  animationDuration?: string
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
