import type { PaginationProps } from './types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { PageButton } from './PageButton'

/**
 * 分页组件
 */
export const Pagination = memo<PaginationProps>((
  {
    currentPage,
    totalPages,
    onPageChange,
    className,
    style,
    maxVisiblePages = 5,
    showPrevNext = true,
    showFirstLast = true,
    showEllipsis = true,
    disabled = false,
    prevText,
    nextText,
    firstText,
    lastText,
    ellipsisText = '...',
    renderPageButton,
    renderPrevButton,
    renderNextButton,
    renderEllipsis,
    onPageClick,
    ...rest
  },
) => {
  if (totalPages <= 1) {
    return null
  }

  /** 处理页码点击 */
  const handlePageClick = (page: number) => {
    if (disabled || page < 1 || page > totalPages || page === currentPage) {
      return
    }

    onPageClick?.(page)
    onPageChange(page)
  }

  /** 计算显示的页码范围 */
  const getVisiblePages = () => {
    const pages: number[] = []
    const half = Math.floor(maxVisiblePages / 2)

    let start = Math.max(1, currentPage - half)
    const end = Math.min(totalPages, start + maxVisiblePages - 1)

    /** 调整起始位置，确保显示足够的页码 */
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

  const visiblePages = getVisiblePages()
  const showFirstPage = showFirstLast && visiblePages[0] > 1
  const showLastPage = showFirstLast && visiblePages[visiblePages.length - 1] < totalPages
  const showFirstEllipsis = showEllipsis && visiblePages[0] > 2
  const showLastEllipsis = showEllipsis && visiblePages[visiblePages.length - 1] < totalPages - 1

  return (
    <div
      className={ cn(
        'flex items-center justify-center space-x-1',
        disabled && 'opacity-50 pointer-events-none',
        className,
      ) }
      style={ style }
      { ...rest }
    >
      {/* 上一页按钮 */ }
      { showPrevNext && (
        renderPrevButton
          ? renderPrevButton({
              disabled: disabled || currentPage === 1,
              onClick: () => handlePageClick(currentPage - 1),
            })
          : (
              <PageButton
                onClick={ handlePageClick }
                page={ currentPage - 1 }
                disabled={ disabled || currentPage === 1 }
              >
                { prevText || <ChevronLeft className="h-4 w-4" /> }
              </PageButton>
            )
      ) }

      {/* 第一页 */ }
      { showFirstPage && (
        <>
          <PageButton
            onClick={ handlePageClick }
            page={ 1 }
            isActive={ currentPage === 1 }
            disabled={ disabled }
          >
            { firstText || '1' }
          </PageButton>
          { showFirstEllipsis && (
            renderEllipsis
              ? renderEllipsis('first')
              : <span className="px-2 text-text3">{ ellipsisText }</span>
          ) }
        </>
      ) }

      {/* 可见页码 */ }
      { visiblePages.map(page => (
        renderPageButton
          ? renderPageButton({
              page,
              isActive: currentPage === page,
              disabled,
              onClick: () => handlePageClick(page),
            })
          : (
              <PageButton
                onClick={ handlePageClick }
                key={ page }
                page={ page }
                isActive={ currentPage === page }
                disabled={ disabled }
              >
                { page }
              </PageButton>
            )
      )) }

      {/* 最后一页 */ }
      { showLastPage && (
        <>
          { showLastEllipsis && (
            renderEllipsis
              ? renderEllipsis('last')
              : <span className="px-2 text-text3">{ ellipsisText }</span>
          ) }
          <PageButton
            onClick={ handlePageClick }
            page={ totalPages }
            isActive={ currentPage === totalPages }
            disabled={ disabled }
          >
            { lastText || totalPages }
          </PageButton>
        </>
      ) }

      {/* 下一页按钮 */ }
      { showPrevNext && (
        renderNextButton
          ? renderNextButton({
              disabled: disabled || currentPage === totalPages,
              onClick: () => handlePageClick(currentPage + 1),
            })
          : (
              <PageButton
                onClick={ handlePageClick }
                page={ currentPage + 1 }
                disabled={ disabled || currentPage === totalPages }
              >
                { nextText || <ChevronRight className="h-4 w-4" /> }
              </PageButton>
            )
      ) }
    </div>
  )
})

Pagination.displayName = 'Pagination'
