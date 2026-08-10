'use client'

import type { Option } from './types'
import { Cat, Dog, Fish, Globe, Mail, PawPrint, Phone, User } from 'lucide-react'
import { useState } from 'react'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'
import { Select } from './Select'

const options: Option[] = [
  { value: 'email', label: '邮箱', icon: <Mail className="h-4 w-4" /> },
  { value: 'profile', label: '个人资料', icon: <User className="h-4 w-4" /> },
  { value: 'phone', label: '电话', icon: <Phone className="h-4 w-4" />, disabled: true },
  { value: 'website', label: '网站', icon: <Globe className="h-4 w-4" /> },
]

const cascaderOptions: Option[] = [
  {
    value: 'pets',
    label: '宠物',
    icon: <PawPrint className="h-4 w-4" />,
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
        ],
      },
    ],
  },
  {
    value: 'profile',
    label: '个人资料',
    icon: <User className="h-4 w-4" />,
  },
]

function App() {
  const [singleValue, setSingleValue] = useState<string>('')
  const [multiValue, setMultiValue] = useState<string[]>([])
  const [cascaderValue, setCascaderValue] = useState<string>('goldfish')
  const [editableValue, setEditableValue] = useState<string>('')

  return (
    <div className="min-h-screen bg-background p-8 text-text">
      <div className="mx-auto max-w-md space-y-8">
        <ThemeToggle />

        <div className="rounded-lg bg-background p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">级联选择</h2>
          <Select
            options={ cascaderOptions }
            value={ cascaderValue }
            onChange={ value => setCascaderValue(value as string) }
            placeholder="选择宠物"
            clearable
          />
        </div>

        <div className="rounded-lg bg-background p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">单选</h2>
          <Select
            options={ options }
            value={ singleValue }
            onChange={ value => setSingleValue(value as string) }
            placeholder="选择一个选项"
            placeholderIcon={ <>
              <Mail className="h-4 w-4" />
              <User className="h-4 w-4" />
              <Phone className="h-4 w-4" />
              <Globe className="h-4 w-4" />
            </> }
            searchable={ false }
            showEmpty={ false }
          />
        </div>

        <div className="rounded-lg bg-background p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">多选（边框无阴影）</h2>
          <Select
            options={ options }
            value={ multiValue }
            onChange={ value => setMultiValue(value as string[]) }
            placeholder="选择多个选项"
            multiple
            maxSelect={ 3 }
            searchable
            bordered
            shadowed={ false }
          />
        </div>

        <div className="rounded-lg bg-background p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">禁用选择</h2>
          <Select
            options={ options }
            placeholder="选择一个选项"
            disabled
          />
        </div>

        <div className="rounded-lg bg-background p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">加载状态</h2>
          <Select
            options={ options }
            placeholder="选择一个选项"
            loading
          />
        </div>

        <div className="rounded-lg bg-background p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">可编辑（组合框）</h2>
          <p className="mb-3 text-sm text-text2">支持手填自定义值 + 下拉选择，blur / Enter 提交，Escape 回退</p>
          <Select
            options={ options }
            value={ editableValue }
            onChange={ value => setEditableValue(value as string) }
            placeholder="输入或选择..."
            editable
          />
          <p className="mt-2 text-xs text-text2">
            当前值：
            <code className="ml-1 rounded bg-background2 px-1 py-0.5">
              { editableValue || '（空）' }
            </code>
          </p>
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default App
