'use client'

import type { CategoryKey, CategoryValue } from './category'
import type { PageInfo } from './tools/getPageInfo'
import type { PageSnapshotsProps, SnapshotCardData } from './types'
import { getPageData } from '@jl-org/tool'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES, COMPONENT_CATEGORIES } from './category'
import { CategoryFilter } from './CategoryFilter'
import { ErrorState } from './ErrorState'
import { LoadingState } from './LoadingState'
import { SnapshotGrid } from './SnapshotGrid'
import { getAllPageInfo, pageInfosToComponentInfos } from './tools/getPageInfo'
import { getPageSnaps } from './tools/getPageSnaps'

/**
 * 页面截图展示组件
 */
export const PageSnapshots = memo<PageSnapshotsProps>(({
  className = '',
  style,
  showLoading = true,
  showError = true,
  gridCols,
  pagination = { enabled: true, pageSize: 12 },
  onCardClick,
  onSnapshotLoad,
  onSnapshotError,
}) => {
  const navigate = useNavigate()
  const [allPageInfos, setAllPageInfos] = useState<PageInfo[]>([])
  const [cards, setCards] = useState<SnapshotCardData[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set())
  const abortControllerRef = useRef<AbortController | null>(new AbortController())
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

  const pageSize = pagination?.pageSize || 12
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

      /** 初始化所有卡片为idle状态 */
      const initialCards: SnapshotCardData[] = pageInfos.map(pageInfo => ({
        pageInfo,
        status: 'idle',
      }))
      setCards(initialCards)
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

  /** 加载指定页面的截图 */
  const loadPageSnapshots = useCallback(async (page: number) => {
    if (loadingPages.has(page)) {
      return // 避免重复加载
    }

    const pageInfos = getPageData(filteredPageInfos, page, pageSize)

    if (pageInfos.length === 0) {
      return
    }

    /** 过滤出需要加载的页面（状态为idle的） */
    const needLoadInfos = pageInfos.filter((pageInfo) => {
      const card = cards.find(c => c.pageInfo.path === pageInfo.path)
      return card && card.status === 'idle'
    })

    if (needLoadInfos.length === 0) {
      return // 当前页面所有截图都已加载或正在加载
    }

    setLoadingPages(prev => new Set(prev).add(page))

    /** 将需要加载的卡片状态设为loading */
    setCards(prevCards =>
      prevCards.map((card) => {
        const needLoad = needLoadInfos.some(info => info.path === card.pageInfo.path)
        return needLoad
          ? { ...card, status: 'loading' as const }
          : card
      }),
    )

    try {
      const componentInfos = pageInfosToComponentInfos(needLoadInfos)

      await getPageSnaps(componentInfos, {
        signal: abortControllerRef.current?.signal,
        onSuccess: (result) => {
          if (!result || !result.componentInfo) {
            console.warn('onSuccess 回调收到无效的 result:', result)
            return
          }

          setCards(prevCards =>
            prevCards.map((card) => {
              if (card.pageInfo.path === result.componentInfo.path) {
                const updatedCard: SnapshotCardData = {
                  ...card,
                  snapshot: result,
                  status: 'success',
                }
                onSnapshotLoad?.(updatedCard)
                return updatedCard
              }
              return card
            }),
          )
        },

        onError: (info, error) => {
          setCards(prevCards =>
            prevCards.map((card) => {
              if (card.pageInfo.path === info.path) {
                const errorCard: SnapshotCardData = {
                  ...card,
                  status: 'error',
                  error: error instanceof Error
                    ? error.message
                    : '截图获取失败',
                }
                onSnapshotError?.(card.pageInfo, errorCard.error || '未知错误')
                return errorCard
              }
              return card
            }),
          )
        },
      })
    }
    catch (err) {
      console.error(`加载第${page}页截图失败:`, err)
    }
    finally {
      setLoadingPages((prev) => {
        const newSet = new Set(prev)
        newSet.delete(page)
        return newSet
      })
    }
  }, [filteredPageInfos, cards, pageSize, loadingPages, onSnapshotLoad, onSnapshotError])

  /** 处理页面切换 */
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    loadPageSnapshots(page)

    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()
  }, [loadPageSnapshots])

  /** 处理分类选择 */
  const handleCategorySelect = useCallback((category: CategoryValue) => {
    setSelectedCategory(category)
    setCurrentPage(1) // 切换分类时重置到第一页

    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()
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

    /** 清理函数 - 组件卸载时取消所有进行中的请求 */
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [initializePageInfos])

  /** 当页面信息加载完成后，自动加载第一页 */
  useEffect(() => {
    if (filteredPageInfos.length > 0 && !initialLoading) {
      loadPageSnapshots(currentPage)
    }
  }, [filteredPageInfos, initialLoading, currentPage, loadPageSnapshots])

  /** 获取当前页面的卡片数据 */
  const getCurrentPageCards = useCallback(() => {
    const pageData = getPageData(filteredPageInfos, currentPage, pageSize)

    return pageData.map((pageInfo) => {
      const card = cards.find(c => c.pageInfo.path === pageInfo.path)
      return card || { pageInfo, status: 'idle' as const }
    })
  }, [filteredPageInfos, cards, currentPage, pageSize])

  const currentPageCards = getCurrentPageCards()

  /** 计算当前页面的加载进度 */
  const currentPageProgress = useMemo(() => {
    const loadedCount = currentPageCards.filter(card => card.status === 'success').length
    const totalCount = currentPageCards.length
    return { loaded: loadedCount, total: totalCount }
  }, [currentPageCards])

  return (
    <motion.div
      className={ `w-full ${className}` }
      style={ style }
      initial={ { opacity: 0, y: 40 } }
      animate={ { opacity: 1, y: 0 } }
      transition={ { delay: 1.2, duration: 0.8 } }
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
          />

          {/* 当前页面加载进度 */ }
          { currentPageProgress.total > 0 && currentPageProgress.loaded < currentPageProgress.total && (
            <motion.div
              initial={ { opacity: 0, y: -10 } }
              animate={ { opacity: 1, y: 0 } }
              className="text-center text-sm text-gray-600 dark:text-gray-400"
            >
              正在加载第
              { ' ' }
              { currentPage }
              { ' ' }
              页截图... (
              { currentPageProgress.loaded }
              /
              { currentPageProgress.total }
              )
            </motion.div>
          ) }

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
