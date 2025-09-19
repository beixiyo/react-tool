'use client'

import { getRandomNum, randomStr } from '@jl-org/tool'
import { RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { TextFadeIn } from '.'

export default function TestPage() {

  const [updateKey, setUpdateKey] = useState(0)
  const [dynamicText, setDynamicText] = useState('这是一个动态文字演示...')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    /** 每秒添加随机长度的文字 */
    timerRef.current = setInterval(() => {
      setDynamicText(prev => `${prev} ${randomStr().repeat(getRandomNum(1, 2))} `)
    }, 500)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const handleReset = () => {
    setUpdateKey(prev => prev + 1)
    setDynamicText('这是一个动态文字演示...')
  }

  return (
    <div className="h-screen overflow-x-hidden overflow-y-auto transition-colors duration-300">
      <div className="mx-auto px-4 py-12 container">
        <header className="mb-12 flex items-center justify-between">
          <h1 className="text-3xl font-bold">文字渐显效果测试</h1>
        </header>

        <main>
          <div className="mb-12 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">高级版本</h2>
              <button
                onClick={ handleReset }
                className="flex items-center gap-1 rounded-full p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <RefreshCw size={ 16 } />
                <span>重置</span>
              </button>
            </div>

            <TextFadeIn
              key={ updateKey }
              text={ dynamicText }
            />
          </div>
        </main>
      </div>
    </div>
  )
}
