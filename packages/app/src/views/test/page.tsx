import { Link, Outlet, useLocation } from '@jl-org/react-router'

export default function TestPage() {
  const location = useLocation()
  const params = {}

  const navigationLinks = [
    { path: '/test/nested', label: '第一层嵌套', description: '/test/nested' },
    { path: '/test/nested/deep', label: '第二层嵌套', description: '/test/nested/deep' },
    { path: '/test/nested/deep/123', label: '嵌套参数路由', description: '/test/nested/deep/:id (id=123)' },
    { path: '/test/param/456', label: '必选参数路由', description: '/test/param/:id (id=456)' },
    { path: '/test/optional/hello', label: '可选参数路由', description: '/test/optional/:optional? (optional=hello)' },
    { path: '/test/optional', label: '可选参数路由（无参数）', description: '/test/optional/:optional? (无参数)' },
    { path: '/test/catchall/one/two/three', label: '捕获所有路由（多段）', description: '/test/catchall/:slug* (slug=one/two/three)' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            测试路由 - 根路由
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            这是 test 路由的根页面（使用 Outlet 渲染子路由）
          </p>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                路由层级
              </h2>
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded">
                  /test
                </span>
                <span className="text-blue-500">→</span>
                <span className="text-zinc-600 dark:text-zinc-400">根路由 (Level 0)</span>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h2 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
                当前路径
              </h2>
              <code className="text-sm text-green-700 dark:text-green-400 font-mono bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded">
                {location.pathname}
              </code>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <h2 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
                路由参数
              </h2>
              {Object.keys(params).length > 0
                ? (
                    <div className="space-y-2">
                      {Object.entries(params).map(([key, value]) => (
                        <div key={ key } className="flex items-center gap-2 text-sm">
                          <span className="font-mono bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded text-purple-700 dark:text-purple-400">
                            {key}
                          </span>
                          <span className="text-purple-600 dark:text-purple-300">=</span>
                          <span className="font-mono text-purple-700 dark:text-purple-400">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                : (
                    <p className="text-sm text-purple-600 dark:text-purple-400 italic">
                      无路由参数
                    </p>
                  )}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-3">
                导航到子路由
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
    </div>
  )
}
