'use client'

import type { SnapshotCardProps } from './types'
import { motion } from 'framer-motion'
import { AlertCircle, ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useState } from 'react'

/**
 * 截图卡片组件
 */
export function SnapshotCard({
  data,
  onClick,
  className = '',
  showDetails = true,
}: SnapshotCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const { pageInfo, snapshot, status, error } = data

  const handleClick = () => {
    onClick?.(pageInfo)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <motion.div
      layout
      initial={ { opacity: 0, y: 20 } }
      animate={ { opacity: 1, y: 0 } }
      exit={ { opacity: 0, y: -20 } }
      whileHover={ { y: -4, scale: 1.02 } }
      whileTap={ { scale: 0.98 } }
      onClick={ handleClick }
      className={ `
        group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl
        transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200
        dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600
        ${className}
      ` }
    >
      {/* 截图预览区域 */ }
      <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
        { status === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={ { opacity: 0.6 } }
              animate={ { opacity: [0.6, 1, 0.6] } }
              transition={ { duration: 2, repeat: Infinity, ease: 'easeInOut' } }
              className="h-full w-full flex items-center justify-center from-gray-200 to-gray-300 bg-linear-to-br dark:from-gray-600 dark:to-gray-700"
            >
              <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </motion.div>
          </div>
        ) }

        { status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <motion.div
              animate={ { rotate: 360 } }
              transition={ { duration: 1, repeat: Infinity, ease: 'linear' } }
            >
              <Loader2 className="h-8 w-8 text-blue-500" />
            </motion.div>
            <motion.div
              className="absolute bottom-2 left-2 right-2"
              initial={ { opacity: 0 } }
              animate={ { opacity: 1 } }
              transition={ { delay: 0.5 } }
            >
              <div className="h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <motion.div
                  className="h-full rounded-full bg-blue-500"
                  initial={ { width: '0%' } }
                  animate={ { width: '100%' } }
                  transition={ { duration: 2, repeat: Infinity, ease: 'easeInOut' } }
                />
              </div>
            </motion.div>
          </div>
        ) }

        { status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-gray-500 dark:bg-red-900/20 dark:text-gray-400">
            <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
            <span className="text-sm">截图失败</span>
          </div>
        ) }

        { status === 'success' && snapshot && (
          <>
            { !imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
            ) }

            <motion.img
              src={ snapshot.imgUrl }
              alt={ pageInfo.name }
              className={ `
                w-full h-full object-cover transition-opacity duration-300
                ${imageLoaded
            ? 'opacity-100'
            : 'opacity-0'}
              ` }
              onLoad={ handleImageLoad }
              onError={ handleImageError }
              initial={ { scale: 1.1 } }
              animate={ {
                scale: imageLoaded
                  ? 1
                  : 1.1,
              } }
              transition={ { duration: 0.3 } }
            />

            { imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <ImageIcon className="mb-2 h-8 w-8" />
                <span className="text-sm">图片加载失败</span>
              </div>
            ) }
          </>
        ) }

        {/* 悬停遮罩 */ }
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-20"
          initial={ false }
        />

        {/* 外部链接图标 */ }
        <motion.div
          className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          whileHover={ { scale: 1.1 } }
          whileTap={ { scale: 0.9 } }
        >
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800">
            <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
        </motion.div>

        {/* 页面类型标签 */ }
        <div className="absolute left-3 top-3">
          <motion.span
            initial={ { opacity: 0, x: -10 } }
            animate={ { opacity: 1, x: 0 } }
            className={ `
              px-2 py-1 text-xs font-medium rounded-full
              ${pageInfo.type === 'view'
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
            ` }
          >
            { pageInfo.type === 'view'
              ? '页面'
              : '组件' }
          </motion.span>
        </div>
      </div>

      {/* 卡片信息区域 */ }
      { showDetails && (
        <div className="p-4">
          <motion.h3
            className="mb-1 text-gray-900 font-semibold transition-colors duration-200 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            layoutId={ `title-${pageInfo.path}` }
          >
            { pageInfo.name }
          </motion.h3>

          { pageInfo.description && (
            <motion.p
              className="line-clamp-2 mb-2 text-sm text-gray-600 dark:text-gray-400"
              initial={ { opacity: 0 } }
              animate={ { opacity: 1 } }
              transition={ { delay: 0.1 } }
            >
              { pageInfo.description }
            </motion.p>
          ) }

          <div className="flex items-center justify-between">
            <motion.span
              className="text-xs text-gray-500 font-mono dark:text-gray-500"
              initial={ { opacity: 0 } }
              animate={ { opacity: 1 } }
              transition={ { delay: 0.2 } }
            >
              { pageInfo.path }
            </motion.span>

            { pageInfo.category && (
              <motion.span
                className="text-xs text-gray-500 dark:text-gray-500"
                initial={ { opacity: 0 } }
                animate={ { opacity: 1 } }
                transition={ { delay: 0.3 } }
              >
                { pageInfo.category }
              </motion.span>
            ) }
          </div>
        </div>
      ) }

      {/* 加载进度条 */ }
      { status === 'loading' && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-blue-500"
          initial={ { width: 0 } }
          animate={ { width: '100%' } }
          transition={ { duration: 2, repeat: Infinity } }
        />
      ) }
    </motion.div>
  )
}
