'use client'

import { useState } from 'react'
import { Checkbox, Checkmark } from '.'
import { ThemeToggle } from '../ThemeToggle'

export default function CheckmarkDemo() {
  const [checked1, setChecked1] = useState(true)
  const [checked2, setChecked2] = useState(true)
  const [checked3, setChecked3] = useState(false)
  const [checked4, setChecked4] = useState(true)
  const [checked5, setChecked5] = useState(true)

  return (
    <div className="h-screen overflow-auto p-8 space-y-12">
      <section>
        <ThemeToggle />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Checkbox 线条粗细测试</h2>
        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex flex-col items-center gap-2">
            <Checkbox
              checked={ checked1 }
              onChange={ setChecked1 }
              checkmarkWidth={ 2 }
              label="checkmarkWidth: 2"
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Checkbox
              checked={ checked1 }
              onChange={ setChecked1 }
              checkmarkWidth={ 4 }
              label="checkmarkWidth: 4"
            />
          </div>
        </div>

        <h3 className="mt-6 mb-2 text-lg font-medium">外边框粗细 (borderWidth)</h3>
        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex flex-col items-center gap-2">
            <Checkbox
              checked={ checked2 }
              onChange={ setChecked2 }
              borderWidth={ 1 }
              label="borderWidth: 1"
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Checkbox
              checked={ checked2 }
              onChange={ setChecked2 }
              borderWidth={ 2 }
              borderColor="rgb(var(--systemBlue) / 1)"
              label="borderWidth: 2"
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Checkbox
              checked={ checked2 }
              onChange={ setChecked2 }
              borderWidth={ 4 }
              borderColor="rgb(var(--systemOrange) / 1)"
              label="borderWidth: 4"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">基础复选框</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={ checked1 }
              onChange={ setChecked1 }
              label="带标签的复选框"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={ checked2 }
              onChange={ setChecked2 }
              size={ 40 }
              checkmarkWidth={ 4 }
              label="自定义大小和颜色"
              labelClassName="text-systemBlue font-medium"
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
              indeterminate
              label="半选状态"
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
              animationDuration={ 10 }
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">非受控模式示例</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              defaultChecked={ false }
              onChange={ checked => console.log('非受控复选框 1 状态变化:', checked) }
              size={ 32 }
              label="非受控模式（默认未选中）"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              defaultChecked={ true }
              onChange={ checked => console.log('非受控复选框 2 状态变化:', checked) }
              size={ 32 }
              label="非受控模式（默认选中）"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              defaultChecked={ false }
              onChange={ checked => console.log('非受控复选框 3 状态变化:', checked) }
              size={ 32 }
              disabled
              label="非受控模式（禁用状态）"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">圆角与 stroke 粗细测试</h2>
        <div className="space-y-6">
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center">
              <div className="p-1 rounded-sm bg-background2 dark:bg-background2">
                <Checkmark
                  size={ 40 }
                  strokeWidth={ 2 }
                  borderColor="rgb(var(--systemBlue) / 1)"
                  checkmarkColor="rgb(var(--systemBlue) / 1)"
                  show
                />
              </div>
              <span className="mt-2 text-sm text-text2">stroke 2</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-1 rounded-md bg-background2 dark:bg-background2">
                <Checkmark
                  size={ 40 }
                  strokeWidth={ 4 }
                  borderColor="rgb(var(--systemGreen) / 1)"
                  checkmarkColor="rgb(var(--systemGreen) / 1)"
                  show
                />
              </div>
              <span className="mt-2 text-sm text-text2">stroke 4</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Checkbox
              checked={ checked1 }
              onChange={ setChecked1 }
              size={ 28 }
              label="rounded-sm"
              className="rounded-sm"
            />

            <Checkbox
              checked={ checked2 }
              onChange={ setChecked2 }
              size={ 28 }
              label="rounded-md"
              className="rounded-md"
            />

            <Checkbox
              checked={ checked4 }
              onChange={ setChecked4 }
              size={ 28 }
              label="rounded-lg"
              className="rounded-full"
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
              strokeWidth={ 2 }
              borderColor="rgb(var(--systemGreen) / 1)"
              checkmarkColor="rgb(var(--systemGreen) / 1)"
              show
            />
            <span className="mt-2 text-sm text-text2">基础样式</span>
          </div>

          <div className="flex flex-col items-center">
            <Checkmark
              size={ 80 }
              borderColor="rgb(var(--systemOrange) / 1)"
              checkmarkColor="rgb(var(--systemBlue) / 1)"
              backgroundColor="rgb(var(--systemOrange) / 1)"
              show
              animationDuration={ 3 }
            />
            <span className="mt-2 text-sm text-text2">填充背景</span>
          </div>

          <div className="flex flex-col items-center">
            <Checkmark
              size={ 80 }
              borderColor="rgb(var(--systemOrange) / 1)"
              checkmarkColor="rgb(var(--systemOrange) / 1)"
              show
              showCircle={ false }
            />
            <span className="mt-2 text-sm text-text2">无圆圈 + 悬停效果</span>
          </div>
        </div>
      </section>
    </div>
  )
}
