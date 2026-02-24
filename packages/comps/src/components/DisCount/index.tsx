import { memo } from 'react'
import { cn } from 'utils'

interface DiscountPriceProps {
  originalPrice: number
  discountedPrice?: number
  currency?: string
  className?: string
  originalPriceClassName?: string
  discountedPriceClassName?: string
}

export const Discount = memo<DiscountPriceProps>(({
  originalPrice,
  discountedPrice,
  currency = '$',
  className,
  originalPriceClassName,
  discountedPriceClassName,
}) => {
  const discount = discountedPrice
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0

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
          { currency }
          { originalPrice.toFixed(2) }

          <div className="absolute left-0 top-1/2 h-[2px] w-full transform bg-current -rotate-12"></div>
        </div>
      </div>

      {/* 折后价 */ }
      { discountedPrice && (
        <div className={ cn(
          'text-lg relative',
          discountedPriceClassName,
        ) }>
          { currency }
          { discountedPrice.toFixed(2) }

          { discountedPrice && (
            <div className="absolute right-0 rounded-xs from-red-500 to-red-600 bg-linear-to-r px-1.5 py-0.5 text-xs text-white font-semibold shadow-2xs -top-4 dark:from-red-600 dark:to-red-700">
              -
              { discount }
              %
            </div>
          ) }
        </div>
      ) }
    </div>
  )
})

Discount.displayName = 'Discount'
