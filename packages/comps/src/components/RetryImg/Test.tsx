import { useState } from 'react'
import { RetryImg } from '.'
import { Button } from '../Button'
import { Message } from '../Message'

const VALID_SRC = 'https://images.pexels.com/photos/15736980/pexels-photo-15736980.jpeg?auto=compress&cs=tinysrgb&w=300'
const INVALID_SRC = 'https://httpstat.us/404/image-that-does-not-exist.png'

export default function Test() {
  const [src, setSrc] = useState(VALID_SRC)
  const [retryCount, setRetryCount] = useState(3)
  const [key, setKey] = useState(0)

  return (
    <div className="min-h-screen p-12 space-y-12">
      <h1 className="text-2xl font-semibold tracking-tight">RetryImg</h1>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-text2">正常加载</h2>
        <RetryImg
          src={ VALID_SRC }
          className="w-64 rounded-xl"
          retryCount={ 3 }
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-text2">加载失败 (重试 3 次)</h2>
        <p className="text-sm text-text3">
          打开 DevTools Network 面板观察：应发起 3 次请求后停止
        </p>
        <RetryImg
          src={ INVALID_SRC }
          className="w-64 h-40 rounded-xl bg-background2"
          retryCount={ 3 }
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-text2">动态切换 src</h2>
        <p className="text-sm text-text3">
          点击按钮在有效/无效 URL 间切换，验证 key 正确递增触发重新挂载
        </p>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={ () => {
              const next = src === VALID_SRC
                ? INVALID_SRC
                : VALID_SRC
              setSrc(next)
              setKey(prev => prev + 1)
              Message.default(next === VALID_SRC
                ? '已切换为有效 URL'
                : '已切换为无效 URL（将重试 3 次）')
            } }
          >
            切换 src (
            { src === VALID_SRC
              ? '当前有效'
              : '当前无效' }
            )
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={ () => {
              const next = retryCount === 3
                ? 1
                : 3
              setRetryCount(next)
              setKey(prev => prev + 1)
              Message.default(`retryCount 已改为 ${next}`)
            } }
          >
            retryCount:
            {' '}
            { retryCount }
          </Button>
        </div>
        <RetryImg
          key={ key }
          src={ src }
          className="w-64 h-40 rounded-xl bg-background2 object-cover"
          retryCount={ retryCount }
        />
      </section>
    </div>
  )
}
