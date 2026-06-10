import { useState } from 'react'
import { TitleBarButtons } from '.'
import { ThemeToggle } from '../ThemeToggle'

export default function TitleBarButtonsTest() {
  const [log, setLog] = useState<string[]>([])

  const push = (msg: string) => {
    setLog(prev => [msg, ...prev].slice(0, 8))
  }

  return (
    <div className="h-screen overflow-auto p-6">
      <ThemeToggle />
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 text-xl font-semibold text-text">TitleBarButtons - Test</div>

        <div className="mb-6 rounded-2xl border border-border bg-background2/60 p-6 shadow-xs backdrop-blur-xs">
          <div className="text-sm text-text2">
            macOS 风格红绿灯按钮。支持预设 / 数字尺寸、自定义按钮顺序、hover 显示图标、点击回调
          </div>
        </div>

        {/* Preset sizes */}
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-background2/60 p-4">
          <div className="mb-4 text-sm text-text2">预设尺寸 (sm / md / lg)</div>
          <div className="flex items-center gap-10">
            <div className="flex flex-col items-center gap-3">
              <TitleBarButtons size="sm" />
              <span className="text-xs text-text2">sm (12px)</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <TitleBarButtons size="md" />
              <span className="text-xs text-text2">md (14px)</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <TitleBarButtons size="lg" />
              <span className="text-xs text-text2">lg (16px)</span>
            </div>
          </div>
        </div>

        {/* Number sizes */}
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-background2/60 p-4">
          <div className="mb-4 text-sm text-text2">数字尺寸 (number)</div>
          <div className="flex items-center gap-10">
            <div className="flex flex-col items-center gap-3">
              <TitleBarButtons size={ 10 } />
              <span className="text-xs text-text2">10px</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <TitleBarButtons size={ 16 } />
              <span className="text-xs text-text2">16px</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <TitleBarButtons size={ 24 } />
              <span className="text-xs text-text2">24px</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <TitleBarButtons size={ 32 } />
              <span className="text-xs text-text2">32px</span>
            </div>
          </div>
        </div>

        {/* Order */}
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-background2/60 p-4">
          <div className="mb-4 text-sm text-text2">顺序 (order)</div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <TitleBarButtons />
              <span className="text-xs text-text2">macOS 默认: close → minimize → maximize</span>
            </div>
            <div className="flex items-center gap-4">
              <TitleBarButtons order={ ['minimize', 'maximize', 'close'] } />
              <span className="text-xs text-text2">Windows 风格: minimize → maximize → close</span>
            </div>
            <div className="flex items-center gap-4">
              <TitleBarButtons order={ ['close', 'maximize'] } />
              <span className="text-xs text-text2">仅显示两个: close → maximize</span>
            </div>
            <div className="flex items-center gap-4">
              <TitleBarButtons order={ ['close'] } />
              <span className="text-xs text-text2">仅关闭按钮</span>
            </div>
          </div>
        </div>

        {/* Callbacks */}
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-background2/60 p-4">
          <div className="mb-4 text-sm text-text2">点击回调</div>
          <div className="flex items-center gap-6">
            <TitleBarButtons
              size="lg"
              onClose={ () => push('close') }
              onMinimize={ () => push('minimize') }
              onMaximize={ () => push('maximize') }
            />
            <div className="flex-1 flex flex-wrap gap-1">
              {log.length === 0 && (
                <span className="text-xs text-text2">← hover 并点击按钮</span>
              )}
              {log.map((msg, i) => (
                <span
                  key={ i }
                  className="text-xs px-2 py-0.5 rounded bg-background2 text-text2 border border-border"
                >
                  {msg}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Dark background */}
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-neutral-900 p-4">
          <div className="mb-4 text-sm text-neutral-400">深色背景下的效果</div>
          <div className="flex items-center gap-10">
            <TitleBarButtons size="sm" />
            <TitleBarButtons size="md" />
            <TitleBarButtons size="lg" />
            <TitleBarButtons size={ 20 } />
          </div>
        </div>

        {/* Custom className */}
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-background2/60 p-4">
          <div className="mb-4 text-sm text-text2">自定义样式 (dotClassName)</div>
          <div className="flex items-center gap-10">
            <div className="flex flex-col items-center gap-3">
              <TitleBarButtons dotClassName="opacity-60" />
              <span className="text-xs text-text2">opacity-60</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <TitleBarButtons dotClassName="shadow-md" />
              <span className="text-xs text-text2">shadow-md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
