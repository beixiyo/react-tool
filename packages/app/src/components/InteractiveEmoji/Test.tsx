import { ThemeToggle } from 'comps'
import { GithubSourceLink } from '@/components/GithubSourceLink'
import { InteractiveEmoji } from '.'

function App() {
  return (
    <div className="h-screen overflow-auto bg-background p-8 text-text space-y-8">
      <div className="mx-auto max-w-xl flex items-center justify-between">
        <h1 className="text-3xl font-bold">交互式表情组件示例</h1>
        <ThemeToggle />
      </div>

      {/* 示例 1: 使用默认尺寸 */}
      <div className="mx-auto max-w-xl">
        <h2 className="mb-2 text-center text-xl">默认尺寸 (600x300 交互区域)</h2>
        <InteractiveEmoji className="border border-blue-300" />
      </div>

      {/* 示例 2: 自定义尺寸和样式 */}
      <div className="mx-auto max-w-xl">
        <h2 className="mb-2 text-center text-xl">自定义尺寸 (400x200 交互区域)</h2>
        <InteractiveEmoji
          containerWidth={ 400 }
          containerHeight={ 200 }
          className="border-2 border-purple-400 rounded-xl bg-white shadow-xl"
        />
      </div>

      {/* 示例 3: 嵌入在其他内容中 */}
      <div className="mx-auto max-w-xl flex items-center rounded-lg bg-background2 p-6 space-x-4">
        <p className="text-text2">将鼠标移到右侧表情上:</p>
        <InteractiveEmoji
          containerWidth={ 300 }
          containerHeight={ 150 }
          className="bg-transparent! shadow-none!" // 使用 ! 强制覆盖 Tailwind 默认样式
          style={ { width: '300px', height: '250px' } } // 覆盖容器总大小
        />
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default App
