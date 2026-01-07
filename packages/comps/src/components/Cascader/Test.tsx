'use client'

import type { CascaderOption, CascaderRef } from './types'
import { Building2, Cat, ChevronDown, Dog, Fish, Globe, Mail, MapPin, Phone } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '../Button'
import { ThemeToggle } from '../ThemeToggle'
import { Cascader } from './Cascader'

// 基本选项数据
const basicOptions: CascaderOption[] = [
  { value: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
  { value: 'phone', label: 'Phone', icon: <Phone className="h-4 w-4" /> },
  { value: 'website', label: 'Website', icon: <Globe className="h-4 w-4" /> },
]

// 多级级联选项
const cascaderOptions: CascaderOption[] = [
  {
    value: 'pets',
    label: 'Pets',
    icon: <Dog className="h-4 w-4" />,
    children: [
      { value: 'dog', label: 'Dog', icon: <Dog className="h-4 w-4" /> },
      { value: 'cat', label: 'Cat', icon: <Cat className="h-4 w-4" /> },
      {
        value: 'fish',
        label: 'Fish',
        icon: <Fish className="h-4 w-4" />,
        children: [
          { value: 'goldfish', label: 'Goldfish' },
          { value: 'guppy', label: 'Guppy' },
          { value: 'angelfish', label: 'Angelfish' },
        ],
      },
    ],
  },
  {
    value: 'location',
    label: 'Location',
    icon: <MapPin className="h-4 w-4" />,
    children: [
      {
        value: 'china',
        label: 'China',
        children: [
          { value: 'beijing', label: 'Beijing' },
          { value: 'shanghai', label: 'Shanghai' },
          { value: 'guangzhou', label: 'Guangzhou' },
        ],
      },
      {
        value: 'usa',
        label: 'USA',
        children: [
          { value: 'newyork', label: 'New York' },
          { value: 'losangeles', label: 'Los Angeles' },
          { value: 'chicago', label: 'Chicago' },
        ],
      },
    ],
  },
  {
    value: 'company',
    label: 'Company',
    icon: <Building2 className="h-4 w-4" />,
    children: [
      { value: 'tech', label: 'Tech', disabled: true },
      { value: 'finance', label: 'Finance' },
      { value: 'education', label: 'Education' },
    ],
  },
]

function App() {
  const [cascaderValue, setCascaderValue] = useState<string>('goldfish')

  // 受控模式
  const [controlledValue, setControlledValue] = useState<string>('')
  const [controlledOpen, setControlledOpen] = useState(false)

  // Ref 控制
  const cascaderRef = useRef<CascaderRef>(null)

  return (
    <div className="min-h-screen bg-background p-8 text-textPrimary">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-textPrimary">Cascader 组件测试</h1>
          <ThemeToggle />
        </div>
        {/* 多级级联 */}
        <div className="rounded-lg bg-backgroundSecondary p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-textPrimary">多级级联选择</h2>
          <p className="mb-4 text-sm text-textSecondary">
            当前选中值:
            {' '}
            <code className="rounded bg-background px-2 py-1">{ cascaderValue || '未选择' }</code>
          </p>
          <Cascader
            options={ cascaderOptions }
            value={ cascaderValue }
            onChange={ (value) => {
              setCascaderValue(value)
              console.log('选中值:', value)
            } }
            trigger={
              <Button className="w-full justify-between">
                { cascaderValue ? `已选择: ${cascaderValue}` : '请选择选项' }
                <ChevronDown className="h-4 w-4" />
              </Button>
            }
            dropdownHeight={ 200 }
            dropdownMinWidth={ 180 }
          />
        </div>

        {/* 受控模式 */}
        <div className="rounded-lg bg-backgroundSecondary p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-textPrimary">受控模式</h2>
          <p className="mb-4 text-sm text-textSecondary">
            当前选中值:
            {' '}
            <code className="rounded bg-background px-2 py-1">{ controlledValue || '未选择' }</code>
            <br />
            打开状态:
            {' '}
            <code className="rounded bg-background px-2 py-1">{ controlledOpen ? '打开' : '关闭' }</code>
          </p>
          <div className="mb-4 flex gap-2">
            <Button
              onClick={ () => setControlledOpen(!controlledOpen) }
              variant="ghost"
            >
              { controlledOpen ? '关闭' : '打开' }
            </Button>
            <Button
              onClick={ () => setControlledValue('') }
              variant="ghost"
            >
              清空选择
            </Button>
          </div>
          <Cascader
            options={ basicOptions }
            value={ controlledValue }
            open={ controlledOpen }
            onOpenChange={ setControlledOpen }
            onChange={ (value) => {
              setControlledValue(value)
              console.log('选中值:', value)
            } }
            trigger={
              <Button className="w-full justify-between">
                { controlledValue ? `已选择: ${controlledValue}` : '请选择选项' }
                <ChevronDown className="h-4 w-4" />
              </Button>
            }
          />
        </div>

        {/* 禁用状态 */}
        <div className="rounded-lg bg-backgroundSecondary p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-textPrimary">禁用状态</h2>
          <Cascader
            options={ basicOptions }
            disabled
            trigger={
              <Button className="w-full justify-between" disabled>
                禁用状态
                <ChevronDown className="h-4 w-4" />
              </Button>
            }
          />
        </div>

        {/* 不同定位方式 */}
        <div className="rounded-lg bg-backgroundSecondary p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-textPrimary">不同定位方式</h2>

          {/* 上下为主 */}
          <div className="mb-6">
            <h3 className="mb-3 text-base font-medium text-textPrimary">上下为主</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-sm text-textSecondary">bottom-start</p>
                <Cascader
                  options={ basicOptions }
                  placement="bottom-start"
                  trigger={
                    <Button className="w-full justify-between">
                      bottom-start
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
              <div>
                <p className="mb-2 text-sm text-textSecondary">bottom-end</p>
                <Cascader
                  options={ basicOptions }
                  placement="bottom-end"
                  trigger={
                    <Button className="w-full justify-between">
                      bottom-end
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
              <div>
                <p className="mb-2 text-sm text-textSecondary">top-start</p>
                <Cascader
                  options={ basicOptions }
                  placement="top-start"
                  trigger={
                    <Button className="w-full justify-between">
                      top-start
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
              <div>
                <p className="mb-2 text-sm text-textSecondary">top-end</p>
                <Cascader
                  options={ basicOptions }
                  placement="top-end"
                  trigger={
                    <Button className="w-full justify-between">
                      top-end
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            </div>
          </div>

          {/* 左右为主 */}
          <div>
            <h3 className="mb-3 text-base font-medium text-textPrimary">左右为主</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-sm text-textSecondary">right-start</p>
                <Cascader
                  options={ basicOptions }
                  placement="right-start"
                  trigger={
                    <Button className="w-full justify-between">
                      right-start
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
              <div>
                <p className="mb-2 text-sm text-textSecondary">right-end</p>
                <Cascader
                  options={ basicOptions }
                  placement="right-end"
                  trigger={
                    <Button className="w-full justify-between">
                      right-end
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
              <div>
                <p className="mb-2 text-sm text-textSecondary">left-start</p>
                <Cascader
                  options={ basicOptions }
                  placement="left-start"
                  trigger={
                    <Button className="w-full justify-between">
                      left-start
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
              <div>
                <p className="mb-2 text-sm text-textSecondary">left-end</p>
                <Cascader
                  options={ basicOptions }
                  placement="left-end"
                  trigger={
                    <Button className="w-full justify-between">
                      left-end
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* 表单集成 */}
        <div className="rounded-lg bg-backgroundSecondary p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-textPrimary">表单集成（错误状态）</h2>
          <Cascader
            options={ basicOptions }
            name="form-field"
            error={ true }
            errorMessage="请选择一个选项"
            trigger={
              <Button className="w-full justify-between">
                表单字段（带错误提示）
                <ChevronDown className="h-4 w-4" />
              </Button>
            }
          />
        </div>

        {/* 自定义样式 */}
        <div className="rounded-lg bg-backgroundSecondary p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-textPrimary">自定义样式</h2>
          <Cascader
            options={ cascaderOptions }
            className="rounded-lg border-2 border-systemOrange"
            dropdownClassName="shadow-xl"
            dropdownHeight={ 250 }
            dropdownMinWidth={ 200 }
            trigger={
              <Button className="w-full justify-between border-2 border-systemOrange">
                自定义样式
                <ChevronDown className="h-4 w-4" />
              </Button>
            }
          />
        </div>

        {/* 无触发器 */}
        <div className="rounded-lg bg-backgroundSecondary p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-textPrimary">无触发器（仅下拉面板）</h2>
          <p className="mb-4 text-sm text-textSecondary">
            不提供 trigger 时，只渲染下拉面板，需要通过 ref 或其他方式控制打开
          </p>
          <Cascader
            ref={ cascaderRef }
            options={ basicOptions }
          />
          <div className="mt-4">
            <Button
              onClick={ () => cascaderRef.current?.open() }
              variant="ghost"
            >
              打开下拉面板
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
