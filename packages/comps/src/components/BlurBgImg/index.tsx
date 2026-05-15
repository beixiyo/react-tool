import { memo } from 'react'
import { cn } from 'utils'

export const BlurBgImg = memo<BlurBgImgProps>((
  {
    style,
    className,
    imgClassName,
    img,
    children,
    blur = '15px',
    showForeground = true,
    ...imgProps
  },
) => {
  return <div
    className={ cn(
      'BlurBgImgContainer relative overflow-hidden',
      className,
    ) }
    style={ style }
  >
    <img
      src={ img }
      alt=""
      aria-hidden
      className="absolute left-0 top-0 object-cover"
      style={ {
        width: '125%',
        height: '125%',
        filter: `blur(${blur})`,
      } }
    />

    { showForeground && (
      <div className={ cn(
        'relative z-2 flex justify-center items-center size-full',
        imgClassName,
      ) }>
        {
          children
            ? <>{ children }</>
            : <img
                src={ img }
                className="h-full object-contain"
                { ...imgProps }
              />
        }
      </div>
    ) }
  </div>
})

BlurBgImg.displayName = 'BlurBgImg'

export type BlurBgImgProps = {
  className?: string
  imgClassName?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  img: string
  blur?: string
  /**
   * 是否渲染前景层（原图或 children），默认 true。
   * 设为 false 时只渲染模糊背景，适合纯背景装饰场景。
   * @default true
   */
  showForeground?: boolean
}
& React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
