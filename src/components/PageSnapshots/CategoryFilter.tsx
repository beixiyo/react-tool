import type { CategoryKey, CategoryValue } from './category'
import { motion } from 'framer-motion'
import { memo } from 'react'
import { CATEGORIES } from './category'

/**
 * 分类筛选器属性
 */
export interface CategoryFilterProps {
  /** 当前选中的分类 */
  selectedCategory: CategoryValue
  /** 分类选择回调 */
  onSelectCategory: (category: CategoryValue) => void
  /** 分类统计数据 */
  stats?: Partial<Record<CategoryValue, number>>
}

/**
 * 分类筛选器
 */
export const CategoryFilter = memo<CategoryFilterProps>(({
  selectedCategory,
  onSelectCategory,
  stats = {},
}) => {
  return (
    <motion.div
      initial={ { opacity: 0, y: -20 } }
      animate={ { opacity: 1, y: 0 } }
      transition={ { duration: 0.5 } }
      className="mb-6 flex flex-wrap justify-center gap-2"
    >
      { (Object.keys(CATEGORIES) as CategoryKey[]).map((categoryKey) => {
        const categoryValue = CATEGORIES[categoryKey]
        const count = stats[categoryValue] || 0

        return (
          <button
            key={ categoryValue }
            type="button"
            onClick={ (e) => {
              e.preventDefault()
              e.stopPropagation()
              onSelectCategory(categoryValue)
            } }
            style={ { pointerEvents: 'auto', zIndex: 10 } }
            className={ [
              'rounded-full px-4 py-2 text-sm font-medium transition-all duration-300',
              'focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'dark:focus:ring-offset-gray-900 cursor-pointer',
              selectedCategory === categoryValue
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
            ].join(' ') }
          >
            { categoryKey }
            { count > 0
              ? ` (${count})`
              : '' }
          </button>
        )
      }) }
    </motion.div>
  )
})
