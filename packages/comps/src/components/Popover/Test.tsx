import { Popover } from '.'
import { Button } from '../Button'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'

function PopoverExample() {
  return (
    <div className="min-h-screen bg-text/15 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <ThemeToggle />

        <Card className="bg-background2" padding="lg" bordered shadow="none" hoverEffect={ false }>
          <h2 className="mb-2 text-xl text-text font-semibold">默认气泡箭头与自定义配置</h2>
          <p className="mb-4 text-sm text-text2">
            Popover 默认显示箭头，也可以通过对象配置尺寸、偏移和样式
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Popover
              trigger="click"
              position="right"
              align="start"
              bordered
              contentClassName="w-72 p-4"
              content={ (
                <div className="space-y-2 text-sm text-text2">
                  <p className="font-semibold text-text">小图标触发器</p>
                  <p>默认箭头应始终对齐 16px 触发器的中心。</p>
                  <p>增加内容高度后，箭头仍然指向触发器，而不是固定在浮层顶部 24px。</p>
                </div>
              ) }
            >
              <Button
                aria-label="打开小图标气泡"
                iconOnly
                className="size-4 min-h-0 min-w-0 rounded-full p-0 text-[10px]"
              >
                i
              </Button>
            </Popover>

            <Popover
              trigger="click"
              position="right"
              align="start"
              arrow={ { offset: 28 } }
              contentClassName="p-4"
              content={ (
                <div className="w-56">
                  <p className="text-text text-sm font-medium">右侧浮层</p>
                  <p className="mt-1 text-text2 text-sm">
                    箭头会根据实际方向和对齐方式定位。
                  </p>
                </div>
              ) }
            >
              <button
                type="button"
                className="rounded-sm bg-systemOrange px-3 py-2 text-sm text-white hover:bg-systemOrange/90"
              >
                打开右侧气泡
              </button>
            </Popover>

            <Popover
              trigger="click"
              position="top"
              contentClassName="p-4"
              content={ (
                <div className="w-48 text-sm text-text2">
                  居中箭头适合短提示和轻量操作。
                </div>
              ) }
            >
              <button
                type="button"
                className="rounded-sm border border-border px-3 py-2 text-sm text-text hover:bg-background2"
              >
                打开顶部气泡
              </button>
            </Popover>
          </div>
        </Card>

        {/* 跟随滚动（默认）：在可滚动区域内，Popover 随触发器一起滚动 */ }
        <Card className="bg-background2" padding="lg" bordered shadow="none" hoverEffect={ false }>
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
                    className="rounded-sm px-2 py-1 text-sm text-systemOrange hover:bg-systemOrange/10"
                  >
                    详情
                  </button>
                </Popover>
              </div>
            )) }
          </div>
        </Card>

        {/* 对比：不跟随滚动（followScroll=false） */ }
        <Card className="bg-background2" padding="lg" bordered shadow="none" hoverEffect={ false }>
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
                    className="rounded-sm px-2 py-1 text-sm text-systemOrange hover:bg-systemOrange/10"
                  >
                    详情
                  </button>
                </Popover>
              </div>
            )) }
          </div>
        </Card>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default PopoverExample
