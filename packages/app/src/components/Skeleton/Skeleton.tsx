import { useTheme } from 'hooks'
import { memo } from 'react'
import { cn } from 'utils'
import styles from './styles.module.scss'

export const Skeleton = memo<SkeletonProps>((props) => {
  const [theme] = useTheme()

  const {
    className,
    style,
    active = true,
    baseColor = theme === 'light'
      ? '#e2e8f0'
      : '#334155',
    highlightColor = theme === 'light'
      ? '#cbd5e1'
      : '#475569',
    animationDuration = 1,
    rounded = false,
    size,
    children,
    ...rest
  } = props

  // 预设尺寸样式
  const sizeClasses = {
    xs: 'h-3 w-16',
    sm: 'h-4 w-24',
    md: 'h-5 w-32',
    lg: 'h-6 w-48',
    xl: 'h-8 w-64',
    full: 'h-full w-full',
  }

  return (
    <div
      className={ cn(
        'animate-skeleton',
        styles.skeleton,
        rounded && 'rounded-full',
        size && sizeClasses[size],
        className,
      ) }
      style={ {
        ...(active && {
          backgroundSize: '400%',
          backgroundImage: `linear-gradient(to right,
            ${baseColor} 0, ${baseColor} 30%,
            ${highlightColor} 45%, ${highlightColor} 50%,
            ${baseColor} 60%, ${baseColor})`,
          animationDuration: `${animationDuration}s`,
        }),
        ...style,
      } }
      { ...rest }
    >
      { children }
    </div>
  )
})

export type SkeletonProps = {
  className?: string
  style?: React.CSSProperties
  /**
   * 是否激活
   * @default true
   */
  active?: boolean
  /**
   * 基础颜色
   * @default 根据主题自动设置
   */
  baseColor?: string
  /**
   * 高亮颜色
   * @default 根据主题自动设置
   */
  highlightColor?: string
  /**
   * 动画持续时间（秒）
   * @default 1
   */
  animationDuration?: number
  /**
   * 是否圆角
   * @default false
   */
  rounded?: boolean
  /**
   * 预设尺寸
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>
