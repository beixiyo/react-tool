import { Button, Card } from 'comps'
import { useGetState } from 'hooks'
import { useState } from 'react'

export default function UseGetStateTest() {
  /** 基础数字类型测试 */
  const [count, setCount] = useGetState(0)

  /** 对象类型测试（自动合并） */
  const [userInfo, setUserInfo] = useGetState({
    name: '张三',
    age: 18,
    email: 'zhangsan@example.com',
  })

  /** 闭包陷阱测试场景 */
  const [closureCount, setClosureCount] = useGetState(0)
  const [logs, setLogs] = useState<string[]>([])

  /** 演示闭包陷阱的解决 */
  const handleClosureTest = () => {
    setClosureCount(999)
    const latest = setClosureCount.getLatest()
    console.log({ latest, closureCount })

    setLogs(prev => [...prev, `setClosureCount(999)`])
    setLogs(prev => [...prev, `正常 useState 获取的闭包陷阱值: ${closureCount}`])
    setLogs(prev => [...prev, `getLatest 获取到最新值: ${latest}`])
  }

  /** 函数式更新测试 */
  const handleFunctionalUpdate = () => {
    setCount(prev => prev + 5)
  }

  /** 对象自动合并测试 */
  const handlePartialUpdate = () => {
    setUserInfo({ age: userInfo.age + 1 })
  }

  // Reset 功能测试
  const handleResetCount = () => {
    setCount.reset()
  }

  const handleResetUserInfo = () => {
    setUserInfo.reset()
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* 标题 */ }
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">
            useGetState 测试页面
          </h1>
          <p className="text-text2 text-sm">
            测试 useGetState Hook 的各项功能：getLatest、自动合并、reset 等
          </p>
        </div>

        {/* 基础数字类型测试 */ }
        <Card
          title="基础数字类型测试"
          variant="default"
          shadow="md"
          rounded="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-semibold text-text">
                当前值:
                {' '}
                <span className="text-button">{ count }</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={ () => setCount(count + 1) }
              >
                +1
              </Button>
              <Button
                variant="primary"
                onClick={ () => setCount(count - 1) }
              >
                -1
              </Button>
              <Button
                variant="success"
                onClick={ handleFunctionalUpdate }
              >
                函数式更新 (+5)
              </Button>
              <Button
                variant="warning"
                onClick={ handleResetCount }
              >
                重置
              </Button>
            </div>
            <div className="text-xs text-text2 bg-background2 p-3 rounded-md">
              <div className="font-medium mb-1">说明：</div>
              <div>• 直接更新：setCount(count + 1)</div>
              <div>• 函数式更新：setCount(prev =&gt; prev + 5)</div>
              <div>• 重置：setCount.reset()</div>
            </div>
          </div>
        </Card>

        {/* 对象类型测试（自动合并） */ }
        <Card
          title="对象类型测试（自动合并）"
          variant="default"
          shadow="md"
          rounded="lg"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-text">
                <span className="font-medium">姓名：</span>
                <span className="text-button">{ userInfo.name }</span>
              </div>
              <div className="text-sm text-text">
                <span className="font-medium">年龄：</span>
                <span className="text-button">{ userInfo.age }</span>
              </div>
              <div className="text-sm text-text">
                <span className="font-medium">邮箱：</span>
                <span className="text-button">{ userInfo.email }</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={ () => setUserInfo({ name: '李四' }) }
              >
                更新姓名
              </Button>
              <Button
                variant="primary"
                onClick={ handlePartialUpdate }
              >
                年龄 +1
              </Button>
              <Button
                variant="primary"
                onClick={ () => setUserInfo({ email: 'lisi@example.com' }) }
              >
                更新邮箱
              </Button>
              <Button
                variant="success"
                onClick={ () => setUserInfo(prev => ({
                  ...prev,
                  age: prev.age + 10,
                })) }
              >
                函数式更新年龄 (+10)
              </Button>
              <Button
                variant="warning"
                onClick={ handleResetUserInfo }
              >
                重置
              </Button>
            </div>
            <div className="text-xs text-text2 bg-background2 p-3 rounded-md">
              <div className="font-medium mb-1">说明：</div>
              <div>• 对象会自动合并，只更新传入的属性</div>
              <div>• setUserInfo(&#123; name: '李四' &#125;) 只会更新 name，其他属性保持不变</div>
            </div>
          </div>
        </Card>

        {/* 闭包陷阱解决测试 */ }
        <Card
          title="闭包陷阱解决测试（getLatest）"
          variant="default"
          shadow="md"
          rounded="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-semibold text-text">
                当前值:
                {' '}
                <span className="text-button">{ closureCount }</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={ handleClosureTest }
              >
                测试闭包陷阱解决
              </Button>
              <Button
                variant="info"
                onClick={ () => {
                  const latest = setClosureCount.getLatest()
                  setLogs(prev => [...prev, `手动获取最新值: ${latest}`])
                } }
              >
                手动获取最新值
              </Button>
              <Button
                variant="warning"
                onClick={ () => setLogs([]) }
              >
                清空日志
              </Button>
              <Button
                variant="warning"
                onClick={ () => setClosureCount(() => 0) }
              >
                重置
              </Button>
            </div>
            { logs.length > 0 && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-text mb-2">
                  操作日志：
                </div>
                <div className="bg-background2 rounded-md p-3 max-h-40 overflow-y-auto">
                  { logs.map((log, index) => (
                    <div
                      key={ index }
                      className="text-xs text-text2 py-1 font-mono"
                    >
                      { log }
                    </div>
                  )) }
                </div>
              </div>
            ) }
            <div className="text-xs text-text2 bg-background2 p-3 rounded-md">
              <div className="font-medium mb-1">说明：</div>
              <div>• 在异步操作中，使用 setClosureCount.getLatest() 可以获取最新值</div>
              <div>• 避免了闭包陷阱，无需将值作为依赖传入</div>
            </div>
          </div>
        </Card>

        {/* 代码示例 */ }
        <Card
          title="代码示例"
          variant="glass"
          shadow="md"
          rounded="lg"
        >
          <div className="space-y-4">
            <div className="text-sm text-text">
              <div className="font-medium mb-2">基础用法：</div>
              <pre className="bg-background2 p-4 rounded-md overflow-x-auto text-xs">
                { `const [count, setCount] = useGetState(0)

// 直接更新
setCount(count + 1)

// 函数式更新
setCount(prev => prev + 1)

// 获取最新值（解决闭包陷阱）
const latest = setCount.getLatest()

// 重置到初始值
setCount.reset()`}
              </pre>
            </div>
            <div className="text-sm text-text">
              <div className="font-medium mb-2">对象自动合并：</div>
              <pre className="bg-background2 p-4 rounded-md overflow-x-auto text-xs">
                { `const [user, setUser] = useGetState({
  name: '张三',
  age: 18
})

// 只更新 name，age 保持不变
setUser({ name: '李四' })

// 结果: { name: '李四', age: 18 }`}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
