import { Popover } from '.'
import { ThemeToggle } from '../ThemeToggle'

export default function PopoverExample() {
  return (
    <div className="bg-background2 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <ThemeToggle />

        {/* 跟随滚动（默认）：在可滚动区域内，Popover 随触发器一起滚动 */ }
        <div className="rounded-lg bg-background border border-border p-6">
          <h2 className="mb-4 text-xl text-text font-semibold">跟随滚动</h2>
          <p className="mb-4 text-text2 text-sm">
            下方为可滚动区域，打开 Popover 后滚动列表，浮层会随触发器一起移动（默认已开启跟随滚动）。
          </p>
          <div
            className="relative max-h-64 overflow-y-auto rounded-lg border border-border bg-background2/50"
            style={ { minHeight: 200 } }
          >
            { Array.from({ length: 12 }, (_, i) => (
              <div
                key={ i }
                className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0"
              >
                <span className="text-text">
                  Item
                  { i + 1 }
                </span>
                <Popover
                  trigger="click"
                  position="left"
                  followScroll
                  contentClassName="p-3"
                  content={ (
                    <div className="w-48">
                      <p className="text-text2 text-sm">
                        跟随滚动模式：随列表一起滚动，不脱离触发器。
                      </p>
                    </div>
                  ) }
                >
                  <button
                    type="button"
                    className="rounded px-2 py-1 text-sm text-systemOrange hover:bg-systemOrange/10"
                  >
                    详情
                  </button>
                </Popover>
              </div>
            )) }
          </div>
        </div>

        {/* 对比：不跟随滚动（followScroll=false） */ }
        <div className="rounded-lg bg-background border border-border p-6">
          <h2 className="mb-4 text-xl text-text font-semibold">对比：不跟随滚动 (followScroll=false)</h2>
          <p className="mb-4 text-text2 text-sm">
            同一可滚动区域，传 followScroll=false 时：打开后滚动，浮层相对视口固定，会与触发器分离。
          </p>
          <div
            className="relative max-h-64 overflow-y-auto rounded-lg border border-border bg-background2/50"
            style={ { minHeight: 200 } }
          >
            { Array.from({ length: 8 }, (_, i) => (
              <div
                key={ i }
                className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0"
              >
                <span className="text-text">
                  Item
                  { i + 1 }
                </span>
                <Popover
                  followScroll={ false }
                  trigger="click"
                  position="left"
                  contentClassName="p-3"
                  content={ (
                    <div className="w-48">
                      <p className="text-text2 text-sm">
                        不跟随模式：浮层在 body，滚动时与触发器分离。
                      </p>
                    </div>
                  ) }
                >
                  <button
                    type="button"
                    className="rounded px-2 py-1 text-sm text-systemOrange hover:bg-systemOrange/10"
                  >
                    详情
                  </button>
                </Popover>
              </div>
            )) }
          </div>
        </div>
      </div>
    </div>
  )
}
