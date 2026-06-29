import { HtmlPreview } from '.'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'
import { echartsHtml, sampleHtml } from './test.data'

function HtmlPreviewTest() {
  return (
    <div className="relative h-screen overflow-auto p-8 space-y-8 bg-background text-text">
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

      <GithubSourceLink />
    </div>
  )
}

export default HtmlPreviewTest
