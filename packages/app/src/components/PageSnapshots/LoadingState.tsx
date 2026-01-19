import type { LoadingStateProps } from './types'
import { motion } from 'motion/react'

/**
 * 加载状态组件
 *
 * 显示加载中的状态，支持自定义文本和进度条
 * 提供流畅的动画效果
 *
 * @example
 * ```tsx
 * <LoadingState
 *   text="正在加载页面信息..."
 *   showProgress={true}
 *   progress={50}
 *   total={100}
 * />
 * ```
 */
export function LoadingState({
  text = '正在加载页面截图...',
  className = '',
  showProgress = false,
  progress = 0,
  total = 0,
}: LoadingStateProps) {
  return (
    <motion.div
      initial={ { opacity: 0, y: 20 } }
      animate={ { opacity: 1, y: 0 } }
      exit={ { opacity: 0, y: -20 } }
      className={ `flex flex-col items-center justify-center py-16 ${className}` }
    >
      {/* 加载动画 */}
      <motion.div
        className="relative mb-6 h-16 w-16"
        animate={ { rotate: 360 } }
        transition={ { duration: 2, repeat: Infinity, ease: 'linear' } }
      >
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full dark:border-gray-700" />
        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full" />
      </motion.div>

      {/* 加载文本 */}
      <motion.p
        initial={ { opacity: 0 } }
        animate={ { opacity: 1 } }
        transition={ { delay: 0.2 } }
        className="mb-4 text-lg text-gray-700 font-medium dark:text-gray-300"
      >
        {text}
      </motion.p>

      {/* 进度条 */}
      {showProgress && total > 0 && (
        <motion.div
          initial={ { opacity: 0, scale: 0.8 } }
          animate={ { opacity: 1, scale: 1 } }
          transition={ { delay: 0.4 } }
          className="max-w-full w-64"
        >
          <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              已完成
              {progress}
              {' '}
              /
              {total}
            </span>
            <span>
              {Math.round((progress / total) * 100)}
              %
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <motion.div
              className="h-2 rounded-full bg-blue-500"
              initial={ { width: 0 } }
              animate={ { width: `${(progress / total) * 100}%` } }
              transition={ { duration: 0.3, ease: 'easeOut' } }
            />
          </div>
        </motion.div>
      )}

      {/* 加载提示点 */}
      <motion.div
        className="mt-6 flex space-x-1"
        initial={ { opacity: 0 } }
        animate={ { opacity: 1 } }
        transition={ { delay: 0.6 } }
      >
        {[0, 1, 2].map(index => (
          <motion.div
            key={ index }
            className="h-2 w-2 rounded-full bg-blue-500"
            animate={ {
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            } }
            transition={ {
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
            } }
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
