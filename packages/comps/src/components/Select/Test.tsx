'use client'

import { Cat, Dog, Fish, Globe, Mail, PawPrint, Phone, User } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../Button'
import { Checkmark } from '../Checkbox'
import { Input } from '../Input'
import { Modal } from '../Modal'
import { ThemeToggle } from '../ThemeToggle'
import { Select } from './Select'
import type { Option } from './types'

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
  const [otherValue, setOtherValue] = useState<string[]>([])
  const [otherText, setOtherText] = useState('')
  const [cascaderValue, setCascaderValue] = useState<string>('goldfish')
  const [editableValue, setEditableValue] = useState<string>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalValue, setModalValue] = useState<string>('')

  /** 受控 vs 非受控对照 */
  const [uncontrolledLog, setUncontrolledLog] = useState<string>('')
  const [confirmedValue, setConfirmedValue] = useState<string>('email')
  const [pendingValue, setPendingValue] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background p-8 text-text">
      <div className="mx-auto max-w-md space-y-8">
        <ThemeToggle />

        <div className="rounded-lg bg-background4 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">级联选择</h2>
          <Select
            options={ cascaderOptions }
            value={ cascaderValue }
            onChange={ (value) => setCascaderValue(value as string) }
            placeholder="选择宠物"
            clearable
          />
        </div>

        <div className="rounded-lg bg-background4 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">单选</h2>
          <Select
            options={ options }
            value={ singleValue }
            onChange={ (value) => setSingleValue(value as string) }
            placeholder="选择一个选项"
            placeholderIcon={
              <>
                <Mail className="h-4 w-4" />
                <User className="h-4 w-4" />
                <Phone className="h-4 w-4" />
                <Globe className="h-4 w-4" />
              </>
             }
            searchable={ false }
            showEmpty={ false }
          />
        </div>

        <div className="rounded-lg bg-background4 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">多选（下拉面板边框无阴影）</h2>
          <Select
            options={ options }
            value={ multiValue }
            onChange={ (value) => setMultiValue(value as string[]) }
            placeholder="选择多个选项"
            multiple
            maxSelect={ 3 }
            searchable
            bordered
            shadowed={ false }
          />
        </div>

        <div className="rounded-lg bg-background4 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">多选 + 自定义「其他」（renderValue / renderDropdownFooter）</h2>
          <Select
            options={ options }
            value={ otherValue }
            onChange={ (value) => setOtherValue(value as string[]) }
            placeholder="选择，或在下方填写其他"
            multiple
            maxSelect={ 3 }
            optionClassName="min-h-9 leading-[22px]"
            optionCheckIconClassName="size-5"
            dropdownMaxHeight={ 357 }
            dropdownClassName="shadow-[0_8px_48px_rgba(0,0,0,0.1)]"
            renderValue={ ({ selectedLabels }) => {
              const parts = [...selectedLabels, otherText.trim()].filter(Boolean)
              return parts.length > 0
                ? <span className="truncate">{ parts.join(' · ') }</span>
                : null
            } }
            renderDropdownFooter={ () => <OtherFooter value={ otherText } onChange={ setOtherText } /> }
          />
        </div>

        <div className="rounded-lg bg-background4 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">受控 vs 非受控</h2>
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm text-text2">非受控：只传 defaultValue，组件自持值，onChange 仅通知</p>
              <Select
                options={ options }
                defaultValue="website"
                onChange={ (value) => setUncontrolledLog(value as string) }
                placeholder="选择一个选项"
              />
              <p className="mt-2 text-xs text-text2">
                最近一次 onChange：
                <code className="ml-1 rounded bg-background2 px-1 py-0.5">{ uncontrolledLog || '（无）' }</code>
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm text-text2">
                受控 + 父级不立即回写：选完先「确认 / 取消」，取消时显示值必须留在原值
              </p>
              <Select
                options={ options }
                value={ confirmedValue }
                onChange={ (value) => setPendingValue(value as string) }
                placeholder="选择一个选项"
              />
              <div className="mt-2 flex min-h-8 items-center gap-2 text-xs text-text2">
                { pendingValue === null
                  ? (
                    <>
                      已生效：
                      <code className="rounded bg-background2 px-1 py-0.5">{ confirmedValue }</code>
                    </>
                  )
                  : (
                    <>
                      待确认改为
                      <code className="rounded bg-background2 px-1 py-0.5">{ pendingValue }</code>
                      <Button
                        size="sm"
                        onClick={ () => {
                          setConfirmedValue(pendingValue)
                          setPendingValue(null)
                        } }
                      >
                        确认
                      </Button>
                      <Button size="sm" variant="ghost" onClick={ () => setPendingValue(null) }>
                        取消
                      </Button>
                    </>
                  ) }
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-background4 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">禁用选择</h2>
          <Select
            options={ options }
            placeholder="选择一个选项"
            disabled
          />
        </div>

        <div className="rounded-lg bg-background4 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">加载状态</h2>
          <Select
            options={ options }
            placeholder="选择一个选项"
            loading
          />
        </div>

        <div className="rounded-lg bg-background4 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">可编辑（组合框）</h2>
          <p className="mb-3 text-sm text-text2">支持手填自定义值 + 下拉选择，blur / Enter 提交，Escape 回退</p>
          <Select
            options={ options }
            value={ editableValue }
            onChange={ (value) => setEditableValue(value as string) }
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

        <div className="rounded-lg bg-background4 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">弹窗内</h2>
          <p className="mb-3 text-sm text-text2">下拉面板应显示在弹窗之上；面板打开时 Esc 只关闭面板，再按一次才关闭弹窗</p>
          <Button onClick={ () => setModalOpen(true) }>打开弹窗</Button>
          <Modal isOpen={ modalOpen } onClose={ () => setModalOpen(false) } titleText="弹窗内的 Select" footer={ null }>
            <Select
              options={ options }
              value={ modalValue }
              onChange={ (value) => setModalValue(value as string) }
              placeholder="选择一个选项"
              aria-label="弹窗内的 Select"
            />
          </Modal>
        </div>
      </div>
    </div>
  )
}

/** 「其他」自定义输入：分隔线 + 标签（聚焦或已填写时打勾，已填写失焦后标签变灰）+ 输入框 */
function OtherFooter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [focused, setFocused] = useState(false)
  const filled = Boolean(value.trim())
  const checked = focused || filled

  return (
    <div className="flex flex-col text-sm leading-5.5">
      { /* 设计稿 1780:60060：列表 / 分隔线 / Other 之间各 12px */ }
      <div className="my-3 h-px shrink-0 rounded-[1px] bg-border" />
      <label className="flex flex-col gap-1">
        <span
          className={ `flex h-9 items-center justify-between gap-2 px-2 transition-colors ${
            filled && !focused
              ? 'text-text3'
              : ''
          }` }
        >
          <span className="min-w-0 flex-1 truncate">其他</span>
          { checked && <Checkmark size={ 20 } strokeWidth={ 1.5 } animationDuration={ 0.4 } aria-hidden className="size-5 text-text" /> }
        </span>
        <Input
          value={ value }
          maxLength={ 50 }
          placeholder="Please enter"
          onChange={ onChange }
          onFocus={ () => setFocused(true) }
          onBlur={ () => setFocused(false) }
          className="h-10 bg-transparent px-2 text-sm placeholder:text-text4"
          containerClassName="w-full rounded-[10px]"
          focusContainerClass="border-text hover:border-text"
        />
      </label>
    </div>
  )
}

export default App
