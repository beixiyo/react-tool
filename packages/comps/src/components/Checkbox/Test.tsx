'use client'

import { useLatestCallback } from 'hooks'
import { memo, useState } from 'react'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { Input } from '../Input'
import { Slider } from '../Slider'
import { ThemeToggle } from '../ThemeToggle'
import { Checkbox, Checkmark } from '.'

const NumberControl = memo<NumberControlProps>((props) => {
  const {
    label,
    value,
    min,
    max,
    step = 1,
    onChange,
  } = props

  const handleInputChange = useLatestCallback((nextValue: string) => {
    const parsedValue = Number(nextValue)
    if (Number.isFinite(parsedValue)) {
      onChange(Math.min(max, Math.max(min, parsedValue)))
    }
  })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-text">{ label }</span>
        <Input
          aria-label={ label }
          type="number"
          min={ min }
          max={ max }
          step={ step }
          size="sm"
          value={ String(value) }
          onChange={ handleInputChange }
          wrapperClassName="w-24"
        />
      </div>
      <Slider
        ariaLabel={ label }
        min={ min }
        max={ max }
        step={ step }
        value={ value }
        onChange={ onChange }
        tooltip={ { formatter: (nextValue) => String(nextValue) } }
      />
    </div>
  )
})

NumberControl.displayName = 'NumberControl'

const ControlledCheckboxDemo = memo(() => {
  const [checked, setChecked] = useState(true)
  const [disabled, setDisabled] = useState(false)
  const [indeterminate, setIndeterminate] = useState(false)
  const [required, setRequired] = useState(false)
  const [labelPositionLeft, setLabelPositionLeft] = useState(false)
  const [size, setSize] = useState(32)
  const [checkmarkWidth, setCheckmarkWidth] = useState(2)
  const [borderWidth, setBorderWidth] = useState(1)
  const [borderRadius, setBorderRadius] = useState(10)
  const [animationDuration, setAnimationDuration] = useState(0.6)
  const [label, setLabel] = useState('受控 Checkbox')
  const [name, setName] = useState('controlled-checkbox')
  const [labelClassName, setLabelClassName] = useState('text-text')
  const [checkedBackgroundColor, setCheckedBackgroundColor] = useState('rgb(var(--button) / 1)')
  const [uncheckedBackgroundColor, setUncheckedBackgroundColor] = useState('transparent')
  const [borderColor, setBorderColor] = useState('rgb(var(--text) / 1)')
  const [checkmarkColor, setCheckmarkColor] = useState('rgb(var(--button3) / 1)')

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">全部参数受控示例</h2>
      <Card shadow="none" hoverEffect={ false } bodyClassName="grid gap-8 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.6fr)]">
        <div className="flex min-h-56 items-center justify-center rounded-xl border border-border bg-background2 p-6">
          <Checkbox
            checked={ checked }
            onChange={ setChecked }
            disabled={ disabled }
            indeterminate={ indeterminate }
            required={ required }
            name={ name }
            size={ size }
            checkmarkWidth={ checkmarkWidth }
            borderWidth={ borderWidth }
            borderColor={ borderColor }
            checkedBackgroundColor={ checkedBackgroundColor }
            uncheckedBackgroundColor={ uncheckedBackgroundColor }
            checkmarkColor={ checkmarkColor }
            label={ label }
            labelPosition={ labelPositionLeft
              ? 'left'
              : 'right' }
            labelClassName={ labelClassName }
            animationDuration={ animationDuration }
            style={ { borderRadius } }
          />
        </div>

        <div className="min-w-0 space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Checkbox checked={ checked } onChange={ setChecked } label="checked" />
            <Checkbox checked={ disabled } onChange={ setDisabled } label="disabled" />
            <Checkbox checked={ indeterminate } onChange={ setIndeterminate } label="indeterminate" />
            <Checkbox checked={ required } onChange={ setRequired } label="required" />
            <Checkbox checked={ labelPositionLeft } onChange={ setLabelPositionLeft } label="labelPosition: left" />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <NumberControl label="size" value={ size } min={ 16 } max={ 80 } onChange={ setSize } />
            <NumberControl label="strokeWidth (checkmarkWidth)" value={ checkmarkWidth } min={ 1 } max={ 8 } step={ 0.5 } onChange={ setCheckmarkWidth } />
            <NumberControl label="borderWidth" value={ borderWidth } min={ 0 } max={ 8 } step={ 0.5 } onChange={ setBorderWidth } />
            <NumberControl label="borderRadius" value={ borderRadius } min={ 0 } max={ 40 } onChange={ setBorderRadius } />
            <NumberControl label="animationDuration" value={ animationDuration } min={ 0.1 } max={ 3 } step={ 0.1 } onChange={ setAnimationDuration } />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="label" value={ label } onChange={ setLabel } />
            <Input label="name" value={ name } onChange={ setName } />
            <Input label="labelClassName" value={ labelClassName } onChange={ setLabelClassName } />
            <Input label="borderColor" value={ borderColor } onChange={ setBorderColor } />
            <Input label="checkedBackgroundColor" value={ checkedBackgroundColor } onChange={ setCheckedBackgroundColor } />
            <Input label="uncheckedBackgroundColor" value={ uncheckedBackgroundColor } onChange={ setUncheckedBackgroundColor } />
            <Input label="checkmarkColor" value={ checkmarkColor } onChange={ setCheckmarkColor } />
          </div>
        </div>
      </Card>
    </section>
  )
})

ControlledCheckboxDemo.displayName = 'ControlledCheckboxDemo'

function CheckmarkDemo() {
  const [checked1, setChecked1] = useState(true)
  const [checked2, setChecked2] = useState(true)
  const [checked3, setChecked3] = useState(false)
  const [checked4, setChecked4] = useState(true)
  const [checked5, setChecked5] = useState(true)

  return (
    <div className="h-screen overflow-auto bg-background p-8 text-text">
      <div className="mx-auto max-w-4xl space-y-12">
        <section>
          <ThemeToggle />
        </section>

        <ControlledCheckboxDemo />

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
                size={ 32 }
                label="非受控模式（默认未选中）"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                defaultChecked={ true }
                size={ 32 }
                label="非受控模式（默认选中）"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                defaultChecked={ false }
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
                <div className="p-1 rounded-xs bg-background2">
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
                <div className="p-1 rounded-md bg-background2">
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
                label="rounded-xs"
                className="rounded-xs"
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

      <GithubSourceLink />
    </div>
  )
}

export default CheckmarkDemo

type NumberControlProps = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}
