import { Badge, Button, Card } from 'comps'

import { onMounted, useGetState } from 'hooks'
import { useState } from 'react'
import { useImmer } from 'use-immer'

function UseGetStateTest() {
  const [logs, setLogs] = useState<Array<{ id: string, content: string }>>([])

  onMounted(() => {
    addLog('🚀 UseGetStateTest 组件已挂载')
  })

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    const logId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setLogs(prev => [...prev, { id: logId, content: logEntry }])

    console.log(message)
  }

  const clearLogs = () => {
    setLogs([])
  }

  const [count, setCount] = useGetState(0, true)
  const [data, setData] = useGetState({ a: 1, b: 2 }, true)

  const [immer, setImmer] = useImmer([
    [{ data: 1, obj: { data: 10 } }, { data: 3, obj: { data: 10 } }],
    [{ data: 2, obj: { data: 10 } }, { data: 4, obj: { data: 10 } }],
  ])

  const handleCountIncrement = () => {
    setCount(count + 1)
    addLog(`📊 Count 更新: ${count} → ${setCount.getLatest()}`)
  }

  const handleDataUpdate = () => {
    const log = () => {
      const latest = setData.getLatest()
      addLog(`📦 Data 更新: ${JSON.stringify(data)} → ${JSON.stringify(latest)}`)
    }

    const latestState = setData.getLatest()
    latestState.a++
    setData(latestState)
    log()

    latestState.a++
    setData(latestState)
    log()
  }

  const handleImmerUpdate = () => {
    setImmer((draft) => {
      draft[0][0].obj.data++
    })
    addLog(`🔄 Immer 更新: 第一个对象的 data 值增加`)
  }

  const handleDataReset = () => {
    setData.reset()
    addLog(`🔄 Data 重置为初始值: ${JSON.stringify({ a: 1, b: 2 })}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            useGetState Hook 测试页面
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            测试 useGetState 和 useImmer 的功能与性能
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* useGetState 测试区域 */}
          <Card
            title="useGetState 测试"
            variant="primary"
            className="h-fit"
          >
            <div className="space-y-6">
              {/* Count 测试 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    基础数值测试
                  </h3>
                  <Badge variant="success" count={ count } />
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    当前值:
                    {' '}
                    <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">{count}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    最新值:
                    {' '}
                    <span className="font-mono text-lg font-bold text-green-600 dark:text-green-400">{setCount.getLatest()}</span>
                  </div>
                </div>

                <Button
                  onClick={ handleCountIncrement }
                  variant="primary"
                  className="w-full"
                >
                  ➕ 增加计数
                </Button>
              </div>

              {/* Data 测试 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    对象数据测试
                  </h3>
                  <Badge variant="warning" count={ data.a } />
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    当前值:
                    {' '}
                    <span className="font-mono text-sm">{JSON.stringify(data, null, 2)}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    最新值:
                    {' '}
                    <span className="font-mono text-sm">{JSON.stringify(setData.getLatest(), null, 2)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={ handleDataUpdate }
                    variant="default"
                    className="flex-1"
                  >
                    🔄 更新数据
                  </Button>
                  <Button
                    onClick={ handleDataReset }
                    variant="default"
                    className="flex-1"
                  >
                    🔄 重置
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* useImmer 测试区域 */}
          <Card
            title="useImmer 测试"
            variant="info"
            className="h-fit"
          >
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  嵌套数组对象测试
                </h3>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    当前 Immer 数据:
                  </div>
                  <div className="space-y-2">
                    {immer.map(items => (
                      <div key={ `row-${items.length}-${items[0]?.data || 0}` } className="flex gap-2">
                        {items.map(item => (
                          <div
                            key={ `item-${item.data}-${item.obj.data}` }
                            className="bg-white dark:bg-gray-600 rounded px-3 py-2 text-center min-w-[60px]"
                          >
                            <div className="text-xs text-gray-500 dark:text-gray-400">data</div>
                            <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{item.data}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">obj.data</div>
                            <div className="font-mono font-bold text-green-600 dark:text-green-400">{item.obj.data}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={ handleImmerUpdate }
                  variant="info"
                  className="w-full"
                >
                  🔄 更新 Immer 数据
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* 日志区域 */}
        <Card
          title="操作日志"
          variant="default"
          headerActions={
            <Button
              onClick={ clearLogs }
              variant="default"
              size="sm"
            >
              🗑️ 清空日志
            </Button>
          }
        >
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
            {logs.length === 0
              ? (
                  <div className="text-gray-500 text-center py-4">
                    暂无日志记录
                  </div>
                )
              : (
                  logs.map(log => (
                    <div key={ log.id } className="mb-1">
                      {log.content}
                    </div>
                  ))
                )}
          </div>
        </Card>

        {/* 功能说明 */}
        <Card
          title="功能说明"
          variant="glass"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">useGetState 特性</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• 支持 getLatest() 获取最新状态</li>
                <li>• 自动合并对象属性</li>
                <li>• 提供 reset() 重置功能</li>
                <li>• 解决 React 闭包陷阱问题</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">useImmer 特性</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• 不可变状态更新</li>
                <li>• 简化嵌套对象操作</li>
                <li>• 性能优化</li>
                <li>• 类型安全</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default UseGetStateTest
