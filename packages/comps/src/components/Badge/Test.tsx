import { Badge } from '.'
import { ThemeToggle } from '../ThemeToggle'

export default function BadgeTest() {
  return (
    <div className="h-screen overflow-auto p-8 space-y-8 dark:bg-black">
      <div className="space-y-4">
        <ThemeToggle />

        <h2 className="text-xl font-bold">基础用法</h2>
        <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-4">
          <Badge variant="default" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
          <Badge variant="secondary" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
          <Badge variant="tip" count={ 5 }>
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
        <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-4">
          <Badge dot variant="tip">
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
          <Badge dot variant="success">
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
          <Badge dot variant="warning">
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">自定义内容</h2>
        <div className="flex items-center gap-4">
          <Badge content="NEW">
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
          <Badge content="HOT" variant="tip">
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
          <Badge content="🔥" variant="warning">
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </Badge>
        </div>
      </div>
    </div>
  )
}
