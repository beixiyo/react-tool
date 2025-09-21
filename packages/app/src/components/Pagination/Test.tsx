'use client'

import { useState } from 'react'
import { ThemeToggle } from '@/components//ThemeToggle'
import { Pagination } from './'

/**
 * Pagination 组件测试页面
 */
export default function PaginationTest() {
  const [currentPage1, setCurrentPage1] = useState(1)
  const [currentPage2, setCurrentPage2] = useState(5)
  const [currentPage3, setCurrentPage3] = useState(1)

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <ThemeToggle />

      <div className="mx-auto max-w-4xl space-y-12">
        <div className="text-center">
          <h1 className="mb-2 text-3xl text-gray-900 font-bold dark:text-gray-100">
            Pagination 组件测试
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            测试重构后的分页组件的各种配置和功能
          </p>
        </div>

        {/* 基础分页 */}
        <div className="space-y-4">
          <h2 className="text-xl text-gray-800 font-semibold dark:text-gray-200">
            基础分页 (默认配置)
          </h2>
          <div className="rounded-lg bg-white p-6 shadow-xs dark:bg-gray-800">
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
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
          <h2 className="text-xl text-gray-800 font-semibold dark:text-gray-200">
            大数据量分页 (100页)
          </h2>
          <div className="rounded-lg bg-white p-6 shadow-xs dark:bg-gray-800">
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
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

        {/* 不同尺寸 */}
        <div className="space-y-4">
          <h2 className="text-xl text-gray-800 font-semibold dark:text-gray-200">
            不同尺寸
          </h2>
          <div className="rounded-lg bg-white p-6 shadow-xs space-y-6 dark:bg-gray-800">
            <div>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">小尺寸 (sm)</p>
              <Pagination
                currentPage={ 3 }
                totalPages={ 10 }
                onPageChange={ () => {} }
                size="sm"
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">中等尺寸 (md)</p>
              <Pagination
                currentPage={ 3 }
                totalPages={ 10 }
                onPageChange={ () => {} }
                size="md"
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">大尺寸 (lg)</p>
              <Pagination
                currentPage={ 3 }
                totalPages={ 10 }
                onPageChange={ () => {} }
                size="lg"
              />
            </div>
          </div>
        </div>

        {/* 不同变体 */}
        <div className="space-y-4">
          <h2 className="text-xl text-gray-800 font-semibold dark:text-gray-200">
            不同变体
          </h2>
          <div className="rounded-lg bg-white p-6 shadow-xs space-y-6 dark:bg-gray-800">
            <div>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">默认变体 (default)</p>
              <Pagination
                currentPage={ 3 }
                totalPages={ 10 }
                onPageChange={ () => {} }
                variant="default"
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">简约变体 (minimal)</p>
              <Pagination
                currentPage={ 3 }
                totalPages={ 10 }
                onPageChange={ () => {} }
                variant="minimal"
              />
            </div>
            <div>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">填充变体 (filled)</p>
              <Pagination
                currentPage={ 3 }
                totalPages={ 10 }
                onPageChange={ () => {} }
                variant="filled"
              />
            </div>
          </div>
        </div>

        {/* 自定义配置 */}
        <div className="space-y-4">
          <h2 className="text-xl text-gray-800 font-semibold dark:text-gray-200">
            自定义配置
          </h2>
          <div className="rounded-lg bg-white p-6 shadow-xs dark:bg-gray-800">
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
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
          <h2 className="text-xl text-gray-800 font-semibold dark:text-gray-200">
            禁用状态
          </h2>
          <div className="rounded-lg bg-white p-6 shadow-xs dark:bg-gray-800">
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
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

        {/* 无动画 */}
        <div className="space-y-4">
          <h2 className="text-xl text-gray-800 font-semibold dark:text-gray-200">
            无动画
          </h2>
          <div className="rounded-lg bg-white p-6 shadow-xs dark:bg-gray-800">
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              禁用动画效果
            </p>
            <Pagination
              currentPage={ 3 }
              totalPages={ 10 }
              onPageChange={ () => {} }
              animation={ { enabled: false } }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
