import { ToningTheme } from 'config'
import { GithubSourceLink } from '@/components/GithubSourceLink'

/**
 * Tailwind 调色示例页
 *
 * 本页用于本地测试 `tailwind.config.js` 中通过 addComponents 注册的
 * `toning-*` 系列样式，覆盖背景 / 文本 / 边框三类。
 */
function TailwindPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-medium mb-6">调色类示例 (toning-*)</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        { ToningTheme.map((color, index) => (
          <div
            key={ color }
            className={ `${color} p-4 rounded-lg` }
          >
            <div>
              toning-
              { color }
            </div>

            <div className="mt-3 text-sm">
              这是
              { color }
              {' '}
              色的背景 + 文本 + 边框示例
            </div>
          </div>
        )) }
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default TailwindPage
