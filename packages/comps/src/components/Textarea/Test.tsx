'use client'

import { useState } from 'react'
import { Badge } from '../Badge'
import { Card } from '../Card'
import { ThemeToggle } from '../ThemeToggle'
import { Textarea } from '.'
import type { TextareaCounterColorContext } from '.'

const SIZES = ['sm', 'md', 'lg'] as const
const MAX_LENGTH = 50

/** 按计数状态切换计数器颜色 */
function getCounterColor({ state }: TextareaCounterColorContext) {
  if (state === 'at-limit') return 'rgb(var(--danger))'
  if (state === 'near-limit') return 'rgb(var(--warning))'
  return undefined
}

function TextareaTest() {
  const [basic, setBasic] = useState('')
  const [autoValue, setAutoValue] = useState('自动增高：输入多行试试\n第二行')
  const [countValue, setCountValue] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [richValue, setRichValue] = useState('')

  return (
    <Card
      className="min-h-screen rounded-none border-0 shadow-none"
      padding="lg"
      title="Textarea 多行输入"
      headerActions={ <ThemeToggle /> }
      bodyClassName="space-y-8"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="基础与标签" variant="glass" padding="lg" bodyClassName="space-y-4">
          <Textarea label="描述" placeholder="请输入描述" value={ basic } onChange={ setBasic } />
          <Textarea label="左侧标签" labelPosition="left" placeholder="labelPosition=left" />
          <Textarea label="必填项" required placeholder="required" />
        </Card>

        <Card title="尺寸 size" variant="glass" padding="lg" bodyClassName="space-y-4">
          { SIZES.map((size) => <Textarea key={ size } size={ size } rows={ 2 } placeholder={ `size=${size}` } />) }
        </Card>

        <Card title="自动高度 autoResize" variant="glass" padding="lg" bodyClassName="space-y-4">
          <Textarea autoResize minRows={ 2 } maxRows={ 5 } value={ autoValue } onChange={ setAutoValue } />
          <Badge variant="outline">minRows=2 · maxRows=5，超出后内部滚动</Badge>
        </Card>

        <Card title="字数统计" variant="glass" padding="lg" bodyClassName="space-y-4">
          <Textarea
            showCount
            maxLength={ MAX_LENGTH }
            counterColor={ getCounterColor }
            value={ countValue }
            onChange={ setCountValue }
            placeholder={ `最多 ${MAX_LENGTH} 字，接近上限时变色` }
          />
          <Textarea
            showCount
            showCountFrom={ 10 }
            counterPosition="left"
            counterFormat={ (current, max) =>
              `${current} 字${
                max
                  ? ` / ${max}`
                  : ''
              }` }
            placeholder="输入满 10 字才显示计数（左对齐、自定义格式）"
          />
        </Card>

        <Card title="状态" variant="glass" padding="lg" bodyClassName="space-y-4">
          <Textarea error errorMessage="内容不能为空" placeholder="error" />
          <Textarea disabled value="disabled：不可编辑" />
          <Textarea readOnly value="readOnly：可选中但不可修改" />
        </Card>

        <Card title="外观" variant="glass" padding="lg" bodyClassName="space-y-4">
          <Textarea bordered={ false } placeholder="bordered=false" />
          <Textarea shadowed placeholder="shadowed" />
        </Card>

        <Card title="回车提交 onPressEnter" variant="glass" padding="lg" bodyClassName="space-y-4">
          <Textarea
            placeholder="按 Enter 提交（Shift+Enter 换行行为由浏览器默认处理）"
            onPressEnter={ (e) => {
              setSubmitted(e.currentTarget.value)
            } }
          />
          { submitted && <Badge>{ `已提交：${submitted}` }</Badge> }
        </Card>

        <Card title="富文本粘贴 enableRichPaste" variant="glass" padding="lg" bodyClassName="space-y-4">
          <Textarea
            enableRichPaste
            autoResize
            minRows={ 3 }
            maxRows={ 8 }
            value={ richValue }
            onChange={ setRichValue }
            placeholder="从网页复制带格式的内容粘贴进来，会转换为 Markdown"
          />
        </Card>
      </div>
    </Card>
  )
}

export default TextareaTest
