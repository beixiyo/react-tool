'use client'

import type { SnapshotCardProps } from './types'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

/**
 * 截图卡片组件
 */
export function SnapshotCard({
  data,
  onClick,
  className = '',
}: SnapshotCardProps) {
  const { pageInfo } = data

  const handleClick = () => {
    onClick?.(pageInfo)
  }

  return (
    <motion.div
      layout
      onClick={ handleClick }
      className={ `
        group relative bg-gray-800/30 rounded-xl shadow-lg hover:shadow-xl
        transition-all duration-300 cursor-pointer overflow-hidden border
        border-gray-700  hover:border-blue-600
        ${className}
      ` }
    >
      {/* 文本描述模式 */ }
      <div className="p-4">
        {/* 顶部标识与外链图标 */ }
        <div className="mb-2 flex items-center justify-between">
          <motion.span
            initial={ { opacity: 0, x: -8 } }
            animate={ { opacity: 1, x: 0 } }
            className={ `
              px-2 py-1 text-xs font-medium rounded-full
              ${pageInfo.type === 'view'
      ? 'bg-green-900 text-green-200'
      : 'bg-blue-900 text-blue-200'}
            ` }
          >
            { pageInfo.type === 'view'
              ? '页面'
              : '组件' }
          </motion.span>

          <div className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="h-8 w-8 flex items-center justify-center rounded-full shadow-lg bg-gray-800">
              <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        </div>

        <motion.h3
          className="mb-1 font-semibold transition-colors duration-200 text-gray-100 group-hover:text-blue-400"
          layoutId={ `title-${pageInfo.path}` }
        >
          { pageInfo.name }
        </motion.h3>

        { pageInfo.description && (
          <motion.p
            className="mb-3 text-sm text-gray-400"
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
          >
            { pageInfo.description }
          </motion.p>
        ) }

        <div className="flex items-center justify-between">
          <motion.span
            className="text-xs font-mono text-gray-500"
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
          >
            { pageInfo.path }
          </motion.span>

          { pageInfo.category && (
            <motion.span
              className="text-xs text-gray-500"
              initial={ { opacity: 0 } }
              animate={ { opacity: 1 } }
            >
              { pageInfo.category }
            </motion.span>
          ) }
        </div>
      </div>
    </motion.div>
  )
}
