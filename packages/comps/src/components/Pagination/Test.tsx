'use client'

import { useState } from 'react'
import { Pagination } from '.'
import { ThemeToggle } from '../ThemeToggle'

/**
 * Pagination 组件测试页面
 */
export default function PaginationTest() {
  const [currentPage1, setCurrentPage1] = useState(1)
  const [currentPage2, setCurrentPage2] = useState(5)
  const [currentPage3, setCurrentPage3] = useState(1)

  return (
    <div className="min-h-screen bg-background2 p-6">
      <ThemeToggle />

      <div className="mx-auto max-w-4xl space-y-12">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-text">
            Pagination 组件测试
          </h1>
          <p className="text-text2">
            测试重构后的分页组件的各种配置和功能
          </p>
        </div>

        {/* 基础分页 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text">
            基础分页 (默认配置)
          </h2>
          <div className="rounded-lg border border-border bg-background p-6">
            <p className="mb-4 text-sm text-text2">
              当前页:
              {' '}
              {currentPage1}
              {' '}
              / 10
            </p>
            <Pagination
              currentPage={ currentPage1 }
              totalPages={ 10 }
              onPageChange={ setCurrentPage1 }
            />
          </div>
        </div>

        {/* 大数据量分页 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text">
            大数据量分页 (100页)
          </h2>
          <div className="rounded-lg border border-border bg-background p-6">
            <p className="mb-4 text-sm text-text2">
              当前页:
              {' '}
              {currentPage2}
              {' '}
              / 100
            </p>
            <Pagination
              currentPage={ currentPage2 }
              totalPages={ 100 }
              onPageChange={ setCurrentPage2 }
              maxVisiblePages={ 7 }
            />
          </div>
        </div>

        {/* 自定义配置 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text">
            自定义配置
          </h2>
          <div className="rounded-lg border border-border bg-background p-6">
            <p className="mb-4 text-sm text-text2">
              当前页:
              {' '}
              {currentPage3}
              {' '}
              / 20 (自定义文本、禁用省略号)
            </p>
            <Pagination
              currentPage={ currentPage3 }
              totalPages={ 20 }
              onPageChange={ setCurrentPage3 }
              prevText="上一页"
              nextText="下一页"
              firstText="首页"
              lastText="末页"
              ellipsisText="···"
              showEllipsis={ false }
              maxVisiblePages={ 3 }
            />
          </div>
        </div>

        {/* 禁用状态 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text">
            禁用状态
          </h2>
          <div className="rounded-lg border border-border bg-background p-6">
            <p className="mb-4 text-sm text-text2">
              禁用的分页组件
            </p>
            <Pagination
              currentPage={ 5 }
              totalPages={ 10 }
              onPageChange={ () => {} }
              disabled
            />
          </div>
        </div>

      </div>
    </div>
  )
}
