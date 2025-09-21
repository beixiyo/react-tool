import { ThemeToggle } from '../ThemeToggle'
import { Skeleton } from './'

export default function SkeletonDemo() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="mb-8 text-2xl font-bold">骨架屏组件演示</h1>
      <ThemeToggle />

      <div className="space-y-8">
        {/* 自定义尺寸 */ }
        <div>
          <h2 className="mb-4 text-lg font-medium">自定义尺寸</h2>
          <Skeleton className="h-8 w-48" />
        </div>

        {/* 自定义颜色 */ }
        <div>
          <h2 className="mb-4 text-lg font-medium">自定义颜色</h2>
          <Skeleton
            baseColor="#f0f0f0"
            highlightColor="#409eff"
            animationDuration={ 1.5 }
          />
        </div>

        {/* 多个骨架屏组合 */ }
        <div>
          <h2 className="mb-4 text-lg font-medium">组合使用</h2>
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
      </div>
    </div>
  )
}
