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
    <div className="bg-background text-text h-full">
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
          className="z-10 shadow-2xl"
        >
          <LeftPanel panelId={ leftPanelId } />
        </SplitPane.Panel>

        <SplitPane.Panel id={ centerPanelId }>
          <div className="bg-background flex h-full flex-col">
            <div className="bg-background2 border-border flex h-9 items-center border-b">
              <div className="text-text bg-background border-border border-r px-4 py-1.5 text-sm">
                index.tsx
              </div>
              <div className="text-text2 hover:text-text cursor-pointer px-4 py-1.5 text-sm">
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
                  { ' ' }
                  { '{ SplitPane }' }
                  { ' ' }
                </span>
                <span className="text-systemPurple">from</span>
                <span className="text-systemBlue">'@/components/SplitPane'</span>
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
        >
          <div className="bg-background2 border-border h-full border-l p-4">
            <h2 className="text-text3 mb-4 text-sm font-medium tracking-wider uppercase">
              Outline
            </h2>
            <div className="space-y-2">
              { ['SplitPane', 'Panel', 'Divider', 'Collapse'].map((item) => (
                <div
                  key={ item }
                  className="text-text hover:bg-background3 cursor-pointer rounded-sm px-2 py-1.5 text-sm transition-colors"
                >
                  ƒ { item }
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
    <div className="bg-background2/60 text-text h-full p-3">
      <SplitPane
        storageKey="demo-floating"
        gap={ 0 }
        dividerSize={ 6 }
        theme={ { dividerColor: 'transparent', dividerHoverColor: 'transparent' } }
      >
        <SplitPane.Panel
          id={ leftId }
          allowOverflow
          minWidth={ 200 }
          maxWidth={ 360 }
          defaultWidth={ 280 }
          className="bg-background z-10 rounded-2xl shadow-lg"
        >
          <div className="h-full p-4">
            <h2 className="mb-4 text-sm font-semibold">Card List</h2>
            <div className="space-y-2">
              { ['Meeting Notes', 'Product Roadmap', 'Sprint Review', 'Design Sync'].map((item) => (
                <div
                  key={ item }
                  className="bg-background2/50 hover:bg-background2 cursor-pointer rounded-xl px-3 py-2.5 text-sm transition-colors"
                >
                  { item }
                </div>
              )) }
            </div>
          </div>
        </SplitPane.Panel>

        <SplitPane.Panel
          id={ centerId }
          className="bg-background rounded-2xl"
        >
          <div className="text-text2 flex h-full flex-col items-center justify-center p-6">
            <div className="mb-3 text-4xl">📄</div>
            <p className="text-sm">Select a card to view details</p>
          </div>
        </SplitPane.Panel>

        <SplitPane.Panel
          id={ rightId }
          allowOverflow
          minWidth={ 240 }
          maxWidth={ 420 }
          defaultWidth={ 320 }
          className="bg-background z-10 rounded-2xl shadow-lg"
        >
          <div className="flex h-full flex-col p-4">
            <h2 className="mb-4 text-sm font-semibold">AI Assistant</h2>
            <div className="text-text2 flex flex-1 items-center justify-center">
              <p className="text-sm">Ask me anything...</p>
            </div>
            <div className="mt-auto">
              <div className="bg-background2/50 flex items-center gap-2 rounded-xl px-3 py-2.5">
                <span className="text-text2 flex-1 text-sm">Type a message</span>
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
  const ActiveDemo = DEMOS.find((d) => d.key === active)?.component ?? FloatingDemo

  return (
    <div className="bg-background text-text flex h-full w-full flex-col">
      <div className="border-border flex shrink-0 items-center gap-2 border-b p-3">
        { DEMOS.map((d) => (
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
      <div className="min-h-0 flex-1">
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
      <div className="bg-background2 border-border flex h-full items-start justify-center border-r pt-4">
        <svg
          className="text-text3 hover:text-text h-5 w-5 cursor-pointer transition-colors"
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
    <div className="bg-background2 border-border h-full border-r p-4">
      <h2 className="text-text3 mb-4 text-sm font-medium tracking-wider uppercase">
        Explorer
      </h2>
      <div className="space-y-1">
        { ['src', 'components', 'pages', 'hooks', 'utils'].map((item) => (
          <div
            key={ item }
            className="text-text hover:bg-background3 cursor-pointer rounded-sm px-2 py-1.5 text-sm transition-colors"
          >
            📁 { item }
          </div>
        )) }
      </div>
    </div>
  )
})

type LeftPanelProps = {
  panelId: string
}
