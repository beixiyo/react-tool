import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { memo } from 'react'
import { cn } from 'utils'

export interface TipButtonProps {
  /** 按钮内容 */
  children: ReactNode
  /** 点击事件处理函数 */
  onClick?: () => void
  /** 是否显示呼吸光环动画 */
  showPulse?: boolean
  /** 是否显示右上角红点提示 */
  showBadge?: boolean
  /** 自定义按钮类名 */
  className?: string
  /** 自定义按钮样式 */
  style?: React.CSSProperties
  /** 光环动画颜色（rgba格式） */
  pulseColor?: string
  /** 按钮变体颜色 */
  variant?: 'default' | 'blue' | 'red' | 'green' | 'purple'
}

export const TipButton = memo(({
  children,
  onClick,
  showPulse = true,
  showBadge = true,
  className = '',
  style,
  pulseColor,
  variant = 'default',
}: TipButtonProps) => {
  /** 根据变体设置不同的颜色样式 */
  const variantStyles = {
    default: {
      button: 'border-blue-100 bg-white/80 text-blue-600 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700/80 dark:text-blue-400 dark:hover:bg-gray-600',
      pulse: pulseColor || 'rgba(59, 130, 246, 0.15)',
      badge: 'bg-red-500',
    },
    blue: {
      button: 'border-blue-100 bg-white/80 text-blue-600 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700/80 dark:text-blue-400 dark:hover:bg-gray-600',
      pulse: pulseColor || 'rgba(59, 130, 246, 0.15)',
      badge: 'bg-red-500',
    },
    red: {
      button: 'border-red-100 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50',
      pulse: pulseColor || 'rgba(220, 38, 38, 0.15)',
      badge: 'bg-blue-500',
    },
    green: {
      button: 'border-green-100 bg-green-50 text-green-600 hover:bg-green-100 dark:border-green-900 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50',
      pulse: pulseColor || 'rgba(16, 185, 129, 0.15)',
      badge: 'bg-red-500',
    },
    purple: {
      button: 'border-purple-100 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50',
      pulse: pulseColor || 'rgba(124, 58, 237, 0.15)',
      badge: 'bg-yellow-500',
    },
  }

  const currentStyle = variantStyles[variant]

  return (
    <motion.div
      whileHover={ { scale: 1.02 } }
      whileTap={ { scale: 0.98 } }
      className="relative"
      style={ style }
    >
      { showPulse && (
        <motion.div
          animate={ {
            boxShadow: [
              `0 0 0 0 rgba(59, 130, 246, 0)`,
              `0 0 0 2px rgba(59, 130, 246, 0.05)`,
              `0 0 0 4px rgba(59, 130, 246, 0.1)`,
              `0 0 0 6px ${currentStyle.pulse}`,
              `0 0 0 4px rgba(59, 130, 246, 0.1)`,
              `0 0 0 2px rgba(59, 130, 246, 0.05)`,
              `0 0 0 0 rgba(59, 130, 246, 0)`,
            ],
          } }
          transition={ {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'mirror',
            times: [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1],
          } }
          className="rounded-full"
        >
          <button
            onClick={ onClick }
            className={ cn(
              'group flex items-center relative gap-2 overflow-hidden border rounded-full px-4 py-2 backdrop-blur-xs transition-all',
              currentStyle.button,
              className,
            ) }
          >
            { children }
          </button>
        </motion.div>
      ) }

      { !showPulse && (
        <button
          onClick={ onClick }
          className={ cn(
            'group relative flex gap-2 overflow-hidden border rounded-full px-4 py-2 backdrop-blur-xs transition-all',
            currentStyle.button,
            className,
          ) }
        >
          { children }
        </button>
      ) }

      { showBadge && (
        <motion.div
          className={ cn(
            'absolute h-2 w-2 rounded-full -right-1 -top-1',
            currentStyle.badge,
          ) }
          animate={ {
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          } }
          transition={ {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'mirror',
          } }
        />
      ) }
    </motion.div>
  )
})

TipButton.displayName = 'TipButton'
