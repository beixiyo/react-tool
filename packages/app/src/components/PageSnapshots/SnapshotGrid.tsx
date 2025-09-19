'use client'

import type { SnapshotGridProps } from './types'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Pagination } from '@/components/Pagination/'
import { SnapshotCard } from './SnapshotCard'

/**
 * 截图网格组件
 */
export function SnapshotGrid({
  cards,
  gridCols = { sm: 1, md: 2, lg: 3, xl: 4 },
  pagination = { enabled: true, pageSize: 12 },
  onCardClick,
  className = '',
}: SnapshotGridProps) {
  /** 使用外部传入的分页状态，如果没有则使用内部状态 */
  const currentPage = pagination?.currentPage || 1
  const totalPages = pagination?.totalPages || 1
  const onPageChange = pagination?.onPageChange

  /** 如果没有外部分页控制，则使用内部分页逻辑 */
  const [internalCurrentPage, setInternalCurrentPage] = useState(1)
  const actualCurrentPage = pagination?.currentPage !== undefined
    ? currentPage
    : internalCurrentPage
  const actualOnPageChange = onPageChange || setInternalCurrentPage

  /** 计算分页数据 */
  const paginatedData = useMemo(() => {
    if (!pagination?.enabled) {
      return {
        currentCards: cards,
        actualTotalPages: 1,
      }
    }

    /** 如果有外部分页控制，直接使用传入的cards（已经是当前页的数据） */
    if (pagination?.currentPage !== undefined) {
      return {
        currentCards: cards,
        actualTotalPages: totalPages,
      }
    }

    /** 内部分页逻辑 */
    const pageSize = pagination.pageSize || 12
    const actualTotalPages = Math.ceil(cards.length / pageSize)
    const startIndex = (actualCurrentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const currentCards = cards.slice(startIndex, endIndex)

    return {
      currentCards,
      actualTotalPages,
    }
  }, [cards, actualCurrentPage, pagination, totalPages])

  const { currentCards, actualTotalPages } = paginatedData
  /** 构建响应式网格类名 */
  const getGridColClass = (breakpoint: string, cols: number) => {
    const classMap: Record<string, Record<number, string>> = {
      '': {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
      },
      'md:': {
        1: 'md:grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4',
        5: 'md:grid-cols-5',
        6: 'md:grid-cols-6',
      },
      'lg:': {
        1: 'lg:grid-cols-1',
        2: 'lg:grid-cols-2',
        3: 'lg:grid-cols-3',
        4: 'lg:grid-cols-4',
        5: 'lg:grid-cols-5',
        6: 'lg:grid-cols-6',
      },
      'xl:': {
        1: 'xl:grid-cols-1',
        2: 'xl:grid-cols-2',
        3: 'xl:grid-cols-3',
        4: 'xl:grid-cols-4',
        5: 'xl:grid-cols-5',
        6: 'xl:grid-cols-6',
      },
    }
    return classMap[breakpoint]?.[cols] || classMap[breakpoint]?.[1] || ''
  }

  const gridClassName = [
    'grid gap-6',
    getGridColClass('', gridCols.sm || 1),
    getGridColClass('md:', gridCols.md || 2),
    getGridColClass('lg:', gridCols.lg || 3),
    getGridColClass('xl:', gridCols.xl || 4),
    className,
  ].filter(Boolean).join(' ')

  /** 容器动画变体 */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.02,
      },
    },
  }

  /** 卡片动画变体 */
  const cardVariants = {
    hidden: (i: number) => ({
      opacity: 0,
      y: 12,
      x: i % 2 === 0
        ? -12
        : 12,
      scale: 0.98,
    }),
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
        mass: 0.6,
      },
    }),
  }

  if (cards.length === 0) {
    return (
      <motion.div
        initial={ { opacity: 0 } }
        animate={ { opacity: 1 } }
        className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400"
      >
        <div className="mb-4 text-6xl">📱</div>
        <h3 className="mb-2 text-xl font-semibold">暂无页面</h3>
        <p className="text-center">没有找到可展示的页面</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 网格内容 */ }
      <motion.div
        variants={ containerVariants }
        initial="hidden"
        animate="visible"
        className={ gridClassName }
      >
        { currentCards.map((card, index) => (
          <motion.div
            key={ card.pageInfo.path }
            variants={ cardVariants }
            layout
            layoutId={ `card-${card.pageInfo.path}` }
            custom={ index }
          >
            <SnapshotCard
              data={ card }
              onClick={ onCardClick }
              className="h-full"
            />
          </motion.div>
        )) }
      </motion.div>

      {/* 分页组件 */ }
      { pagination?.enabled && actualTotalPages > 1 && (
        <Pagination
          currentPage={ actualCurrentPage }
          totalPages={ actualTotalPages }
          onPageChange={ actualOnPageChange }
          className="mt-8 bg-transparent!"
        />
      ) }
    </div>
  )
}
