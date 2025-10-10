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
      alt="Background Image"
      className="absolute left-0 top-0 object-cover"
      style={ {
        width: '125%',
        height: '125%',
        filter: `blur(${blur})`,
      } }
    />

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
}
& React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
