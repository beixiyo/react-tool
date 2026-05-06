'use client'

import cn from 'clsx'

/**
 * 响应式换行符 —— 在不同视口下控制文案断行位置
 *
 * 底层即原生 `<br />`，通过 CSS `display` 切换是否生效
 * 常用于同一段文案在移动端与桌面端需要不同分行点的场景
 *
 * @example
 * ```tsx
 * // 直接使用
 * Premium quality<Br mobile /> for everyday<Br desktop /> comfort
 *
 * // i18n 富文本占位符（推荐）
 * <Trans
 *   i18nKey="hero.title"
 *   components={ { brM: <Br mobile />, brD: <Br desktop /> } }
 * />
 * ```
 */
export interface BrProps extends React.ComponentProps<'br'> {
  /** 仅在移动端 (<md) 生效，桌面端隐藏 */
  mobile?: boolean
  /** 仅在桌面端 (>=md) 生效，移动端隐藏 */
  desktop?: boolean
}

export function Br({ mobile, desktop, className, ...props }: BrProps) {
  return (
    <br
      { ...props }
      className={ cn(
        mobile && 'md:hidden',
        desktop && 'hidden md:inline',
        className,
      ) }
    />
  )
}
