'use client'

import { useState } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Checkbox, Checkmark } from '.'

export default function CheckmarkDemo() {
  const [checked1, setChecked1] = useState(false)
  const [checked2, setChecked2] = useState(false)
  const [checked3, setChecked3] = useState(false)
  const [checked4, setChecked4] = useState(false)
  const [checked5, setChecked5] = useState(false)

  return (
    <div className="h-screen overflow-auto p-8 space-y-12">
      <section>
        <ThemeToggle />
        <h1 className="mb-6 text-3xl font-bold">Checkmark & Checkbox 演示</h1>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">基础复选框</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={ checked1 }
              onChange={ setChecked1 }
              size={ 32 }
              label="带标签的复选框"
              borderColor="#f40"
              checkedBackgroundColor="#f40"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={ checked2 }
              onChange={ setChecked2 }
              size={ 40 }
              strokeWidth={ 4 }
              label="自定义大小和颜色"
              labelClassName="text-indigo-700 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={ checked3 }
              onChange={ setChecked3 }
              size={ 32 }
              disabled
              label="禁用状态"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={ checked3 }
              onChange={ setChecked3 }
              size={ 32 }
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">高级选项</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={ checked4 }
              onChange={ setChecked4 }
              size={ 32 }
              label="左侧标签"
              labelPosition="left"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={ checked5 }
              onChange={ setChecked5 }
              size={ 36 }
              label="自定义动画参数"
              animationDuration={ 1 }
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">原始 Checkmark 组件</h2>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <Checkmark
              size={ 80 }
              strokeWidth={ 4 }
              color="rgb(16, 185, 129)"
              show
            />
            <span className="mt-2 text-sm text-gray-600">基础样式</span>
          </div>

          <div className="flex flex-col items-center">
            <Checkmark
              size={ 80 }
              strokeWidth={ 4 }
              color="#4f46e5"
              backgroundColor="#f40"
              show
              animationDuration={ 3 }
            />
            <span className="mt-2 text-sm text-gray-600">填充背景</span>
          </div>

          <div className="flex flex-col items-center">
            <Checkmark
              size={ 80 }
              strokeWidth={ 4 }
              color="#f59e0b"
              show
              showCircle={ false }
            />
            <span className="mt-2 text-sm text-gray-600">无圆圈 + 悬停效果</span>
          </div>
        </div>
      </section>
    </div>
  )
}
