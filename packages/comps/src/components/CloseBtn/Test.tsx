import { useState } from 'react'
import { CloseBtn } from '.'
import { ThemeToggle } from '../ThemeToggle'

export default function CloseBtnTest() {
  const [visible, setVisible] = useState(true)

  return (
    <div className="h-screen overflow-auto p-6">
      <ThemeToggle />
      <div className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">CloseBtn - Test</div>

      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white/60 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/60">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          通用关闭按钮组件演示。支持 absolute / fixed / static 模式，支持 corner 与 offset 定制，支持三种尺寸。
        </div>
      </div>

      <div className="relative h-64 rounded-2xl border border-dashed border-slate-300/70 bg-white/60 p-4 dark:border-slate-700/70 dark:bg-slate-900/60">
        <div className="text-sm text-slate-600 dark:text-slate-400">absolute 模式（默认，右上角）</div>
        <div className="absolute inset-0">
          <CloseBtn onClick={ () => setVisible(false) } />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300/70 bg-white/60 p-4 dark:border-slate-700/70 dark:bg-slate-900/60">
        <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">尺寸演示</div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <CloseBtn mode="static" size="sm" onClick={ () => alert('Small clicked') } />
            <span className="text-xs text-slate-500">sm (24px)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CloseBtn mode="static" size="md" onClick={ () => alert('Medium clicked') } />
            <span className="text-xs text-slate-500">md (32px)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CloseBtn mode="static" size="lg" onClick={ () => alert('Large clicked') } />
            <span className="text-xs text-slate-500">lg (40px)</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300/70 bg-white/60 p-4 dark:border-slate-700/70 dark:bg-slate-900/60">
        <div className="mb-3 text-sm text-slate-600 dark:text-slate-400">static 模式（可内联放置）</div>
        <div className="flex items-center gap-3">
          <CloseBtn mode="static" size="md" onClick={ () => alert('clicked') } />
          <span className="text-slate-700 dark:text-slate-200">和文本并排放置</span>
        </div>
      </div>

      <div className="mt-6 h-64 rounded-2xl border border-dashed border-slate-300/70 bg-white/60 p-4 dark:border-slate-700/70 dark:bg-slate-900/60">
        <div className="mb-3 text-sm text-slate-600 dark:text-slate-400">fixed 模式（左下角，偏移 16px）</div>
        <CloseBtn mode="fixed" corner="bottom-left" offset={ { bottom: 16, left: 16 } } size="lg" />
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300/70 bg-white/60 p-4 dark:border-slate-700/70 dark:bg-slate-900/60">
        <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">不同角落定位演示</div>
        <div className="relative h-32 rounded-lg bg-slate-50 dark:bg-slate-800">
          <CloseBtn mode="absolute" corner="top-left" size="sm" />
          <CloseBtn mode="absolute" corner="top-right" size="sm" />
          <CloseBtn mode="absolute" corner="bottom-left" size="sm" />
          <CloseBtn mode="absolute" corner="bottom-right" size="sm" />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300/70 bg-white/60 p-4 dark:border-slate-700/70 dark:bg-slate-900/60">
        <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">自定义图标尺寸</div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <CloseBtn mode="static" size="sm" iconSize={ 8 } onClick={ () => alert('Tiny icon') } />
            <span className="text-xs text-slate-500">iconSize: 8</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CloseBtn mode="static" size="md" iconSize={ 24 } onClick={ () => alert('Large icon') } />
            <span className="text-xs text-slate-500">iconSize: 24</span>
          </div>
        </div>
      </div>

      { !visible && (
        <div className="mt-6 rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-4 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100/90">
          已点击关闭（仅演示）。
          <button
            className="ml-3 rounded-md bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-500"
            onClick={ () => setVisible(true) }
          >
            重置
          </button>
        </div>
      ) }
    </div>
  )
}
