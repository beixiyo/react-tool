import { useNotifyParentReady } from 'hooks'
import { HtmlPreview } from '.'
import { ThemeToggle } from '../ThemeToggle'
import { echartsHtml, sampleHtml } from './test.data'

export default function HtmlPreviewTest() {
  /** 通知父窗口组件准备就绪（用于截图） */
  useNotifyParentReady()

  return (
    <div className="relative h-screen overflow-auto p-8 space-y-8 dark:bg-black">
      <ThemeToggle />

      <HtmlPreview
        html={ sampleHtml }
        title="基础用法"
        initialPosition={ { x: 50, y: 50 } }
      />

      <HtmlPreview
        html={ echartsHtml }
        title="可拖动的图表预览"
        initialPosition={ { x: 100, y: 100 } }
      />
    </div>
  )
}
