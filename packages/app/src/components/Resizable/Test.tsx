import { useState } from 'react'
import { Resizable } from './index'

/**
 * Resizable 组件功能演示
 *
 * 展示所有配置选项和使用场景
 */
export default function ResizableTest() {
  const [horizontalSize, setHorizontalSize] = useState(300)
  const [verticalSize, setVerticalSize] = useState(200)
  const [disabled, setDisabled] = useState(false)

  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Resizable 组件演示
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          展示可调整大小的分割面板组件的各种功能和配置选项
        </p>

        {/* 基础水平分割演示 */ }
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            1. 基础水平分割
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="h-64">
              <Resizable
                direction="horizontal"
                initialSize={ 300 }
                minSize={ 100 }
                onSizeChange={ setHorizontalSize }
              >
                <div className="bg-blue-100 dark:bg-blue-900 p-4 h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                      左侧面板
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      当前宽度:
                      {' '}
                      { horizontalSize }
                      px
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 text-xs mt-2">
                      拖拽中间的分割线调整大小
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
                    <p className="text-green-600 dark:text-green-400 text-xs mt-2">
                      内容会自动换行和滚动
                    </p>
                  </div>
                </div>
              </Resizable>
            </div>
          </div>
        </section>

        {/* 垂直分割演示 */ }
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            2. 垂直分割
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="h-80">
              <Resizable
                direction="vertical"
                initialSize={ 200 }
                minSize={ 80 }
                onSizeChange={ setVerticalSize }
              >
                <div className="bg-purple-100 dark:bg-purple-900 p-4 w-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100 mb-2">
                      顶部面板
                    </h3>
                    <p className="text-purple-700 dark:text-purple-300 text-sm">
                      当前高度:
                      {' '}
                      { verticalSize }
                      px
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
          </div>
        </section>

        {/* 带最大尺寸限制的演示 */ }
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            3. 带最大尺寸限制
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="h-64">
              <Resizable
                direction="horizontal"
                initialSize={ 200 }
                minSize={ 100 }
                maxSize={ 400 }
                onSizeChange={ size => console.log('带限制的面板大小:', size) }
              >
                <div className="bg-red-100 dark:bg-red-900 p-4 h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
                      受限面板
                    </h3>
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      最小: 100px, 最大: 400px
                    </p>
                  </div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 p-4 h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                      自由面板
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      无尺寸限制
                    </p>
                  </div>
                </div>
              </Resizable>
            </div>
          </div>
        </section>

        {/* 禁用状态演示 */ }
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            4. 禁用状态
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={ disabled }
                onChange={ e => setDisabled(e.target.checked) }
                className="rounded border-gray-300"
              />
              <span className="text-gray-700 dark:text-gray-300">禁用调整大小</span>
            </label>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="h-64">
              <Resizable
                direction="horizontal"
                initialSize={ 250 }
                minSize={ 100 }
                disabled={ disabled }
              >
                <div className="bg-indigo-100 dark:bg-indigo-900 p-4 h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                      面板 A
                    </h3>
                    <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                      { disabled
                        ? '调整已禁用'
                        : '可以调整大小' }
                    </p>
                  </div>
                </div>
                <div className="bg-pink-100 dark:bg-pink-900 p-4 h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-pink-900 dark:text-pink-100 mb-2">
                      面板 B
                    </h3>
                    <p className="text-pink-700 dark:text-pink-300 text-sm">
                      固定比例
                    </p>
                  </div>
                </div>
              </Resizable>
            </div>
          </div>
        </section>

        {/* 自定义分割线样式演示 */ }
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            5. 自定义分割线样式
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="h-64">
              <Resizable
                direction="horizontal"
                initialSize={ 200 }
                minSize={ 100 }
                resizeHandleClassName="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                resizeHandleStyle={ {
                  width: '8px',
                  borderRadius: '4px',
                } }
              >
                <div className="bg-teal-100 dark:bg-teal-900 p-4 h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-teal-900 dark:text-teal-100 mb-2">
                      自定义分割线
                    </h3>
                    <p className="text-teal-700 dark:text-teal-300 text-sm">
                      渐变色彩分割线
                    </p>
                  </div>
                </div>
                <div className="bg-cyan-100 dark:bg-cyan-900 p-4 h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-cyan-900 dark:text-cyan-100 mb-2">
                      另一个面板
                    </h3>
                    <p className="text-cyan-700 dark:text-cyan-300 text-sm">
                      更宽的圆角分割线
                    </p>
                  </div>
                </div>
              </Resizable>
            </div>
          </div>
        </section>

        {/* 实际应用场景演示 */ }
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            6. 实际应用场景 - 代码编辑器
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="h-96">
              <Resizable
                direction="horizontal"
                initialSize={ 300 }
                minSize={ 200 }
                maxSize={ 500 }
                className="border border-gray-200 dark:border-gray-600 rounded"
              >
                {/* 文件树面板 */ }
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

                {/* 编辑器面板 */ }
                <div className="bg-white dark:bg-gray-800">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="font-medium text-gray-900 dark:text-white">代码编辑器</h3>
                  </div>
                  <div className="p-4 font-mono text-sm">
                    <div className="text-gray-500 dark:text-gray-400 mb-2">// 这是一个代码编辑器的示例</div>
                    <div className="text-blue-600 dark:text-blue-400">const</div>
                    <span className="text-gray-900 dark:text-white"> component = </span>
                    <span className="text-green-600 dark:text-green-400">()</span>
                    <span className="text-gray-900 dark:text-white">
                      {' '}
                      =&gt;
                      { `{` }
                    </span>
                    <br />
                    <div className="ml-4 text-gray-900 dark:text-white">
                      return
                      {' '}
                      <span className="text-red-600 dark:text-red-400">&lt;div&gt;</span>
                    </div>
                    <div className="ml-8 text-gray-900 dark:text-white">
                      Hello World!
                    </div>
                    <div className="ml-4 text-gray-900 dark:text-white">
                      <span className="text-red-600 dark:text-red-400">&lt;/div&gt;</span>
                    </div>
                    <div className="text-gray-900 dark:text-white">{ `}` }</div>
                  </div>
                </div>
              </Resizable>
            </div>
          </div>
        </section>

        {/* 配置说明 */ }
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            配置选项说明
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-2 font-medium text-gray-900 dark:text-white">属性</th>
                    <th className="text-left py-2 font-medium text-gray-900 dark:text-white">类型</th>
                    <th className="text-left py-2 font-medium text-gray-900 dark:text-white">默认值</th>
                    <th className="text-left py-2 font-medium text-gray-900 dark:text-white">说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  <tr>
                    <td className="py-2 font-mono text-blue-600 dark:text-blue-400">direction</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">'horizontal' | 'vertical'</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">'horizontal'</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">调整方向</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-blue-600 dark:text-blue-400">initialSize</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">number</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">200</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">第一个面板的初始大小（像素）</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-blue-600 dark:text-blue-400">minSize</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">number</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">50</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">第一个面板的最小大小（像素）</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-blue-600 dark:text-blue-400">maxSize</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">number</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">-</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">第一个面板的最大大小（像素）</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-blue-600 dark:text-blue-400">onSizeChange</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">(size: number) =&gt; void</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">-</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">大小变化时的回调函数</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-blue-600 dark:text-blue-400">disabled</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">boolean</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">false</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">是否禁用调整大小功能</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-blue-600 dark:text-blue-400">resizeHandleClassName</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">string</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">-</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">分割线的自定义类名</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-blue-600 dark:text-blue-400">resizeHandleStyle</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">React.CSSProperties</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">-</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">分割线的自定义样式</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
