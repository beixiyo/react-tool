import type { ReactNode } from 'react'
import { memo } from 'react'
import { cn } from 'utils'
import type { DiscountPriceProps } from './types'

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
  const formatDisplayPrice = (price: number): ReactNode =>
    formatPrice
      ? formatPrice(price)
      : `${currency}${price.toFixed(fractionDigits)}`

  return (
    <div
      className={ cn(
        'flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100',
        className,
      ) }
    >
      { /* 原价 */ }
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

      { /* 折后价 */ }
      { hasDiscountedPrice && (
        <div
          className={ cn(
            'text-lg relative',
            discountedPriceClassName,
          ) }
        >
          { formatDisplayPrice(discountedPrice) }

          { discount > 0 && (
            renderBadge
              ? renderBadge(discount)
              : (
                <div
                  className={ cn(
                    'absolute right-0 rounded-xs from-red-500 to-red-600 bg-linear-to-r px-1.5 py-0.5 text-xs text-white font-semibold shadow-2xs -top-4 dark:from-red-600 dark:to-red-700',
                    badgeClassName,
                  ) }
                >
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
