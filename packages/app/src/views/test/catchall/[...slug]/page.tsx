import { Link, useLocation, useParams } from '@jl-org/react-router'

export default function TestCatchAllPage() {
  const location = useLocation()
  const params = useParams().params

  const navigationLinks = [
    { path: '/test', label: '返回根路由', description: '/test' },
    { path: '/test/catchall/one', label: '捕获所有路由（单段）', description: '/test/catchall/:slug* (slug=one)' },
    { path: '/test/catchall/one/two', label: '捕获所有路由（两段）', description: '/test/catchall/:slug* (slug=one/two)' },
    { path: '/test/catchall/one/two/three', label: '捕获所有路由（三段）', description: '/test/catchall/:slug* (slug=one/two/three)' },
    { path: '/test/catchall/a/b/c/d/e/f', label: '捕获所有路由（多段）', description: '/test/catchall/:slug* (slug=a/b/c/d/e/f)' },
  ]

  /** 获取 slug 参数（可能是字符串或字符串数组） */
  const slugValue = `${params.slug || ''}/${params['*']}`
  const slugArray = typeof slugValue === 'string'
    ? slugValue.split('/').filter(Boolean)
    : []

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-100 dark:from-zinc-900 dark:to-zinc-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            测试路由 - 捕获所有参数路由
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            这是 test/catchall/:slug* 路由页面（捕获所有参数，使用 [...slug] 语法）
          </p>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                路由层级
              </h2>
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400 flex-wrap">
                <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-sm">
                  /test
                </span>
                <span className="text-blue-500">→</span>
                <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-sm">
                  /catchall
                </span>
                <span className="text-blue-500">→</span>
                <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-sm">
                  /:slug*
                </span>
                <span className="text-blue-500">→</span>
                <span className="text-zinc-600 dark:text-zinc-400">捕获所有参数路由</span>
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
              {slugValue
                ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-mono bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded-sm text-purple-700 dark:text-purple-400">
                          slug
                        </span>
                        <span className="text-purple-600 dark:text-purple-300">=</span>
                        <span className="font-mono text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded-sm">
                          {String(slugValue)}
                        </span>
                        <span className="ml-2 px-2 py-0.5 text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-sm">
                          捕获所有
                        </span>
                      </div>
                      {slugArray.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                          <h3 className="text-xs font-semibold text-purple-900 dark:text-purple-300 mb-2">
                            解析后的路径段：
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {slugArray.map((segment, index) => (
                              <div
                                key={ index }
                                className="flex items-center gap-1 text-xs"
                              >
                                <span className="font-mono bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded-sm text-purple-700 dark:text-purple-400">
                                  [
                                  {index}
                                  ]
                                </span>
                                <span className="text-purple-600 dark:text-purple-300">=</span>
                                <span className="font-mono text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded-sm">
                                  {segment}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                : (
                    <p className="text-sm text-purple-600 dark:text-purple-400 italic">
                      无路由参数（当前路径：/test/catchall）
                    </p>
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

            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
              <h2 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
                说明
              </h2>
              <ul className="text-sm text-indigo-700 dark:text-indigo-400 space-y-1 list-disc list-inside">
                <li>
                  捕获所有参数路由使用
                  <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded-sm">[...slug]</code>
                  {' '}
                  语法
                </li>
                <li>
                  生成的路由路径为
                  <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded-sm">/:slug*</code>
                </li>
                <li>可以匹配任意数量的路径段，包括零段</li>
                <li>
                  参数值以
                  <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded-sm">/</code>
                  {' '}
                  分隔的字符串形式传递
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
