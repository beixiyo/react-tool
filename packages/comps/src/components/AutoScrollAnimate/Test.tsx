'use client'

import { randomStr } from '@jl-org/tool'
import { Settings, Sliders, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from 'utils'
import { AutoScrollAnimate } from '.'
import { Button } from '../Button'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { Slider } from '../Slider'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'
import { MOCK_CONVERSATIONS, RANDOM_SYSTEM_RESPONSES, RANDOM_USER_MESSAGES } from './test.data'

export function TestAutoScrollView() {
  const [messages, setMessages] = useState<{ id: string, text: string, sender: 'user' | 'system' }[]>([])
  const [autoScroll, setAutoScroll] = useState(true)
  const [fadeInMask, setFadeInMask] = useState(true)
  const [intervalSpeed, setIntervalSpeed] = useState(1000)
  const [isPlaying, setIsPlaying] = useState(true)

  /** 加载初始对话数据 */
  useEffect(() => {
    const initialMessages = MOCK_CONVERSATIONS.map((msg, index) => ({
      id: `${index + 1}`,
      text: msg.text,
      sender: msg.sender as 'user' | 'system',
    }))

    setMessages(initialMessages)
  }, [])

  /** 随机获取消息和回复 */
  const getRandomMessage = () => {
    return RANDOM_USER_MESSAGES[Math.floor(Math.random() * RANDOM_USER_MESSAGES.length)]
  }

  const getRandomResponse = () => {
    return RANDOM_SYSTEM_RESPONSES[Math.floor(Math.random() * RANDOM_SYSTEM_RESPONSES.length)]
  }

  /** 定时添加新消息 */
  useEffect(() => {
    if (!isPlaying)
      return

    const interval = setInterval(() => {
      /** 添加用户消息 */
      const userMessage = getRandomMessage()
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + randomStr(),
          text: userMessage,
          sender: 'user',
        },
      ])

      /** 延迟添加系统回复 */
      setTimeout(() => {
        const systemResponse = getRandomResponse()
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + randomStr(),
            text: systemResponse,
            sender: 'system',
          },
        ])
      }, 1000)
    }, intervalSpeed)

    return () => clearInterval(interval)
  }, [isPlaying, intervalSpeed])

  /** 切换播放状态 */
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  /** 清空消息 */
  const clearMessages = () => {
    setMessages([])
  }

  /** 重置为初始消息 */
  const resetMessages = () => {
    const initialMessages = MOCK_CONVERSATIONS.map((msg, index) => ({
      id: `${index + 1}`,
      text: msg.text,
      sender: msg.sender as 'user' | 'system',
    }))

    setMessages(initialMessages)
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-4 text-text">
      <div className="max-w-lg w-full">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">自动滚动视图测试</h1>
          <ThemeToggle />
        </header>

        <Card className="p-4">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <Switch
              checked={ autoScroll }
              onChange={ setAutoScroll }
              label="自动滚动"
            />
            <Switch
              checked={ fadeInMask }
              onChange={ setFadeInMask }
              label="渐变蒙层"
            />
            <Button
              variant={ isPlaying
                ? 'danger'
                : 'success' }
              size="sm"
              leftIcon={ <Zap size={ 16 } /> }
              onClick={ togglePlayPause }
            >
              { isPlaying
                ? '暂停自动'
                : '开始自动' }
            </Button>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <Sliders size={ 16 } className="text-text3" />
            <span className="text-sm text-text2">更新间隔:</span>
            <Slider
              min={ 1000 }
              max={ 10000 }
              step={ 500 }
              value={ intervalSpeed }
              onChange={ setIntervalSpeed }
              className="grow"
            />
            <span className="w-12 text-right text-sm text-text2">
              { intervalSpeed / 1000 }
              秒
            </span>
          </div>

          <AutoScrollAnimate
            autoScroll={ autoScroll }
            fadeInMask={ fadeInMask }
            height="400px"
          >
            <div className="p-4 space-y-4">
              { messages.map(message => (
                <div
                  key={ message.id }
                  className={ cn(
                    'max-w-[80%] p-3 rounded-lg wrap-break-word',
                    message.sender === 'user'
                      ? 'ml-auto bg-indigo-500 text-white rounded-br-none'
                      : 'mr-auto bg-background3 text-text rounded-bl-none',
                  ) }
                >
                  { message.text }
                </div>
              )) }
            </div>
          </AutoScrollAnimate>

          <div className="flex gap-2">
            <Button variant="secondary" block onClick={ clearMessages }>
              清空消息
            </Button>
            <Button variant="secondary" block onClick={ resetMessages }>
              重置初始消息
            </Button>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center gap-2">
              <Settings size={ 16 } className="text-text3" />
              <h3 className="text-sm text-text2 font-medium">功能说明:</h3>
            </div>
            <ul className="list-disc pl-5 text-sm text-text2 space-y-1">
              <li>自动模拟消息对话，定时添加新内容</li>
              <li>
                可调整消息更新间隔（
                { intervalSpeed / 1000 }
                秒）
              </li>
              <li>可暂停/继续自动消息生成</li>
              <li>自动滚动功能可开关</li>
              <li>上下渐变蒙层可切换</li>
              <li>手动滚动时会暂停自动滚动功能</li>
              <li>滚动回底部时会重新启用自动滚动</li>
            </ul>
          </div>
        </Card>

        <div className="mt-8 text-center text-xs text-text3">
          自动滚动视图组件演示 ©
          { ' ' }
          { new Date().getFullYear() }
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default TestAutoScrollView
