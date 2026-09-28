import type { ReactNode } from 'react'

export type DiscountPriceProps = {
  /** 原价 */
  originalPrice: number
  /** 折后价，支持 0（免费） */
  discountedPrice?: number
  /**
   * 货币前缀符号
   * @default '$'
   */
  currency?: string
  /**
   * 保留小数位数（默认行为下用于 toFixed）
   * @default 2
   */
  fractionDigits?: number
  /**
   * 自定义价格格式化函数；传入后优先于 currency / fractionDigits
   * 用于支持千分位、后缀货币（如 '100 €'）、Intl.NumberFormat 等
   * @example (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n)
   */
  formatPrice?: (price: number) => ReactNode
  /**
   * 自定义折扣徽标渲染；传入后取代默认的 `-{discount}%` 徽标
   * @param discount 折扣百分比（0-100 的整数）
   */
  renderBadge?: (discount: number) => ReactNode
  /** 折扣徽标自定义类名（仅在使用默认徽标时生效） */
  badgeClassName?: string
  /** 根容器自定义类名 */
  className?: string
  /** 原价区域自定义类名 */
  originalPriceClassName?: string
  /** 折后价区域自定义类名 */
  discountedPriceClassName?: string
}
