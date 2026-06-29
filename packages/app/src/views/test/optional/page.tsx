import { Link, Outlet, useLocation, useParams } from '@jl-org/react-router'
import { GithubSourceLink } from '@/components/GithubSourceLink'

function TestOptionalIndexPage() {
  const location = useLocation()
  const params = useParams().params

  const navigationLinks = [
    { path: '/test', label: '返回根路由', description: '/test' },
    { path: '/test/optional/hello', label: '可选参数路由 (optional=hello)', description: '/test/optional/:optional?' },
    { path: '/test/optional/world', label: '可选参数路由 (optional=world)', description: '/test/optional/:optional?' },
    { path: '/test/optional/test123', label: '可选参数路由 (optional=test123)', description: '/test/optional/:optional?' },
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-100 dark:from-zinc-900 dark:to-zinc-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            测试路由 - 可选参数路由（索引页）
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            这是 test/optional 路由页面（可选参数路由的索引页，使用 Outlet 渲染子路由）
          </p>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                路由层级
              </h2>
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-sm">
                  /test
                </span>
                <span className="text-blue-500">→</span>
                <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-sm">
                  /optional
                </span>
                <span className="text-blue-500">→</span>
                <span className="text-zinc-600 dark:text-zinc-400">可选参数路由索引 (Level 1)</span>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h2 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
                当前路径
              </h2>
              <code className="text-sm text-green-700 dark:text-green-400 font-mono bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-sm">
                {location.pathname}
              </code>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <h2 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
                路由参数
              </h2>
              {Object.keys(params).length > 0 && Object.values(params).some(v => v)
                ? (
                    <div className="space-y-2">
                      {Object.entries(params).map(([key, value]) => (
                        <div key={ key } className="flex items-center gap-2 text-sm">
                          <span className="font-mono bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded-sm text-purple-700 dark:text-purple-400">
                            {key}
                          </span>
                          <span className="text-purple-600 dark:text-purple-300">=</span>
                          <span className="font-mono text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded-sm">
                            {String(value)}
                          </span>
                          <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-sm">
                            可选
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                : (
                    <div className="space-y-2">
                      <p className="text-sm text-purple-600 dark:text-purple-400 italic">
                        当前未提供可选参数（这是索引页）
                      </p>
                      <p className="text-xs text-purple-500 dark:text-purple-500">
                        提示：访问 /test/optional/任意值 可以看到参数值
                      </p>
                    </div>
                  )}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-3">
                导航到其他路由
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {navigationLinks.map(link => (
                  <Link
                    key={ link.path }
                    to={ link.path }
                    className="flex flex-col p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    <span className="text-sm font-medium text-amber-900 dark:text-amber-300">
                      {link.label}
                    </span>
                    <code className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-mono">
                      {link.description}
                    </code>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 子路由渲染区域 */}
        <div className="mt-6">
          <Outlet />
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default TestOptionalIndexPage
