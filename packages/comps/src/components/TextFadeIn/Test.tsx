'use client'

import { getRandomNum, randomStr } from '@jl-org/tool'
import { TextFadeIn } from '.'
import { ThemeToggle } from '../ThemeToggle'

export default function TestPage() {
  const text = randomStr().repeat(getRandomNum(20, 50))

  return (
    <div className="h-screen overflow-x-hidden overflow-y-auto transition-colors duration-300">
      <div className="mx-auto px-4 py-12 container">
        <header className="mb-12 flex items-center justify-between">
          <h1 className="text-3xl font-bold">文字渐显效果测试</h1>

          <ThemeToggle />
        </header>

        <TextFadeIn
          text={ text }
        />
      </div>
    </div>
  )
}
