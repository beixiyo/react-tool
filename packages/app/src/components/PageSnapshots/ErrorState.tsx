import { motion, type MotionProps } from 'framer-motion'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from 'utils'

/**
 * 错误状态组件
 *
 * 显示错误信息并提供重试功能
 * 包含错误图标、提示文本和重试按钮
 *
 * @example
 * ```tsx
 * <ErrorState
 *   message="网络连接失败，请检查网络设置"
 *   onRetry={() => window.location.reload()}
 * />
 * ```
 */
export function ErrorState({
  message = '加载页面截图时出现错误',
  onRetry,
  className = '',
  ...rest
}: ErrorStateProps) {
  return (
    <motion.div
      initial={ { opacity: 0, y: 20 } }
      animate={ { opacity: 1, y: 0 } }
      exit={ { opacity: 0, y: -20 } }
      className={ cn(`flex flex-col items-center justify-center py-16`, className) }
      { ...rest }
    >
      {/* 错误图标 */ }
      <motion.div
        initial={ { scale: 0 } }
        animate={ { scale: 1 } }
        transition={ { delay: 0.1, type: 'spring', stiffness: 200 } }
        className="mb-6 h-16 w-16 text-red-500 dark:text-red-400"
      >
        <AlertCircle className="h-full w-full" />
      </motion.div>

      {/* 错误信息 */ }
      <motion.h3
        initial={ { opacity: 0 } }
        animate={ { opacity: 1 } }
        transition={ { delay: 0.2 } }
        className="mb-2 text-xl text-gray-800 font-semibold dark:text-gray-200"
      >
        出现错误
      </motion.h3>

      <motion.p
        initial={ { opacity: 0 } }
        animate={ { opacity: 1 } }
        transition={ { delay: 0.3 } }
        className="mb-6 max-w-md text-center text-gray-600 dark:text-gray-400"
      >
        { message }
      </motion.p>

      {/* 重试按钮 */ }
      { onRetry && (
        <motion.button
          initial={ { opacity: 0, y: 10 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { delay: 0.4 } }
          whileHover={ { scale: 1.05 } }
          whileTap={ { scale: 0.95 } }
          onClick={ onRetry }
          className="flex items-center rounded-lg bg-blue-500 px-6 py-3 text-white font-medium shadow-lg transition-colors duration-200 space-x-2 hover:bg-blue-600 hover:shadow-xl"
        >
          <RefreshCw className="h-4 w-4" />
          <span>重试</span>
        </motion.button>
      ) }

      {/* 装饰性元素 */ }
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={ { opacity: 0 } }
        animate={ { opacity: 0.1 } }
        transition={ { delay: 0.5 } }
      >
        <div className="absolute left-1/4 top-1/4 h-32 w-32 rounded-full bg-red-500 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-24 w-24 rounded-full bg-orange-500 blur-3xl" />
      </motion.div>
    </motion.div>
  )
}

export type ErrorStateProps = {
  message?: string
  onRetry?: () => void
  className?: string
}
  & React.HTMLAttributes<HTMLDivElement>
  & MotionProps
