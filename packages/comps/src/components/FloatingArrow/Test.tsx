import type { FloatingArrowPlacement } from '.'
import { FloatingArrow } from '.'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'

const PLACEMENTS: FloatingArrowPlacement[] = ['top', 'right', 'bottom', 'left']

function FloatingArrowExample() {
  return (
    <div className="min-h-screen bg-text/15 p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <ThemeToggle />

        <Card
          className="bg-background2"
          padding="lg"
          bordered
          shadow="none"
          hoverEffect={ false }
        >
          <h2 className="mb-2 text-xl font-semibold text-text">浮层角标</h2>
          <p className="mb-8 text-sm text-text2">
            箭头填充与浮层背景连续，深色模式下描边与面板边框闭合
          </p>

          <div className="grid grid-cols-2 gap-12 p-8">
            { PLACEMENTS.map(placement => (
              <div
                key={ placement }
                className="relative flex h-24 w-40 items-center justify-center rounded-2xl border border-border bg-background text-sm text-text"
              >
                <FloatingArrow
                  placement={ placement }
                  centerOffset={ placement === 'top' || placement === 'bottom'
                    ? 80
                    : 48 }
                  bordered
                />
                { placement }
              </div>
            )) }
          </div>
        </Card>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default FloatingArrowExample
