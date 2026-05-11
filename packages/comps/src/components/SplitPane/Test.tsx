import { memo, useId, useState } from 'react'
import { ThemeToggle } from '../ThemeToggle'
import { SplitPane } from './SplitPane'

/**
 * Demo 1: IDE 风格（紧凑分隔条，无间距）
 */
function IDEDemo() {
  const leftPanelId = useId()
  const centerPanelId = useId()
  const rightPanelId = useId()

  return (
    <div className="h-full bg-background text-text">
      <SplitPane
        storageKey="demo-ide"
        dividerSize={ 3 }
      >
        <SplitPane.Panel
          id={ leftPanelId }
          minWidth={ 180 }
          maxWidth={ 400 }
          defaultWidth={ 240 }
          collapsedWidth={ 40 }
          autoCollapseThreshold={ 181 }
          className="shadow-2xl z-10"
        >
          <LeftPanel panelId={ leftPanelId } />
        </SplitPane.Panel>

        <SplitPane.Panel id={ centerPanelId }>
          <div className="h-full bg-background flex flex-col">
            <div className="flex items-center h-9 bg-background2 border-b border-border">
              <div className="px-4 py-1.5 text-sm text-text bg-background border-r border-border">
                index.tsx
              </div>
              <div className="px-4 py-1.5 text-sm text-text2 hover:text-text cursor-pointer">
                App.tsx
              </div>
              <ThemeToggle size={ 38 } className="ml-auto" />
            </div>
            <div className="flex-1 p-4 font-mono text-sm">
              <div className="text-text2">1</div>
              <div className="text-text2">2</div>
              <div>
                <span className="text-systemPurple">import</span>
                <span className="text-text">
                  {' '}
                  { '{ SplitPane }' }
                  {' '}
                </span>
                <span className="text-systemPurple">from</span>
                <span className="text-systemBlue"> '@/components/SplitPane'</span>
              </div>
            </div>
          </div>
        </SplitPane.Panel>

        <SplitPane.Panel
          id={ rightPanelId }
          minWidth={ 130 }
          maxWidth={ 500 }
          defaultWidth={ 280 }
          collapsedWidth={ 0 }
          autoCollapseThreshold={ 140 }
        >
          <div className="h-full bg-background2 p-4 border-l border-border">
            <h2 className="text-sm font-medium text-text3 uppercase tracking-wider mb-4">
              Outline
            </h2>
            <div className="space-y-2">
              { ['SplitPane', 'Panel', 'Divider', 'Collapse'].map(item => (
                <div
                  key={ item }
                  className="px-2 py-1.5 text-sm text-text hover:bg-background3 rounded-sm cursor-pointer transition-colors"
                >
                  ƒ
                  {' '}
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

/**
 * Demo 2: 悬浮卡片风格（gap + allowOverflow + 圆角阴影）
 */
function FloatingDemo() {
  const leftId = useId()
  const centerId = useId()
  const rightId = useId()

  return (
    <div className="h-full bg-background2/60 p-3 text-text">
      <SplitPane
        storageKey="demo-floating"
        gap={ 12 }
        dividerSize={ 6 }
        theme={ { dividerColor: 'transparent', dividerHoverColor: 'transparent' } }
      >
        <SplitPane.Panel
          id={ leftId }
          allowOverflow
          minWidth={ 200 }
          maxWidth={ 360 }
          defaultWidth={ 280 }
          autoCollapseThreshold={ 201 }
          className="rounded-2xl bg-background shadow-lg z-10"
        >
          <div className="h-full p-4">
            <h2 className="text-sm font-semibold mb-4">Card List</h2>
            <div className="space-y-2">
              { ['Meeting Notes', 'Product Roadmap', 'Sprint Review', 'Design Sync'].map(item => (
                <div
                  key={ item }
                  className="px-3 py-2.5 rounded-xl bg-background2/50 text-sm hover:bg-background2 cursor-pointer transition-colors"
                >
                  { item }
                </div>
              )) }
            </div>
          </div>
        </SplitPane.Panel>

        <SplitPane.Panel
          id={ centerId }
          className="rounded-2xl bg-background"
        >
          <div className="h-full p-6 flex flex-col items-center justify-center text-text2">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-sm">Select a card to view details</p>
          </div>
        </SplitPane.Panel>

        <SplitPane.Panel
          id={ rightId }
          allowOverflow
          minWidth={ 240 }
          maxWidth={ 420 }
          defaultWidth={ 320 }
          autoCollapseThreshold={ 241 }
          className="rounded-2xl bg-background shadow-lg z-10"
        >
          <div className="h-full flex flex-col p-4">
            <h2 className="text-sm font-semibold mb-4">AI Assistant</h2>
            <div className="flex-1 flex items-center justify-center text-text2">
              <p className="text-sm">Ask me anything...</p>
            </div>
            <div className="mt-auto">
              <div className="flex items-center gap-2 rounded-xl bg-background2/50 px-3 py-2.5">
                <span className="text-text2 text-sm flex-1">Type a message</span>
                <span className="text-text2">↑</span>
              </div>
            </div>
          </div>
        </SplitPane.Panel>
      </SplitPane>
    </div>
  )
}

const DEMOS = [
  { key: 'ide', label: 'IDE Style', component: IDEDemo },
  { key: 'floating', label: 'Floating Cards', component: FloatingDemo },
] as const

function Index() {
  const [active, setActive] = useState<string>('floating')
  const ActiveDemo = DEMOS.find(d => d.key === active)?.component ?? FloatingDemo

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-text">
      <div className="flex items-center gap-2 p-3 border-b border-border shrink-0">
        <span className="text-sm font-medium text-text2 mr-2">SplitPane Demo</span>
        { DEMOS.map(d => (
          <button
            key={ d.key }
            className={ `px-3 py-1 text-sm rounded-md transition-colors ${
              active === d.key
                ? 'bg-background2 text-text font-medium'
                : 'text-text2 hover:text-text hover:bg-background2/50'
            }` }
            onClick={ () => setActive(d.key) }
          >
            { d.label }
          </button>
        )) }
      </div>
      <div className="flex-1 min-h-0">
        <ActiveDemo />
      </div>
    </div>
  )
}

export default Index

const LeftPanel = memo(({
  panelId,
}: LeftPanelProps) => {
  const { state, toggle } = SplitPane.usePanelState(panelId)

  if (state?.collapsed) {
    return (
      <div className="h-full bg-background2 flex items-start justify-center pt-4 border-r border-border">
        <svg
          className="w-5 h-5 text-text3 hover:text-text cursor-pointer transition-colors"
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
    <div className="h-full bg-background2 p-4 border-r border-border">
      <h2 className="text-sm font-medium text-text3 uppercase tracking-wider mb-4">
        Explorer
      </h2>
      <div className="space-y-1">
        { ['src', 'components', 'pages', 'hooks', 'utils'].map(item => (
          <div
            key={ item }
            className="px-2 py-1.5 text-sm text-text hover:bg-background3 rounded-sm cursor-pointer transition-colors"
          >
            📁
            {' '}
            { item }
          </div>
        )) }
      </div>
    </div>
  )
})

type LeftPanelProps = {
  panelId: string
}
