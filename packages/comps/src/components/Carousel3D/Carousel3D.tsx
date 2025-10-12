'use client'

import type { Carousel3DProps } from './type'
import cn from 'clsx'

/**
 * 3D 轮播图组件
 */
export const Carousel3D = memo((
  {
    className,
    style,
    srcs,

    offsetStep = 100,
    scaleStep = 0.6,
    opacityStep = 0.5,
    imgWidth = 400,

    initIndex = 1,
    duration = 2000,
    autoPlay = true,

    childern,
  }: Carousel3DProps,
) => {
  const [curIndex, setCurIndex] = useState(initIndex)
  const timerId = useRef<number>(null)

  function getStyle(i: number) {
    /** 和当前图片的距离差值 */
    const dis = Math.abs(i - curIndex)
    /** 距离差值的符号 */
    const sign = Math.sign(i - curIndex)

    /**
     * 计算左右两边的 translateX
     */
    let xOffset = (i - curIndex) * offsetStep
    if (i !== curIndex) {
      /**
       * 如果是前一张图片，则偏移值为负数
       * 由于这里是相加，所以要乘以符号
       */
      xOffset = xOffset + offsetStep * sign
    }

    const scale = scaleStep ** dis
    const rotateY = 45 * -sign

    return {
      transition: '.4s',
      willChange: 'transform, opacity, z-index',
      transform: `translateX(${xOffset}px) scale(${scale}) rotateY(${rotateY}deg)`,
      opacity: opacityStep ** dis,
      zIndex: srcs.length - dis,

      width: `${imgWidth}px`,
      height: '100%',
      marginLeft: `-${imgWidth / 2}px`,

      position: 'absolute',
      top: 0,
      left: '50%',

    } as React.CSSProperties
  }

  /***************************************************
   *                    Events
   ***************************************************/
  function next() {
    let index = curIndex + 1
    if (index > srcs.length - 1) {
      index = srcs.length - 1
    }

    setCurIndex(index)
  }

  function prev() {
    let index = curIndex + 1
    if (index < 0) {
      index = 0
    }

    setCurIndex(index)
  }

  function autoPlayFn() {
    timerId.current = window.setInterval(() => {
      let index = curIndex + 1
      if (index > srcs.length - 1) {
        index = 0
      }
      setCurIndex(index)
    }, duration)

    function clear() {
      timerId.current && clearInterval(timerId.current)
    }

    return clear
  }

  /***************************************************
   *                    Render
   ***************************************************/
  const renderItem = (src: string, index: number) =>
    childern
      ? childern(getStyle(index), src, index)
      : (
          <img
            className="carouselItem"
            style={ getStyle(index) }
            src={ src }
            alt={ `slider-${index}` }
            key={ index }
            decoding="async"
            loading="lazy"
          />
        )

  /***************************************************
   *                    Effects
   ***************************************************/
  useEffect(() => {
    if (!autoPlay)
      return
    return autoPlayFn()
  }, [autoPlay, curIndex, srcs])

  return (
    <div
      className={ cn('carousel size-full relative overflow-hidden group', className) }
      style={ style }
    >
      <div
        className="carouselList relative size-full"
        style={ {
          perspective: 1000,
          transformStyle: 'preserve-3d',
        } }
      >
        { srcs.map((src, i) => renderItem(src, i)) }
      </div>

      {/* Indicator */ }
      <div
        className={ `indicator absolute top-1/2 left-1 -translate-y-1/2 transition duration-300
      text-white/50 cursor-pointer select-none rounded-full opacity-0
      hover:bg-black/10 hover:text-white group-hover:opacity-100` }
        style={ {
          fontSize: '1.8rem',
          padding: '0.2rem 1rem',
        } }
        onClick={ prev }
      >
        ❮
      </div>
      <div
        className={ `indicator absolute top-1/2 right-1 -translate-y-1/2 transition duration-300
      text-white/50 cursor-pointer select-none rounded-full opacity-0
      hover:bg-black/10 hover:text-white group-hover:opacity-100` }
        style={ {
          fontSize: '1.8rem',
          padding: '0.2rem 1rem',
        } }
        onClick={ next }
      >
        ❯
      </div>
    </div>
  )
})

Carousel3D.displayName = 'Carousel'
