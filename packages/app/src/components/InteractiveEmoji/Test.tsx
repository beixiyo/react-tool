import { useNotifyParentReady } from 'hooks'
import { InteractiveEmoji } from './'

export default function App() {
  /** 通知父窗口组件准备就绪（用于截图） */
  useNotifyParentReady()

  return (
    <div className="h-screen overflow-auto bg-gray-200 space-y-8">
      <h1 className="mx-auto mb-4 max-wxl text-center text-3xl font-bold">交互式表情组件示例</h1>

      {/* 示例 1: 使用默认尺寸 */}
      <div className="mx-auto max-wxl">
        <h2 className="mb-2 text-center text-xl">默认尺寸 (600x300 交互区域)</h2>
        <InteractiveEmoji className="border border-blue-300" />
      </div>

      {/* 示例 2: 自定义尺寸和样式 */}
      <div className="mx-auto max-wxl">
        <h2 className="mb-2 text-center text-xl">自定义尺寸 (400x200 交互区域)</h2>
        <InteractiveEmoji
          containerWidth={ 400 }
          containerHeight={ 200 }
          className="border-2 border-purple-400 rounded-xl bg-white shadow-xl"
        // style={{ transform: 'scale(0.8)' }} // 可以添加额外的样式
        />
      </div>

      {/* 示例 3: 嵌入在其他内容中 */}
      <div className="mx-auto max-wxl flex items-center rounded-lg bg-teal-100 p-6 space-x-4">
        <p className="text-teal-800">将鼠标移到右侧表情上:</p>
        <InteractiveEmoji
          containerWidth={ 300 }
          containerHeight={ 150 }
          className="bg-transparent! shadow-none!" // 使用 ! 强制覆盖 Tailwind 默认样式
          style={ { width: '300px', height: '250px' } } // 覆盖容器总大小
        />
      </div>
    </div>
  )
}
