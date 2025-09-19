import { motion } from 'framer-motion'
import { cn } from 'utils'
import { RechargeTypeEnum } from './types'

export type PlanTypeSwitchProps = {
  /** 当前选中的计划类型 */
  value: RechargeTypeEnum
  /** 切换计划类型的回调 */
  onChange: (type: RechargeTypeEnum) => void
  /** 自定义类名 */
  className?: string
}

const PlanTypeSwitch = memo(({ value, onChange, className }: PlanTypeSwitchProps) => {
  const id = useId()
  const options = [
    { label: 'Monthly -20%', value: RechargeTypeEnum.MONTHLY },
    { label: 'Yearly -40%', value: RechargeTypeEnum.YEARLY },
    { label: 'Replenish', value: RechargeTypeEnum.REPLENISH },
  ]

  const curIndex = options.findIndex(opt => opt.value === value)

  return (
    <div className={ cn('relative flex rounded-lg bg-gray-900/80 p-1', className) }>
      <motion.div
        className="absolute inset-1 rounded-md bg-blue-600/20"
        layoutId={ id }
        transition={ { type: 'spring', stiffness: 500, damping: 35 } }
        style={ {
          width: `${100 / options.length}%`,
          left: `calc(${(curIndex * 100) / options.length}% + ${curIndex === 0
            ? 4
            : -4}px)`,
        } }
      />
      { options.map(option => (
        <button
          key={ option.value }
          onClick={ () => onChange(option.value) }
          className={ cn(
            'relative z-10 flex-1 rounded-md py-2 text-sm font-medium transition-colors',
            value === option.value
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-200',
          ) }
        >
          { option.label }
        </button>
      )) }
    </div>
  )
})

PlanTypeSwitch.displayName = 'PlanTypeSwitch'

export default PlanTypeSwitch
