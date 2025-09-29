import { useState } from 'react'
import { CollapsibleSidebar } from './index'

export default function CollapsibleSidebarTest() {
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)
  const [isRightCollapsed, setIsRightCollapsed] = useState(false)

  return (
    <div className="h-screen flex">
      {/* 左侧边栏 */}
      <CollapsibleSidebar
        isCollapsed={ isLeftCollapsed }
        onToggle={ () => setIsLeftCollapsed(!isLeftCollapsed) }
        position="left"
        expandedWidth={ 280 }
        collapsedWidth={ 0 }
      >
        <div className="p-4 h-full">
          <h2 className="text-lg font-semibold mb-4 text-textPrimary">左侧边栏</h2>
          <div className="space-y-2">
            <div className="p-3 bg-backgroundSubtle rounded-lg">
              <h3 className="font-medium text-textPrimary">菜单项 1</h3>
              <p className="text-sm text-textSecondary">这是第一个菜单项的描述</p>
            </div>
            <div className="p-3 bg-backgroundSubtle rounded-lg">
              <h3 className="font-medium text-textPrimary">菜单项 2</h3>
              <p className="text-sm text-textSecondary">这是第二个菜单项的描述</p>
            </div>
            <div className="p-3 bg-backgroundSubtle rounded-lg">
              <h3 className="font-medium text-textPrimary">菜单项 3</h3>
              <p className="text-sm text-textSecondary">这是第三个菜单项的描述</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-medium mb-2 text-textPrimary">操作区域</h3>
            <div className="space-y-2">
              <button className="w-full p-2 bg-primary text-white rounded hover:bg-primaryHover transition-colors">
                主要操作
              </button>
              <button className="w-full p-2 border border-border rounded hover:bg-backgroundSubtle transition-colors text-textPrimary">
                次要操作
              </button>
            </div>
          </div>
        </div>
      </CollapsibleSidebar>

      {/* 主内容区域 */}
      <div className="flex-1 p-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-textPrimary">可收起侧边栏演示</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-border">
              <h2 className="text-xl font-semibold mb-4 text-textPrimary">左侧边栏控制</h2>
              <p className="text-textSecondary mb-4">
                点击侧边栏上的切换按钮或使用下面的按钮来控制左侧边栏的显示/隐藏。
              </p>
              <button
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primaryHover transition-colors"
                onClick={ () => setIsLeftCollapsed(!isLeftCollapsed) }
              >
                { isLeftCollapsed ? '展开' : '收起' }左侧边栏
              </button>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-border">
              <h2 className="text-xl font-semibold mb-4 text-textPrimary">右侧边栏控制</h2>
              <p className="text-textSecondary mb-4">
                点击右侧边栏上的切换按钮或使用下面的按钮来控制右侧边栏的显示/隐藏。
              </p>
              <button
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primaryHover transition-colors"
                onClick={ () => setIsRightCollapsed(!isRightCollapsed) }
              >
                { isRightCollapsed ? '展开' : '收起' }右侧边栏
              </button>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 text-textPrimary">功能特性</h2>
            <ul className="space-y-2 text-textSecondary">
              <li>• 支持左右两侧位置</li>
              <li>• 可自定义展开和收起宽度</li>
              <li>• 流畅的 framer-motion 动画</li>
              <li>• 支持弹簧动画和缓动动画</li>
              <li>• 可配置切换按钮位置</li>
              <li>• 支持移动端遮罩层</li>
              <li>• 完全可自定义样式</li>
              <li>• 内容通过插槽传递</li>
              <li>• 支持禁用状态</li>
              <li>• 响应式设计</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 右侧边栏 */}
      <CollapsibleSidebar
        isCollapsed={ isRightCollapsed }
        onToggle={ () => setIsRightCollapsed(!isRightCollapsed) }
        position="right"
        expandedWidth={ 240 }
        collapsedWidth={ 60 }
        animationType="tween"
        animationDuration={ 0.25 }
      >
        <div className="p-4 h-full">
          <h2 className="text-lg font-semibold mb-4 text-textPrimary">右侧边栏</h2>
          <div className="space-y-3">
            <div className="p-2 bg-backgroundSubtle rounded text-center">
              <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2"></div>
              <span className="text-xs text-textSecondary">工具 1</span>
            </div>
            <div className="p-2 bg-backgroundSubtle rounded text-center">
              <div className="w-8 h-8 bg-info rounded-full mx-auto mb-2"></div>
              <span className="text-xs text-textSecondary">工具 2</span>
            </div>
            <div className="p-2 bg-backgroundSubtle rounded text-center">
              <div className="w-8 h-8 bg-success rounded-full mx-auto mb-2"></div>
              <span className="text-xs text-textSecondary">工具 3</span>
            </div>
          </div>
        </div>
      </CollapsibleSidebar>
    </div>
  )
}
