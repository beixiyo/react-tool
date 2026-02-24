'use client'

import { randomStr } from '@jl-org/tool'
import { Settings, Sliders, ToggleLeft, ToggleRight, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from 'utils'
import { AutoScrollAnimate } from '.'
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

  /** 调整速度 */
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIntervalSpeed(Number(e.target.value))
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full rounded-xl bg-white p-4 shadow-lg">
        <h1 className="mb-4 text-center text-2xl text-gray-800 font-bold">自动滚动视图测试</h1>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={ () => setAutoScroll(!autoScroll) }
            className={ cn(
              'flex items-center gap-2 px-3 py-1 rounded-xs text-sm',
              autoScroll
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700',
            ) }
          >
            { autoScroll
              ? <ToggleRight size={ 16 } />
              : <ToggleLeft size={ 16 } /> }
            自动滚动:
            { ' ' }
            { autoScroll
              ? '开启'
              : '关闭' }
          </button>

          <button
            onClick={ () => setFadeInMask(!fadeInMask) }
            className={ cn(
              'flex items-center gap-2 px-3 py-1 rounded-xs text-sm',
              fadeInMask
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700',
            ) }
          >
            { fadeInMask
              ? <ToggleRight size={ 16 } />
              : <ToggleLeft size={ 16 } /> }
            渐变蒙层:
            { ' ' }
            { fadeInMask
              ? '开启'
              : '关闭' }
          </button>

          <button
            onClick={ togglePlayPause }
            className={ cn(
              'flex items-center gap-2 px-3 py-1 rounded-xs text-sm',
              isPlaying
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700',
            ) }
          >
            <Zap size={ 16 } />
            { isPlaying
              ? '暂停自动'
              : '开始自动' }
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <Sliders size={ 16 } className="text-gray-500" />
          <span className="text-sm text-gray-500">更新间隔:</span>
          <input
            type="range"
            min="1000"
            max="10000"
            step="500"
            value={ intervalSpeed }
            onChange={ handleSpeedChange }
            className="h-2 grow cursor-pointer appearance-none rounded-lg bg-gray-200"
          />
          <span className="text-sm text-gray-500">
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
                    : 'mr-auto bg-gray-200 text-gray-800 rounded-bl-none',
                ) }
              >
                { message.text }
              </div>
            )) }
          </div>
        </AutoScrollAnimate>

        <div className="flex gap-2">
          <button
            onClick={ clearMessages }
            className={ cn(
              'flex-1 px-4 py-2 border border-gray-300 rounded-lg',
              'hover:bg-gray-100 active:scale-95 transition-all duration-200',
              'text-gray-700 text-sm',
            ) }
          >
            清空消息
          </button>

          <button
            onClick={ resetMessages }
            className={ cn(
              'flex-1 px-4 py-2 border border-gray-300 rounded-lg',
              'hover:bg-gray-100 active:scale-95 transition-all duration-200',
              'text-gray-700 text-sm',
            ) }
          >
            重置初始消息
          </button>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center gap-2">
            <Settings size={ 16 } className="text-gray-500" />
            <h3 className="text-sm text-gray-500 font-medium">功能说明:</h3>
          </div>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
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
      </div>

      <div className="mt-8 text-xs text-gray-500">
        自动滚动视图组件演示 ©
        { ' ' }
        { new Date().getFullYear() }
      </div>
    </div>
  )
}

export default TestAutoScrollView
