import type { ReactNode } from 'react'
import { memo } from 'react'
import { cn } from 'utils'

export const Discount = memo<DiscountPriceProps>(({
  originalPrice,
  discountedPrice,
  currency = '$',
  fractionDigits = 2,
  formatPrice,
  renderBadge,
  badgeClassName,
  className,
  originalPriceClassName,
  discountedPriceClassName,
}) => {
  const hasDiscountedPrice = discountedPrice != null

  /** originalPrice <= 0 时无法计算折扣，兜底为 0；并 clamp 到 [0, 100] 防止负折扣/越界 */
  const discount = hasDiscountedPrice && originalPrice > 0
    ? Math.min(100, Math.max(0, Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)))
    : 0

  /** 价格展示：优先使用 formatPrice，否则维持原有 `{currency}{toFixed}` 行为 */
  const formatDisplayPrice = (price: number): ReactNode => formatPrice
    ? formatPrice(price)
    : `${currency}${price.toFixed(fractionDigits)}`

  return (
    <div className={ cn(
      'flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100',
      className,
    ) }>

      {/* 原价 */ }
      <div
        className={ cn(
          'relative text-lg text-gray-500 dark:text-gray-400 self-end',
          originalPriceClassName,
        ) }
      >
        <div
          className={ cn(
            'relative inline-block',
          ) }
        >
          { formatDisplayPrice(originalPrice) }

          <div className="absolute left-0 top-1/2 h-[2px] w-full transform bg-current -rotate-12"></div>
        </div>
      </div>

      {/* 折后价 */ }
      { hasDiscountedPrice && (
        <div className={ cn(
          'text-lg relative',
          discountedPriceClassName,
        ) }>
          { formatDisplayPrice(discountedPrice) }

          { discount > 0 && (
            renderBadge
              ? renderBadge(discount)
              : (
                  <div className={ cn(
                    'absolute right-0 rounded-xs from-red-500 to-red-600 bg-linear-to-r px-1.5 py-0.5 text-xs text-white font-semibold shadow-2xs -top-4 dark:from-red-600 dark:to-red-700',
                    badgeClassName,
                  ) }>
                    -
                    { discount }
                    %
                  </div>
                )
          ) }
        </div>
      ) }
    </div>
  )
})

Discount.displayName = 'Discount'

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
