'use client'

import { memo, useState } from 'react'
import { Card } from '../Card'
import { ThemeToggle } from '../ThemeToggle'
import { Radio } from './Radio'
import { RadioGroup } from './RadioGroup'

const RadioTest = memo(() => {
  const [singleValue, setSingleValue] = useState(false)
  const [groupValue, setGroupValue] = useState('option1')
  const [errorGroupValue, setErrorGroupValue] = useState('')

  return (
    <div className="mx-auto p-6 container space-y-8">
      <ThemeToggle></ThemeToggle>
      <h1 className="mb-6 text-2xl font-bold dark:text-white">Radio 组件测试</h1>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">基础用法</h2>
        <div className="space-y-4">
          <Radio
            label="默认单选按钮"
            checked={ singleValue }
            onChange={ checked => setSingleValue(checked) }
          />

          <div className="flex flex-col gap-2">
            <Radio
              label="禁用状态"
              disabled
            />
            <Radio
              label="禁用选中状态"
              disabled
              checked
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">不同尺寸</h2>
        <div className="flex flex-col gap-4">
          <Radio
            label="小尺寸 (sm)"
            size="sm"
          />
          <Radio
            label="中尺寸 (md) - 默认"
            size="md"
          />
          <Radio
            label="大尺寸 (lg)"
            size="lg"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">标签位置</h2>
        <div className="flex flex-col gap-4">
          <Radio
            label="标签在右侧 (默认)"
            labelPosition="right"
          />
          <Radio
            label="标签在左侧"
            labelPosition="left"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">错误状态</h2>
        <div className="flex flex-col gap-4">
          <Radio
            label="错误状态"
            error
          />
          <Radio
            label="错误状态带消息"
            error
            errorMessage="这是一个错误消息"
          />
          <Radio
            label="必填项"
            required
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">单选按钮组 - 垂直布局</h2>
        <RadioGroup
          name="options-vertical"
          value={ groupValue }
          onChange={ value => setGroupValue(value) }
          direction="vertical"
        >
          <Radio label="选项 1" value="option1" />
          <Radio label="选项 2" value="option2" />
          <Radio label="选项 3" value="option3" />
          <Radio label="禁用选项" value="option4" disabled />
        </RadioGroup>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">单选按钮组 - 水平布局</h2>
        <RadioGroup
          name="options-horizontal"
          value={ groupValue }
          onChange={ value => setGroupValue(value) }
          direction="horizontal"
        >
          <Radio label="选项 1" value="option1" />
          <Radio label="选项 2" value="option2" />
          <Radio label="选项 3" value="option3" />
        </RadioGroup>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">单选按钮组 - 错误状态</h2>
        <RadioGroup
          name="options-error"
          value={ errorGroupValue }
          onChange={ value => setErrorGroupValue(value) }
        >
          <Radio label="选项 1" value="error1" error={ !errorGroupValue } />
          <Radio label="选项 2" value="error2" error={ !errorGroupValue } />
          <Radio
            label="选项 3"
            value="error3"
            error={ !errorGroupValue }
            errorMessage={ !errorGroupValue
              ? '请选择一个选项'
              : undefined } />
        </RadioGroup>
      </Card>
    </div>
  )
})

RadioTest.displayName = 'RadioTest'

export default RadioTest
