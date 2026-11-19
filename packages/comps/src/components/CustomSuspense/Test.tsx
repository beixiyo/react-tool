import { use, useState } from 'react'
import { Button } from '../Button'
import { Card } from '../Card'
import { ThemeToggle } from '../ThemeToggle'
import { CustomSuspense } from '.'

/** 模拟一次异步加载 */
function createRequest(delay: number) {
  return new Promise<string>((resolve) => {
    setTimeout(() => resolve(`加载完成（耗时 ${delay}ms）`), delay)
  })
}

/** 读取 Promise，未完成时挂起最近的 Suspense 边界 */
function AsyncContent({ request }: { request: Promise<string> }) {
  const text = use(request)
  return <div className="text-text text-sm">{ text }</div>
}

function CustomSuspenseTest() {
  const [defaultRequest, setDefaultRequest] = useState(() => createRequest(1500))
  const [customRequest, setCustomRequest] = useState(() => createRequest(1500))

  return (
    <div className="bg-background text-text h-screen overflow-auto p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <ThemeToggle />
        <div className="text-xl font-semibold">CustomSuspense - Test</div>

        <Card className="flex flex-col gap-4 p-6">
          <div className="text-text2 text-sm">默认占位：子树挂起时展示 Loading</div>
          <div className="border-border relative h-24 rounded-xl border border-dashed">
            <CustomSuspense>
              <div className="flex h-full items-center justify-center">
                <AsyncContent request={ defaultRequest } />
              </div>
            </CustomSuspense>
          </div>
          <Button className="self-start" onClick={ () => setDefaultRequest(createRequest(1500)) }>
            重新加载
          </Button>
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          <div className="text-text2 text-sm">自定义 fallback：骨架占位</div>
          <div className="border-border h-24 rounded-xl border border-dashed p-4">
            <CustomSuspense
              fallback={ <div className="bg-background3 h-full w-full animate-pulse rounded-lg" /> }
            >
              <AsyncContent request={ customRequest } />
            </CustomSuspense>
          </div>
          <Button className="self-start" onClick={ () => setCustomRequest(createRequest(1500)) }>
            重新加载
          </Button>
        </Card>
      </div>
    </div>
  )
}

export default CustomSuspenseTest
