import type { CategoryKey, CategoryValue } from './category'
import { motion } from 'framer-motion'
import { CATEGORIES } from './category'

/**
 * 分类筛选器
 */
export const CategoryFilter = memo(({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory: CategoryValue
  onSelectCategory: (category: CategoryValue) => void
}) => {
  return (
    <motion.div
      initial={ { opacity: 0, y: -20 } }
      animate={ { opacity: 1, y: 0 } }
      transition={ { duration: 0.5 } }
      className="mb-6 flex flex-wrap justify-center gap-2"
    >
      { (Object.keys(CATEGORIES) as CategoryKey[]).map(categoryKey => (
        <button
          key={ CATEGORIES[categoryKey] }
          onClick={ () => onSelectCategory(CATEGORIES[categoryKey]) }
          className={ `
            rounded-full px-4 py-2 text-sm font-medium transition-all duration-300
            focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
            ${selectedCategory === CATEGORIES[categoryKey]
          ? 'bg-blue-600 text-white shadow-lg scale-105'
          : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        }
          ` }
        >
          { categoryKey }
        </button>
      )) }
    </motion.div>
  )
})
