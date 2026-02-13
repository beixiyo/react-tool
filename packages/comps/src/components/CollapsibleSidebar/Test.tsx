import { Menu, Search, Settings, User } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../Button'
import { CollapsibleSidebar } from './index'

/**
 * CollapsibleSidebar 测试组件
 * 验证收起后能否正常展开
 */
export function CollapsibleSidebarTest() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* 测试侧边栏 */ }
      <CollapsibleSidebar
        isCollapsed={ isCollapsed }
        onToggle={ () => setIsCollapsed(!isCollapsed) }
        header={ {
          title: '导航菜单',
        } }
        showToggleButton={ true }
        position="left"
        expandedWidth={ 280 }
        collapsedWidth={ 60 }
      >
        <div className="p-4 space-y-2">
          {/* 收起状态下只显示图标，展开状态下显示图标+文字 */ }
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background2 transition-colors">
            <Search size={ 18 } />
            { !isCollapsed && <span className="text-sm font-medium text-text">搜索</span> }
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background2 transition-colors">
            <User size={ 18 } />
            { !isCollapsed && <span className="text-sm font-medium text-text">用户管理</span> }
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background2 transition-colors">
            <Settings size={ 18 } />
            { !isCollapsed && <span className="text-sm font-medium text-text">系统设置</span> }
          </div>
        </div>
      </CollapsibleSidebar>

      {/* 主内容区域 */ }
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */ }
        <div className="h-16 bg-background flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-text">
              CollapsibleSidebar 测试
            </h1>
            <div className="text-sm text-text2">
              状态:
              {' '}
              { isCollapsed
                ? '已收起'
                : '已展开' }
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={ () => setIsCollapsed(!isCollapsed) }
            >
              <Menu size={ 16 } className="mr-2" />
              { isCollapsed
                ? '展开侧边栏'
                : '收起侧边栏' }
            </Button>
          </div>
        </div>

        {/* 内容区域 */ }
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            <div className="bg-background rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-text mb-4">
                测试说明
              </h2>

              <div className="space-y-4 text-sm text-text2">
                <div>
                  <h3 className="font-medium text-text mb-2">
                    1. 收起功能测试
                  </h3>
                  <p>点击侧边栏 header 中的收起按钮或主内容区域的"收起侧边栏"按钮</p>
                </div>

                <div>
                  <h3 className="font-medium text-text mb-2">
                    2. 展开功能测试
                  </h3>
                  <p>当侧边栏收起后，可以通过以下方式重新展开：</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>点击 header 中的展开按钮（收起状态下按钮会有背景色和边框）</li>
                    <li>点击主内容区域的"展开侧边栏"按钮</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-text mb-2">
                    3. 动画效果测试
                  </h3>
                  <p>收起和展开过程应该有平滑的动画过渡效果</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollapsibleSidebarTest
