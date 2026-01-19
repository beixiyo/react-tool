'use client'

import type { CategoryKey, CategoryValue } from './category'
import type { PageInfo } from './tools/getPageInfo'
import type { PageSnapshotsProps, SnapshotCardData } from './types'
import { useNavigate } from '@jl-org/react-router'
import { getPageData } from '@jl-org/tool'
import { motion } from 'motion/react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { CATEGORIES, COMPONENT_CATEGORIES } from './category'
import { CategoryFilter } from './CategoryFilter'
import { ErrorState } from './ErrorState'
import { LoadingState } from './LoadingState'
import { SnapshotGrid } from './SnapshotGrid'
import { getAllPageInfo } from './tools/getPageInfo'

/**
 * 页面截图展示组件
 *
 * 一个功能完整的页面展示组件，支持分类筛选、分页、搜索等功能
 * 主要用于展示项目中的各种页面和组件，提供直观的视觉预览
 *
 * @example
 * ```tsx
 * <PageSnapshots
 *   gridCols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
 *   pagination={{ enabled: true, pageSize: 20 }}
 *   onCardClick={(pageInfo) => console.log('点击了页面:', pageInfo.title)}
 * />
 * ```
 */
export const PageSnapshots = memo<PageSnapshotsProps>(({
  className = '',
  style,
  showLoading = true,
  showError = true,
  gridCols,
  pagination = { enabled: true, pageSize: 40 },
  onCardClick,
}) => {
  const navigate = useNavigate()
  const [allPageInfos, setAllPageInfos] = useState<PageInfo[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<CategoryValue>('all')

  const filteredPageInfos = useMemo(() => {
    if (selectedCategory === 'all') {
      return allPageInfos
    }

    const res = allPageInfos.filter((info) => {
      const pathname = info.path.split('/').pop()?.toLocaleLowerCase()
      if (!pathname) {
        return false
      }
      const category = COMPONENT_CATEGORIES[pathname]
      return category === selectedCategory
    })

    return res
  }, [allPageInfos, selectedCategory])

  /** 分类数量统计（基于 COMPONENT_CATEGORIES 与路径映射） */
  const categoryStats = useMemo(() => {
    const stats: Partial<Record<CategoryValue, number>> = {}
    for (const info of allPageInfos) {
      const pathname = info.path.split('/').pop()?.toLocaleLowerCase()
      if (!pathname)
        continue
      const cv = COMPONENT_CATEGORIES[pathname] || 'pages'
      stats[cv] = (stats[cv] || 0) + 1
    }
    /** all 汇总 */
    stats.all = allPageInfos.length
    return stats
  }, [allPageInfos])

  const pageSize = pagination?.pageSize || 40
  const totalPages = Math.ceil(filteredPageInfos.length / pageSize)

  /** 初始化页面信息 */
  const initializePageInfos = useCallback(async () => {
    try {
      setInitialLoading(true)
      setError(null)

      const pageInfos = await getAllPageInfo()

      if (pageInfos.length === 0) {
        setError('没有找到可展示的页面')
        return
      }

      setAllPageInfos(pageInfos)
    }
    catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : '获取页面信息失败'
      setError(errorMessage)
      console.error('获取页面信息失败:', err)
    }
    finally {
      setInitialLoading(false)
    }
  }, [])

  /** 处理页面切换 */
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  /** 处理分类选择 */
  const handleCategorySelect = useCallback((category: CategoryValue) => {
    setSelectedCategory(category)
    setCurrentPage(1) // 切换分类时重置到第一页
  }, [])

  /** 处理卡片点击 */
  const handleCardClick = useCallback((pageInfo: any) => {
    if (onCardClick) {
      onCardClick(pageInfo)
    }
    else {
      /** 默认行为：导航到对应页面 */
      navigate(pageInfo.path)
    }
  }, [navigate, onCardClick])

  /** 重试加载 */
  const handleRetry = useCallback(() => {
    initializePageInfos()
  }, [initializePageInfos])

  /** 组件挂载时初始化页面信息 */
  useEffect(() => {
    initializePageInfos()
  }, [initializePageInfos])

  /** 获取当前页面的卡片数据 */
  const getCurrentPageCards = useCallback(() => {
    const pageData = getPageData(filteredPageInfos, currentPage, pageSize)

    return pageData.map((pageInfo) => {
      const card: SnapshotCardData = { pageInfo, status: 'success' }
      return card
    })
  }, [filteredPageInfos, currentPage, pageSize])

  const currentPageCards = getCurrentPageCards()

  /** 文本模式不再计算截图进度 */

  return (
    <motion.div
      className={ `w-full ${className}` }
      style={ style }
      initial={ { opacity: 0, y: 12 } }
      animate={ { opacity: 1, y: 0 } }
      transition={ { delay: 0.05, duration: 0.4 } }
    >
      {/* 初始加载状态 */ }
      { initialLoading && showLoading && (
        <LoadingState
          key="initialLoading"
          text="正在获取页面信息..."
          showProgress={ false }
        />
      ) }

      {/* 错误状态 */ }
      { error && showError && (
        <ErrorState
          key="error"
          message={ error }
          onRetry={ handleRetry }
        />
      ) }

      {/* 主要内容 */ }
      { !initialLoading && !error && allPageInfos.length > 0 && (
        <motion.div
          key="content"
          initial={ { opacity: 0 } }
          animate={ { opacity: 1 } }
          exit={ { opacity: 0 } }
          transition={ { duration: 0.3 } }
          className="space-y-6"
        >
          {/* 分类筛选器 */ }
          <CategoryFilter
            selectedCategory={ selectedCategory }
            onSelectCategory={ handleCategorySelect }
            stats={ categoryStats }
          />

          {/* 截图网格 */ }
          <SnapshotGrid
            cards={ currentPageCards }
            gridCols={ gridCols }
            pagination={
              totalPages > 1
                ? {
                    ...pagination,
                    currentPage,
                    totalPages,
                    onPageChange: handlePageChange,
                  }
                : { enabled: false }
            }
            onCardClick={ handleCardClick }
          />
        </motion.div>
      ) }

      {/* 空状态 */ }
      { !initialLoading && !error && allPageInfos.length > 0 && filteredPageInfos.length === 0 && (
        <motion.div
          key="empty-filtered"
          initial={ { opacity: 0 } }
          animate={ { opacity: 1 } }
          className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400"
        >
          <div className="mb-4 text-6xl">🔍</div>
          <h3 className="mb-2 text-xl font-semibold">无匹配结果</h3>
          <p className="text-center">
            在
            <strong>
              { (Object.keys(CATEGORIES) as CategoryKey[]).find(
                key => CATEGORIES[key] === selectedCategory,
              ) }
            </strong>
            分类下没有找到任何项目。
          </p>
        </motion.div>
      ) }

      {/* 初始空状态 */ }
      { !initialLoading && !error && allPageInfos.length === 0 && (
        <motion.div
          key="empty"
          initial={ { opacity: 0 } }
          animate={ { opacity: 1 } }
          className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400"
        >
          <div className="mb-4 text-6xl">📱</div>
          <h3 className="mb-2 text-xl font-semibold">暂无页面</h3>
          <p className="text-center">没有找到可展示的页面</p>
        </motion.div>
      ) }
    </motion.div>
  )
})
