import { memo } from 'react'
import { ThemeToggle } from '../ThemeToggle'
import { SplitPane } from './SplitPane'

const LEFT_ID = 'left'

function Index() {
  return (
    <div className="h-screen w-screen bg-background text-textPrimary">
      <SplitPane
        storageKey="demo-layout"
        dividerSize={ 3 }
      >
        {/* 左侧边栏 */ }
        <SplitPane.Panel
          id={ LEFT_ID }
          minWidth={ 180 }
          maxWidth={ 400 }
          defaultWidth={ 240 }
          collapsedWidth={ 40 }
          autoCollapseThreshold={ 181 }
          className="shadow-2xl z-10"
        >
          <LeftPanel />
        </SplitPane.Panel>

        {/* 主内容区域 */ }
        <SplitPane.Panel>
          <div className="h-full bg-background flex flex-col">
            {/* 标签栏 */ }
            <div className="flex items-center h-9 bg-backgroundSecondary border-b border-border">
              <div className="px-4 py-1.5 text-sm text-textPrimary bg-background border-r border-border">
                index.tsx
              </div>
              <div className="px-4 py-1.5 text-sm text-textSecondary hover:text-textPrimary cursor-pointer">
                App.tsx
              </div>

              <ThemeToggle size={ 38 } className="ml-auto" />
            </div>

            {/* 编辑区 */ }
            <div className="flex-1 p-4 font-mono text-sm">
              <div className="text-textSecondary">1</div>
              <div className="text-textSecondary">2</div>
              <div>
                <span className="text-systemPurple">import</span>
                <span className="text-textPrimary">
                  { ' ' }
                  { '{ SplitPane }' }
                  { ' ' }
                </span>
                <span className="text-systemPurple">from</span>
                <span className="text-systemBlue"> '@/components/SplitPane'</span>
              </div>
              <div className="text-textSecondary">4</div>
              <div>
                <span className="text-systemPurple">const</span>
                <span className="text-systemBlue"> Index</span>
                <span className="text-textPrimary"> = () </span>
                <span className="text-systemPurple">=&gt;</span>
                <span className="text-textPrimary">
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
          <div className="h-full bg-backgroundSecondary p-4 border-l border-border">
            <h2 className="text-sm font-medium text-textTertiary uppercase tracking-wider mb-4">
              Outline
            </h2>
            <div className="space-y-2">
              { ['SplitPane', 'Panel', 'Divider', 'Collapse'].map(item => (
                <div
                  key={ item }
                  className="px-2 py-1.5 text-sm text-textPrimary hover:bg-backgroundTertiary rounded cursor-pointer transition-colors"
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
      <div className="h-full bg-backgroundSecondary flex items-start justify-center pt-4 border-r border-border">
        <svg
          className="w-5 h-5 text-textTertiary hover:text-textPrimary cursor-pointer transition-colors"
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
    <div className="h-full bg-backgroundSecondary p-4 border-r border-border">
      <h2 className="text-sm font-medium text-textTertiary uppercase tracking-wider mb-4">
        Explorer
      </h2>
      <div className="space-y-1">
        { ['src', 'components', 'pages', 'hooks', 'utils'].map(item => (
          <div
            key={ item }
            className="px-2 py-1.5 text-sm text-textPrimary hover:bg-backgroundTertiary rounded cursor-pointer transition-colors"
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
