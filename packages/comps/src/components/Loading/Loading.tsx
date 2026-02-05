import type { CSSProperties, ReactNode } from 'react'
import type { SkeletonProps } from '../Skeleton/Skeleton'
import { vShow } from 'hooks'
import { memo } from 'react'
import { cn } from 'utils'
import { Mask } from '../Mask'
import { Skeleton } from '../Skeleton/Skeleton'
import { LoadingIcon } from './LoadingIcon'

export const Loading = memo<LoadingProps>((
  {
    style,
    className,
    loading,
    loadingStyle,

    zIndex = 50,
    size = 50,
    variant = 'spinner',
    skeletonProps,
    custom,
    children,
  },
) => {
  const renderContent = () => {
    if (variant === 'skeleton') {
      return (
        <Skeleton
          size="full"
          { ...skeletonProps }
          className={ cn('w-full h-full', skeletonProps?.className) }
        />
      )
    }

    if (variant === 'custom') {
      return children || custom
    }

    return (
      <LoadingIcon
        size={ size }
        style={ {
          ...loadingStyle,
        } }
      />
    )
  }

  return (
    <Mask
      className={ cn(
        'flex justify-center items-center',
        variant !== 'spinner' && 'backdrop-blur-none bg-transparent',
        className,
      ) }
      style={ {
        zIndex,
        ...vShow(loading),
        ...style,
      } }
    >
      { renderContent() }
    </Mask>
  )
})
Loading.displayName = 'Loading'

export interface LoadingProps {
  className?: string
  style?: CSSProperties
  loadingStyle?: CSSProperties

  loading: boolean
  /**
   * @default 99
   */
  zIndex?: number
  size?: number

  /**
   * 加载类型
   * @default 'spinner'
   */
  variant?: 'spinner' | 'skeleton' | 'custom'

  /**
   * 骨架屏属性
   */
  skeletonProps?: SkeletonProps

  /**
   * 自定义渲染
   */
  custom?: ReactNode
  children?: ReactNode
}
