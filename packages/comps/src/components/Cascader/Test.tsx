'use client'

import type { CascaderOption, CascaderRef } from './types'
import { Building2, Cat, ChevronDown, Dog, Fish, Globe, Mail, MapPin, Phone } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '../Button'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'
import { Cascader } from './Cascader'

/** 基本选项数据 */
const basicOptions: CascaderOption[] = [
  { value: 'email', label: '邮箱', icon: <Mail className="h-4 w-4" /> },
  { value: 'phone', label: '电话', icon: <Phone className="h-4 w-4" /> },
  { value: 'website', label: '网站', icon: <Globe className="h-4 w-4" /> },
]

/** 多级级联选项 */
const cascaderOptions: CascaderOption[] = [
  {
    value: 'pets',
    label: '宠物',
    icon: <Dog className="h-4 w-4" />,
    children: [
      { value: 'dog', label: '狗', icon: <Dog className="h-4 w-4" /> },
      { value: 'cat', label: '猫', icon: <Cat className="h-4 w-4" /> },
      {
        value: 'fish',
        label: '鱼',
        icon: <Fish className="h-4 w-4" />,
        children: [
          { value: 'goldfish', label: '金鱼' },
          { value: 'guppy', label: '孔雀鱼' },
          { value: 'angelfish', label: '天使鱼' },
        ],
      },
    ],
  },
  {
    value: 'location',
    label: '地点',
    icon: <MapPin className="h-4 w-4" />,
    children: [
      {
        value: 'china',
        label: '中国',
        children: [
          { value: 'beijing', label: '北京' },
          { value: 'shanghai', label: '上海' },
          { value: 'guangzhou', label: '广州' },
        ],
      },
      {
        value: 'usa',
        label: '美国',
        children: [
          { value: 'newyork', label: '纽约' },
          { value: 'losangeles', label: '洛杉矶' },
          { value: 'chicago', label: '芝加哥' },
        ],
      },
    ],
  },
  {
    value: 'company',
    label: '公司',
    icon: <Building2 className="h-4 w-4" />,
    children: [
      { value: 'tech', label: '科技', disabled: true },
      { value: 'finance', label: '金融' },
      { value: 'education', label: '教育' },
    ],
  },
]

function App() {
  const [cascaderValue, setCascaderValue] = useState<string>('goldfish')
  // Ref 控制
  const cascaderRef = useRef<CascaderRef>(null)

  return (
    <div className="min-h-screen bg-background p-8 text-text">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text">Cascader 组件测试</h1>
          <ThemeToggle />
        </div>

        {/* 多级级联 */}
        <div className="rounded-lg bg-background2 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">多级级联选择, hover 自动展开</h2>
          <p className="mb-4 text-sm text-text2">
            当前选中值:
            {' '}
            <code className="rounded-sm bg-background px-2 py-1">{ cascaderValue || '未选择' }</code>
          </p>
          <Cascader
            triggerMode="hover"
            options={ cascaderOptions }
            value={ cascaderValue }
            onChange={ value => setCascaderValue(value) }
            placeholder="请选择选项"
            clearable
            dropdownHeight={ 200 }
            dropdownMinWidth={ 180 }
          />
        </div>

        {/* 搜索功能 */}
        <div className="rounded-lg bg-background2 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">搜索功能（边框无阴影）</h2>
          <p className="mb-4 text-sm text-text2">
            支持对所有层级的叶子节点进行模糊搜索。
          </p>
          <Cascader
            options={ cascaderOptions }
            searchable
            onChange={ value => setCascaderValue(value) }
            dropdownHeight={ 250 }
            dropdownMinWidth={ 180 }
            bordered
            shadowed={ false }
          />
        </div>

        {/* 禁用状态 */}
        <div className="rounded-lg bg-background2 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">禁用状态</h2>
          <Cascader
            options={ basicOptions }
            disabled
          />
        </div>

        {/* 不同定位方式 */}
        <div className="rounded-lg bg-background2 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">不同定位方式</h2>

          {/* 上下为主 */}
          <div className="mb-6">
            <h3 className="mb-3 text-base font-medium text-text">上下为主</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-sm text-text2">下方开始</p>
                <Cascader
                  options={ basicOptions }
                  placement="bottom-start"
                />
              </div>
              <div>
                <p className="mb-2 text-sm text-text2">下方结束</p>
                <Cascader
                  options={ basicOptions }
                  placement="bottom-end"
                />
              </div>
              <div>
                <p className="mb-2 text-sm text-text2">上方开始</p>
                <Cascader
                  options={ basicOptions }
                  placement="top-start"
                />
              </div>
              <div>
                <p className="mb-2 text-sm text-text2">上方结束</p>
                <Cascader
                  options={ basicOptions }
                  placement="top-end"
                />
              </div>
            </div>
          </div>

          {/* 左右为主 */}
          <div>
            <h3 className="mb-3 text-base font-medium text-text">左右为主</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-sm text-text2">右方开始</p>
                <Cascader
                  options={ basicOptions }
                  placement="right-start"
                />
              </div>
              <div>
                <p className="mb-2 text-sm text-text2">右方结束</p>
                <Cascader
                  options={ basicOptions }
                  placement="right-end"
                />
              </div>
              <div>
                <p className="mb-2 text-sm text-text2">左方开始</p>
                <Cascader
                  options={ basicOptions }
                  placement="left-start"
                />
              </div>
              <div>
                <p className="mb-2 text-sm text-text2">左方结束</p>
                <Cascader
                  options={ basicOptions }
                  placement="left-end"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 表单集成 */}
        <div className="rounded-lg bg-background2 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">表单集成（错误状态）</h2>
          <Cascader
            options={ basicOptions }
            name="form-field"
            error={ true }
            errorMessage="请选择一个选项"
          />
        </div>

        {/* 可编辑模式 */}
        <div className="rounded-lg bg-background2 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">可编辑模式 (Combobox)</h2>
          <p className="mb-3 text-sm text-text2">
            支持手填自定义值 + 下拉选择，blur / Enter 提交，Escape 回退
          </p>
          <Cascader
            options={ basicOptions }
            value={ cascaderValue }
            onChange={ value => setCascaderValue(value) }
            editable
            placeholder="输入或选择..."
          />
          <p className="mt-2 text-xs text-text2">
            当前值：
            <code className="ml-1 rounded bg-background px-1 py-0.5">
              { cascaderValue || '（空）' }
            </code>
          </p>
        </div>

        {/* 自定义样式 */}
        <div className="rounded-lg bg-background2 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">自定义样式</h2>
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
        <div className="rounded-lg bg-background2 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">无触发器（仅下拉面板）</h2>
          <p className="mb-4 text-sm text-text2">
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

      <GithubSourceLink />
    </div>
  )
}

export default App
