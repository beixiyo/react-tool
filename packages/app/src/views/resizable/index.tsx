import { Resizable } from '@/components/Resizable'

/**
 * Resizable 组件测试页面
 *
 * 展示可调整大小的分割面板组件的各种功能
 */
export default function ResizableTest() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Resizable 组件测试
        </h1>

        <div className="space-y-8">
          {/* 水平分割演示 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              水平分割面板
            </h2>
            <div className="h-64 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Resizable
                direction="horizontal"
                initialSize={ 300 }
                minSize={ 100 }
                maxSize={ 500 }
              >
                <div className="bg-blue-100 dark:bg-blue-900 p-4 h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                      左侧面板
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      可调整大小的面板
                    </p>
                  </div>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-4 h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
                      右侧面板
                    </h3>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      自适应宽度
                    </p>
                  </div>
                </div>
              </Resizable>
            </div>
          </section>

          {/* 垂直分割演示 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              垂直分割面板
            </h2>
            <div className="h-80 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Resizable
                direction="vertical"
                initialSize={ 200 }
                minSize={ 100 }
                maxSize={ 300 }
              >
                <div className="bg-purple-100 dark:bg-purple-900 p-4 w-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100 mb-2">
                      顶部面板
                    </h3>
                    <p className="text-purple-700 dark:text-purple-300 text-sm">
                      可调整高度
                    </p>
                  </div>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900 p-4 w-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-orange-900 dark:text-orange-100 mb-2">
                      底部面板
                    </h3>
                    <p className="text-orange-700 dark:text-orange-300 text-sm">
                      自适应高度
                    </p>
                  </div>
                </div>
              </Resizable>
            </div>
          </section>

          {/* 实际应用场景 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              实际应用场景 - 代码编辑器布局
            </h2>
            <div className="h-96 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Resizable
                direction="horizontal"
                initialSize={ 300 }
                minSize={ 200 }
                maxSize={ 500 }
              >
                {/* 文件树面板 */}
                <div className="bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-600">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="font-medium text-gray-900 dark:text-white">文件资源管理器</h3>
                  </div>
                  <div className="p-2 space-y-1">
                    { ['src/', 'components/', 'utils/', 'styles/'].map((folder, index) => (
                      <div
                        key={ index }
                        className="px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
                      >
                        📁
                        {' '}
                        { folder }
                      </div>
                    )) }
                  </div>
                </div>

                {/* 编辑器面板 */}
                <div className="bg-white dark:bg-gray-800">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="font-medium text-gray-900 dark:text-white">代码编辑器</h3>
                  </div>
                  <div className="p-4 font-mono text-sm">
                    <div className="text-gray-500 dark:text-gray-400 mb-2">// Resizable 组件示例</div>
                    <div className="text-blue-600 dark:text-blue-400">const</div>
                    <span className="text-gray-900 dark:text-white"> Resizable = </span>
                    <span className="text-green-600 dark:text-green-400">()</span>
                    <span className="text-gray-900 dark:text-white">
                      {' '}
                      =&gt;
                      {`{`}
                    </span>
                    <br />
                    <div className="ml-4 text-gray-900 dark:text-white">
                      return
                      {' '}
                      <span className="text-red-600 dark:text-red-400">&lt;div&gt;</span>
                    </div>
                    <div className="ml-8 text-gray-900 dark:text-white">
                      Hello Resizable!
                    </div>
                    <div className="ml-4 text-gray-900 dark:text-white">
                      <span className="text-red-600 dark:text-red-400">&lt;/div&gt;</span>
                    </div>
                    <div className="text-gray-900 dark:text-white">{`}`}</div>
                  </div>
                </div>
              </Resizable>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
