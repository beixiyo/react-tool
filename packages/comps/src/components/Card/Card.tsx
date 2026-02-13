import type { Rounded, SemanticVariant, Size } from '../../types'
import { useTheme } from 'hooks'
import { forwardRef, memo } from 'react'
import { cn } from 'utils'
import { getRoundedStyles } from '../../utils/roundedUtils'

export type CardVariant = SemanticVariant | 'primary' | 'transparent' | 'glass' | 'dark'
export type CardPadding = 'none' | 'sm' | 'default' | 'lg' | 'xl'
export type CardShadow = 'none' | Exclude<Size, number> | 'xl' | '2xl' | 'inner' | number

export const Card = memo(forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const [theme] = useTheme()
  const {
    style,
    className,
    children,
    title,
    image,
    footer,
    headerClassName,
    bodyClassName,
    footerClassName,
    imageClassName,
    imageStyle,
    imageAlt = '',
    variant = 'default',
    bordered = theme !== 'light',
    shadow = 'md',
    rounded = 'xl',
    headerDivider = false,
    footerDivider = false,
    headerActions,
    hoverEffect = true,
    padding = 'default',
    ...rest
  } = props

  const shadowClasses = {
    'none': '',
    'sm': 'shadow-sm',
    'md': 'shadow-md',
    'lg': 'shadow-lg',
    'xl': 'shadow-xl',
    '2xl': 'shadow-2xl',
    'inner': 'shadow-inner',
  }

  /** 获取阴影样式（使用 text 变量实现主题自适应阴影） */
  const getShadowStyles = () => {
    if (typeof shadow === 'number') {
      const alpha1 = shadow / 100
      const alpha2 = shadow / 150
      return {
        className: undefined,
        style: {
          boxShadow: `0 4px 6px -1px rgb(var(--text) / ${alpha1}), 0 2px 4px -1px rgb(var(--text) / ${alpha2})`,
        },
      }
    }
    return {
      className: shadowClasses[shadow],
      style: undefined,
    }
  }

  const shadowStyles = getShadowStyles()

  const { className: roundedClass, style: roundedStyle } = getRoundedStyles(rounded)

  const variantClasses = {
    default: 'bg-background text-text',
    primary: 'toning-blue toning-blue-border',
    success: 'toning-green toning-green-border',
    warning: 'toning-yellow toning-yellow-border',
    danger: 'toning-red toning-red-border',
    info: 'bg-infoBg text-info',
    transparent: 'bg-transparent',
    glass: 'bg-background/70 backdrop-blur-md text-text',
    dark: 'bg-background2 text-text',
  }

  const paddingClasses = {
    none: '',
    sm: 'p-2',
    default: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  }

  const hoverClasses = hoverEffect
    ? 'transition-all duration-300 hover:shadow-lg hover:border-border3'
    : ''

  const sectionPaddingClass = paddingClasses[padding]

  return (
    <div
      className={ cn(
        'flex flex-col overflow-hidden',
        variantClasses[variant],
        roundedClass,
        shadowStyles.className,
        hoverClasses,
        bordered && 'border border-border',
        className,
      ) }
      style={ { ...shadowStyles.style, ...roundedStyle, ...style } }
      ref={ ref }
      { ...rest }
    >
      {/* 卡片头部 */ }
      { (title || headerActions) && (
        <div className={ cn(
          'flex items-center justify-between',
          sectionPaddingClass,
          headerDivider && 'border-b border-border',
          headerClassName,
        ) }>
          { typeof title === 'string'
            ? (
                <h3 className="text-lg font-medium">{ title }</h3>
              )
            : title }

          { headerActions && (
            <div className="flex items-center space-x-2">
              { headerActions }
            </div>
          ) }
        </div>
      ) }

      {/* 卡片图片 */ }
      { image && (
        <div className={ cn(
          'w-full overflow-hidden',
          !title && !headerActions && 'rounded-t-inherit',
          imageClassName,
        ) }>
          { typeof image === 'string'
            ? (
                <img
                  src={ image }
                  alt={ imageAlt }
                  className="h-auto w-full object-cover"
                  style={ imageStyle }
                />
              )
            : image }
        </div>
      ) }

      {/* 卡片内容 */ }
      <div className={ cn(
        'grow',
        sectionPaddingClass,
        bodyClassName,
      ) }>
        { children }
      </div>

      {/* 卡片底部 */ }
      { footer && (
        <div className={ cn(
          sectionPaddingClass,
          footerDivider && 'border-t border-border',
          footerClassName,
        ) }>
          { footer }
        </div>
      ) }
    </div>
  )
}))

Card.displayName = 'Card'

export type CardProps = {
  /**
   * 卡片标题
   */
  title?: React.ReactNode
  /**
   * 卡片图片，可以是图片URL或React节点
   */
  image?: string | React.ReactNode
  /**
   * 图片alt属性
   * @default ''
   */
  imageAlt?: string
  /**
   * 卡片底部内容
   */
  footer?: React.ReactNode
  /**
   * 卡片变体样式
   * @default 'default'
   */
  variant?: CardVariant
  /**
   * 是否显示边框
   * @default light: false, dark: true
   */
  bordered?: boolean
  /**
   * 阴影大小
   * @default 'md'
   */
  shadow?: CardShadow
  /**
   * 圆角大小
   * @default 'xl'
   */
  rounded?: Rounded | number
  /**
   * 头部是否有分隔线
   * @default false
   */
  headerDivider?: boolean
  /**
   * 底部是否有分隔线
   * @default false
   */
  footerDivider?: boolean
  /**
   * 头部右侧操作区
   */
  headerActions?: React.ReactNode
  /**
   * 头部自定义类名
   */
  headerClassName?: string
  /**
   * 内容区自定义类名
   */
  bodyClassName?: string
  /**
   * 底部自定义类名
   */
  footerClassName?: string
  /**
   * 图片容器自定义类名
   */
  imageClassName?: string
  /**
   * 图片自定义样式
   */
  imageStyle?: React.CSSProperties
  /**
   * 鼠标悬浮时显示阴影和边框效果
   * @default true
   */
  hoverEffect?: boolean
  /**
   * 卡片各区域内边距（头部/内容/底部）
   * @default 'default'
   */
  padding?: CardPadding
}
& React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
