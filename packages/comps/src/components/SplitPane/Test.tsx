import { memo } from 'react'
import { SplitPane } from './SplitPane'

const LEFT_ID = 'left'

function Index() {
  return (
    <div className="h-screen w-screen bg-[#0a0a0a] text-[#fafafa]">
      <SplitPane
        storageKey="demo-layout"
        dividerSize={ 4 }
        theme={ {
          dividerColor: 'transparent',
          dividerHoverColor: 'hsl(217 91% 60%)',
          buttonBackground: 'hsl(240 4% 16%)',
          buttonHoverBackground: 'hsl(240 4% 26%)',
          buttonIconColor: 'hsl(0 0% 98%)',
        } }
        /** 分隔条样式配置 - 使用明显的颜色来验证样式是否生效 */
        dividerStyleConfig={ {
          /** 正常状态：紫色背景，带圆角和阴影 */
          className: '',
          style: {
            backgroundColor: 'transparent', // 透明背景（会覆盖 theme 的 dividerColor）
          },
          // hover 状态：红色背景，放大并增强阴影
          hoverClassName: '',
          hoverStyle: {
            backgroundColor: 'rgba(66, 68, 222, 0.4)', // 蓝色背景（会覆盖 theme 的 dividerHoverColor）
          },
        } }
      >
        {/* 左侧边栏 */ }
        <SplitPane.Panel
          id={ LEFT_ID }
          minWidth={ 180 }
          maxWidth={ 400 }
          defaultWidth={ 240 }
          collapsedWidth={ 40 }
          autoCollapseThreshold={ 181 }
        >
          <LeftPanel />
        </SplitPane.Panel>

        {/* 主内容区域 */ }
        <SplitPane.Panel>
          <div className="h-full bg-[#0a0a0a] flex flex-col">
            {/* 标签栏 */ }
            <div className="flex items-center h-9 bg-[#111111] border-b border-[#262626]">
              <div className="px-4 py-1.5 text-sm text-[#e5e5e5] bg-[#0a0a0a] border-r border-[#262626]">
                index.tsx
              </div>
              <div className="px-4 py-1.5 text-sm text-[#737373] hover:text-[#e5e5e5] cursor-pointer">
                App.tsx
              </div>
            </div>

            {/* 编辑区 */ }
            <div className="flex-1 p-4 font-mono text-sm">
              <div className="text-[#737373]">1</div>
              <div className="text-[#737373]">2</div>
              <div>
                <span className="text-[#c084fc]">import</span>
                <span className="text-[#e5e5e5]">
                  { ' ' }
                  { '{ SplitPane }' }
                  { ' ' }
                </span>
                <span className="text-[#c084fc]">from</span>
                <span className="text-[#a5f3fc]"> '@/components/SplitPane'</span>
              </div>
              <div className="text-[#737373]">4</div>
              <div>
                <span className="text-[#c084fc]">const</span>
                <span className="text-[#22d3ee]"> Index</span>
                <span className="text-[#e5e5e5]"> = () </span>
                <span className="text-[#c084fc]">=&gt;</span>
                <span className="text-[#e5e5e5]">
                  { ' ' }
                  { '{' }
                </span>
              </div>
            </div>
          </div>
        </SplitPane.Panel>

        {/* 右侧面板 */ }
        <SplitPane.Panel
          minWidth={ 130 }
          maxWidth={ 500 }
          defaultWidth={ 280 }
          collapsedWidth={ 0 }
          autoCollapseThreshold={ 140 }
        >
          <div className="h-full bg-[#111111] p-4 border-l border-[#262626]">
            <h2 className="text-sm font-medium text-[#a1a1a1] uppercase tracking-wider mb-4">
              Outline
            </h2>
            <div className="space-y-2">
              { ['SplitPane', 'Panel', 'Divider', 'Collapse'].map(item => (
                <div
                  key={ item }
                  className="px-2 py-1.5 text-sm text-[#e5e5e5] hover:bg-[#262626] rounded cursor-pointer transition-colors"
                >
                  ƒ
                  { ' ' }
                  { item }
                </div>
              )) }
            </div>
          </div>
        </SplitPane.Panel>
      </SplitPane>
    </div>
  )
}

export default Index

const LeftPanel = memo(() => {
  const { state, toggle } = SplitPane.usePanelState(LEFT_ID)

  if (state?.collapsed) {
    return (
      <div className="h-full bg-[#111111] flex items-start justify-center pt-4 border-r border-[#262626]">
        <svg
          className="w-5 h-5 text-[#a1a1a1] hover:text-[#e5e5e5] cursor-pointer transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          onClick={ toggle }
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#111111] p-4 border-r border-[#262626]">
      <h2 className="text-sm font-medium text-[#a1a1a1] uppercase tracking-wider mb-4">
        Explorer
      </h2>
      <div className="space-y-1">
        { ['src', 'components', 'pages', 'hooks', 'utils'].map(item => (
          <div
            key={ item }
            className="px-2 py-1.5 text-sm text-[#e5e5e5] hover:bg-[#262626] rounded cursor-pointer transition-colors"
          >
            📁
            { ' ' }
            { item }
          </div>
        )) }
      </div>
    </div>
  )
})
