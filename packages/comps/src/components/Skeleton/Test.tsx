import { Skeleton, SkeletonCard } from '.'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'

function SkeletonDemo() {
  return (
    <div className="min-h-screen bg-background p-8 text-text">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">骨架屏组件演示</h1>
          <ThemeToggle />
        </header>

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
              className="h-8 w-48"
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

          {/* 骨架屏卡片 */ }
          <div>
            <h2 className="mb-4 text-lg font-medium">骨架屏卡片</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <SkeletonCard
                delay={ 0 }
                showTitle={ true }
                showContent={ true }
                showTags={ true }
                titleWidth="w-3/4"
                contentLines={ 3 }
                tagCount={ 2 }
              />
              <SkeletonCard
                delay={ 0.1 }
                showTitle={ true }
                showContent={ true }
                showTags={ true }
                titleWidth="w-2/3"
                contentLines={ 2 }
                tagCount={ 1 }
              />
              <SkeletonCard
                delay={ 0.2 }
                showTitle={ true }
                showContent={ false }
                showTags={ true }
                titleWidth="w-4/5"
                tagCount={ 3 }
              />
            </div>
          </div>

          {/* 预设尺寸 */ }
          <div>
            <h2 className="mb-4 text-lg font-medium">预设尺寸</h2>
            <div className="space-y-4">
              <Skeleton size="xs" />
              <Skeleton size="sm" />
              <Skeleton size="md" />
              <Skeleton size="lg" />
              <Skeleton size="xl" />
            </div>
          </div>

          {/* 圆角样式 */ }
          <div>
            <h2 className="mb-4 text-lg font-medium">圆角样式</h2>
            <div className="flex gap-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" rounded />
            </div>
          </div>
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default SkeletonDemo
