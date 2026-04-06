'use client'

import { Badge } from '.'
import { Button } from '../Button'
import { ThemeToggle } from '../ThemeToggle'
import { cn } from 'utils'

/**
 * 本地预览：在 `frontend/guide` 下执行 `pnpm dev`，浏览器打开
 * 路由一般为 `/Badge/Test`（以控制台 / 路由列表为准）
 */
export default function BadgeTest() {
  return (
    <div className="h-screen space-y-8 overflow-auto p-8 dark:bg-black">
      <div className="space-y-4">
        <ThemeToggle />

        <h1 className="text-2xl font-bold">Badge 组件展示</h1>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">基础用法</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Badge count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
          <Badge count={ 0 } showZero>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
          <Badge count={ 99 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
          <Badge count={ 100 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">不同变体</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="default" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
          <Badge variant="secondary" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>

          <Badge variant="outline" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
          <Badge variant="success" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
          <Badge variant="warning" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">不同尺寸</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Badge size="sm" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
          <Badge size="md" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
          <Badge size="lg" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">提示点</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Badge dot variant="success">
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
          <Badge dot variant="warning">
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">自定义内容（content）</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Badge content="NEW">
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
          <Badge content="HOT" variant="default">
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
          <Badge content="🔥" variant="warning">
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>

          <Badge
            variant="outline"
            size="lg"
            badgeClassName={ cn(
              '-top-[1em] -right-[48px] border-transparent py-1 px-2',
              'rounded-full bg-[linear-gradient(180deg,#eaeefb,#f5f8ff)] text-center',
              'dark:bg-[linear-gradient(180deg,#2d3548,#1e293b)] dark:text-systemBlue',
              'text-systemBlue shadow-[1px_2px_2px_1px_rgb(0_0_0/0.07)]',
              'pointer-events-none whitespace-nowrap',
            ) }
            content={ <span className="text-[10px]">+3 Months Premium (Free)</span> }
          >
            <Button
              variant="default"
              rounded={ 'full' }
            >
              Complete Set
            </Button>
          </Badge>
        </div>
      </div>
    </div>
  )
}
