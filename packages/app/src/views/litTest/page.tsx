import { LBadge } from 'lit-comps/react'

export default function LBadgeTest() {
  return (
    <div className="h-screen overflow-auto p-8 space-y-8 dark:bg-black">
      <div className="space-y-4">

        <h2 className="text-xl font-bold">基础用法</h2>
        <div className="flex items-center gap-4">
          <LBadge count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
          <LBadge count={ 0 } showZero>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
          <LBadge count={ 99 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
          <LBadge count={ 100 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">不同变体</h2>
        <div className="flex items-center gap-4">
          <LBadge variant="default" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
          <LBadge variant="secondary" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
          <LBadge variant="tip" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
          <LBadge variant="outline" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
          <LBadge variant="success" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
          <LBadge variant="warning" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">不同尺寸</h2>
        <div className="flex items-center gap-4">
          <LBadge size="sm" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
          <LBadge size="md" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
          <LBadge size="lg" count={ 5 }>
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">提示点</h2>
        <div className="flex items-center gap-4">
          <LBadge dot variant="tip">
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
          <LBadge dot variant="success">
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
          <LBadge dot variant="warning">
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">自定义内容</h2>
        <div className="flex items-center gap-4">
          <LBadge content="NEW">
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
          <LBadge content="HOT" variant="tip">
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
          <LBadge content="🔥" variant="warning">
            <div className="h-10 w-10 rounded-xs bg-gray-200" />
          </LBadge>
        </div>
      </div>
    </div>
  )
}
