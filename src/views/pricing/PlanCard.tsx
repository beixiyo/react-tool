import type { PaymentTypeEnum } from './types'
import { Discount } from '@/components/DisCount'
import { SplitLine } from '@/components/SplitLine'
import { cn } from '@/utils'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const PlanCard = memo(({
  plan,
  index,
  isSelected,
  onClick,
  onChoosePlan,
  className,
}: PlanCardProps) => {
  return (
    <motion.div
      layout
      initial={ { opacity: 0, y: 30 } }
      animate={ { opacity: 1, y: 0 } }
      exit={ { opacity: 0, y: -20 } }
      transition={ {
        duration: 0.3,
        delay: index * 0.15,
        ease: [0.23, 1, 0.32, 1],
      } }
      className={ cn(
        'flex flex-col rounded-2xl p-6 cursor-pointer transition-all duration-300 relative',
        'shadow-blue-500/40 ring-1 ring-blue-500/20',
        isSelected
          ? 'bg-blue-900/20 shadow-xl ring-blue-500/40'
          : 'bg-gray-800/20',
        'hover:shadow-xl hover:ring-blue-500/40 !hover:-translate-y-2',
        className,
      ) }
      onClick={ () => onClick?.(plan) }
    >
      <div className="mb-8">
        <h3 className="text-center text-lg text-gray-100">
          { plan.title }
        </h3>
      </div>

      <div className="">
        <div className="text-center">
          { Number.isNaN(Number.parseInt(plan.price))
            ? <div className="text-2xl text-white font-bold">{ plan.price }</div>
            : <Discount
                originalPrice={ Number.parseInt(plan.price) }
                discountedPrice={ Number.parseInt(plan.discountedPrice) }
                currency="$"
                className="inline-flex!"
                originalPriceClassName="text-gray-400"
                discountedPriceClassName="text-white text-2xl font-bold"
              /> }

          { plan.priceUnit && <span className="ml-2 text-gray-300">{ plan.priceUnit }</span> }
        </div>

        <p className="mt-2 text-center text-sm text-gray-400">
          { plan.desc }
        </p>
      </div>

      <SplitLine innerClassName="bg-white" className="mb-6 mt-3"></SplitLine>

      <ul className="mb-8 flex-1 space-y-4">
        { plan.features.map((feature, index) => (
          <li key={ index } className="flex items-center text-sm text-white">
            <Check className="mr-3 size-5 text-blue-500" />

            { feature.map((item, index) =>
              <div
                key={ index }
                className={ cn(
                  'max-w-48',
                  item.className,
                ) }
              >
                { item.text }
                &nbsp;
              </div>,
            ) }
          </li>
        )) }
      </ul>

      <button
        onClick={ () => onChoosePlan?.(plan) }
        className={ cn(
          'rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-600',
          isSelected
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700/50 text-gray-200',
        ) }
      >
        Choose plan
      </button>

      { plan.yearPrice && <p className="mt-4 text-center text-sm text-gray-400">
        { plan.yearPrice }
      </p> }
    </motion.div>
  )
})

PlanCard.displayName = 'PlanCard'

export default PlanCard

export type PlanData = {
  title: string
  price: string
  discountedPrice: string
  priceUnit: string
  desc: string
  features: {
    text: string
    className?: string
  }[][]
  yearPrice: string
  paymentType: PaymentTypeEnum
}

export type PlanCardProps = {
  plan: PlanData
  /** 卡片索引，用于延迟动画 */
  index: number
  /** 是否被选中 */
  isSelected?: boolean
  /** 点击套餐的回调 */
  onClick?: (plan: PlanData) => void
  onChoosePlan?: (plan: PlanData) => void
  /** 自定义类名 */
  className?: string
}
