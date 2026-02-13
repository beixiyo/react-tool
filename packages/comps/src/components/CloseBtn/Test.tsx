import { CloseBtn } from '.'
import { ThemeToggle } from '../ThemeToggle'

export default function CloseBtnTest() {
  return (
    <div className="h-screen overflow-auto p-6">
      <ThemeToggle />
      <div className="mb-4 text-xl font-semibold text-text">CloseBtn - Test</div>

      <div className="mb-6 rounded-2xl border border-border bg-background2/60 p-6 shadow-sm backdrop-blur-sm">
        <div className="text-sm text-text2">
          通用关闭按钮组件演示。支持 absolute / fixed / static 模式，支持 corner 定制，支持三种尺寸
        </div>
      </div>

      <div className="relative size-48 p-6 rounded-2xl border border-dashed border-border bg-background2/60">
        <div className="text-sm text-text2">absolute 模式（默认，右上角）</div>
        <CloseBtn mode="absolute" size="lg" />
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-border bg-background2/60 p-4">
        <div className="mb-4 text-sm text-text2">尺寸演示</div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <CloseBtn mode="static" size="sm" />
            <span className="text-xs text-text2">sm (24px)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CloseBtn mode="static" size="md" />
            <span className="text-xs text-text2">md (32px)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CloseBtn mode="static" size="lg" />
            <span className="text-xs text-text2">lg (40px)</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-border bg-background2/60 p-4">
        <div className="mb-3 text-sm text-text2">static 模式（可内联放置）</div>
        <div className="flex items-center gap-3">
          <CloseBtn mode="static" size="md" />
          <span className="text-text">和文本并排放置</span>
        </div>
      </div>

      <div className="mt-6 size-48 rounded-2xl border border-dashed border-border bg-background2/60 p-4">
        <div className="mb-3 text-sm text-text2">fixed 模式（右上角，偏移 16px）</div>
        <CloseBtn mode="fixed" corner="top-right" size="lg" />
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-border bg-background2/60 p-4">
        <div className="mb-4 text-sm text-text2">不同角落定位演示</div>
        <div className="relative h-32 rounded-lg bg-background2">
          <CloseBtn mode="absolute" corner="top-left" size="sm" />
          <CloseBtn mode="absolute" corner="top-right" size="sm" />
          <CloseBtn mode="absolute" corner="bottom-left" size="sm" />
          <CloseBtn mode="absolute" corner="bottom-right" size="sm" />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-border bg-background2/60 p-4">
        <div className="mb-4 text-sm text-text2">variant 演示（filled 使用 button 背景）</div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <CloseBtn mode="static" variant="default" size="md" />
            <span className="text-xs text-text2">default</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CloseBtn mode="static" variant="filled" size="sm" />
            <span className="text-xs text-text2">filled sm</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CloseBtn mode="static" variant="filled" size="md" />
            <span className="text-xs text-text2">filled md</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CloseBtn mode="static" variant="filled" size="lg" />
            <span className="text-xs text-text2">filled lg</span>
          </div>
        </div>
        <div className="mt-4 relative h-24 rounded-lg bg-background2">
          <CloseBtn mode="absolute" variant="filled" corner="top-right" size="md" />
          <span className="text-xs text-text2">absolute + filled（右上角）</span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-border bg-background2/60 p-4">
        <div className="mb-4 text-sm text-text2">size 为 number（像素，与 Button 一致）</div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <CloseBtn mode="static" size={ 20 } />
            <span className="text-xs text-text2">20px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CloseBtn mode="static" variant="filled" size={ 28 } />
            <span className="text-xs text-text2">filled 28px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CloseBtn mode="static" size={ 36 } />
            <span className="text-xs text-text2">36px</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-border bg-background2/60 p-4">
        <div className="mb-4 text-sm text-text2">自定义图标尺寸</div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <CloseBtn mode="static" size="sm" iconSize={ 8 } />
            <span className="text-xs text-text2">iconSize: 8</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CloseBtn mode="static" size="md" iconSize={ 24 } />
            <span className="text-xs text-text2">iconSize: 24</span>
          </div>
        </div>
      </div>
    </div>
  )
}
