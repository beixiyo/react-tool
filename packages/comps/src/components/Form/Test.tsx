'use client'

import { ClipboardCheck, Info } from 'lucide-react'
import { useState } from 'react'
import { Form, useForm } from '.'
import { Input, NumberInput, Radio, RadioGroup, Textarea } from '..'

import { Button } from '../Button'
import { Checkbox } from '../Checkbox/Checkbox'
import { GithubSourceLink } from '../GithubSourceLink'
import { Message } from '../Message'
import { Select } from '../Select/Select'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'

function App() {
  const [submittedValues, setSubmittedValues] = useState<Record<string, any>>({})

  /** 表单验证器 */
  const validators = {
    age: (value: number | string | null) => {
      if (value === null || value === '')
        return '年龄不能为空'
      const age = Number(value)
      if (Number.isNaN(age))
        return '年龄必须是数字'
      if (age < 18 || age > 120)
        return '年龄必须在18-120之间'
      return undefined
    },
    phone: (value: string) => {
      if (!value)
        return '电话不能为空'
      if (!/^\d{11}$/.test(value))
        return '请输入有效的11位手机号'
      return undefined
    },
    name: (value: string) => {
      return !value
        ? '姓名不能为空'
        : undefined
    },
    terms: (value: boolean) => {
      return !value
        ? '您必须同意服务条款'
        : undefined
    },
    interests: (value: string[]) => {
      return !value.length
        ? '请至少选择一项兴趣爱好'
        : undefined
    },
    cascadedRegion: (value: string) => {
      return !value
        ? '请选择一个地区'
        : undefined
    },
  }

  /** 表单提交处理 */
  const handleSubmit = (values: Record<string, any>) => {
    setSubmittedValues(values)
    Message.success('表单提交成功')
  }

  /** 兴趣爱好选项 */
  const interestOptions = [
    { value: 'reading', label: '阅读' },
    { value: 'sports', label: '运动' },
    { value: 'music', label: '音乐' },
    { value: 'travel', label: '旅行' },
    { value: 'cooking', label: '烹饪' },
    { value: 'photography', label: '摄影' },
    { value: 'gaming', label: '游戏' },
  ]

  /** 级联选择器选项 */
  const cascadedOptions = [
    {
      value: 'zhejiang',
      label: '浙江省',
      children: [
        {
          value: 'hangzhou',
          label: '杭州市',
          children: [
            { value: 'xihu', label: '西湖区' },
            { value: 'yuhang', label: '余杭区' },
          ],
        },
        {
          value: 'ningbo',
          label: '宁波市',
          children: [
            { value: 'haishu', label: '海曙区' },
            { value: 'yinzhou', label: '鄞州区' },
          ],
        },
      ],
    },
    {
      value: 'jiangsu',
      label: '江苏省',
      children: [
        {
          value: 'nanjing',
          label: '南京市',
          children: [
            { value: 'gulou', label: '鼓楼区' },
            { value: 'jianye', label: '建邺区' },
          ],
        },
        {
          value: 'suzhou',
          label: '苏州市',
          children: [
            { value: 'gusu', label: '姑苏区' },
            { value: 'wuzhong', label: '吴中区' },
          ],
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-10 text-text">
      <div className="mx-auto max-w-3xl px-4 pt-10 container">

        <div className="flex items-center justify-between">
          <div className="mb-6 flex items-center justify-center gap-3">
            <ClipboardCheck className="h-10 w-10 text-systemBlue" />
            <h1 className="text-center text-2xl font-extrabold tracking-tight">
              表单组件演示
            </h1>
          </div>
          <ThemeToggle />
        </div>

        {/* 表单状态监视示例 */ }
        <div className="mb-8 border border-border rounded-lg bg-background2 p-6 shadow-2xs">
          <h2 className="mb-4 text-xl text-text2 font-semibold">表单状态监视示例</h2>

          <Form
            initialValues={ {
              name: '',
              phone: '',
              message: '',
              preference: 'email',
              age: '',
              newsletter: true,
              terms: false,
              interests: [],
              cascadedRegion: '',
            } }
            validators={ validators }
            onSubmit={ handleSubmit }
            className="space-y-6"
          >
            <FormStateMonitor />

            <div className="mb-4">
              <Input
                name="name"
                label="姓名"
                placeholder="请输入姓名"
                required
              />
            </div>

            <div className="mb-4">
              <Input
                name="phone"
                label="联系电话"
                placeholder="请输入11位手机号码"
                required
              />
            </div>

            <div className="mb-4">
              <NumberInput
                name="age"
                label="年龄"
                placeholder="请输入年龄"
                required
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm text-text2 font-medium">
                级联选择地区
              </label>
              <Select
                name="cascadedRegion"
                options={ cascadedOptions }
                placeholder="请选择级联地区"
                required
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm text-text2 font-medium">
                兴趣爱好
              </label>
              <Select
                name="interests"
                options={ interestOptions }
                placeholder="请选择兴趣爱好"
                multiple
                searchable
                required
              />
            </div>

            <div className="mb-4">
              <Textarea
                name="message"
                label="留言内容"
                placeholder="请输入留言内容"
                showCount
                maxLength={ 500 }
                rows={ 4 }
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm text-text2 font-medium">
                联系方式偏好
              </label>
              <RadioGroup name="preference">
                <Radio value="email" label="电子邮件" />
                <Radio value="phone" label="电话" />
                <Radio value="sms" label="短信" />
              </RadioGroup>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <Switch name="newsletter" />
              <label className="text-sm text-text2">
                订阅每周更新通讯
              </label>
            </div>

            <div className="mb-4">
              <Checkbox
                name="terms"
                label="我已阅读并同意服务条款"
                required
              />
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button type="reset" variant="default">
                重置表单
              </Button>
              <Button type="submit" variant="primary">
                提交表单
              </Button>
            </div>
          </Form>
        </div>

        { Object.keys(submittedValues).length > 0 && (
          <div className="border border-border rounded-lg bg-background2 p-6 shadow-2xs">
            <h2 className="mb-4 flex items-center gap-2 text-xl text-text2 font-semibold">
              <Info className="h-5 w-5 text-systemBlue" />
              提交的表单数据
            </h2>
            <pre className="overflow-auto rounded-lg bg-background3 p-4 text-sm text-text2">
              { JSON.stringify(submittedValues, null, 2) }
            </pre>
          </div>
        ) }
      </div>

      <GithubSourceLink />
    </div>
  )
}

/** 表单状态监视组件 */
function FormStateMonitor() {
  const form = useForm()
  const { state } = form

  return (
    <div className="rounded-lg bg-background3 p-4">
      <h3 className="mb-2 text-text2 font-medium">表单状态：</h3>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="mr-1 font-medium">是否有效:</span>
          <span className={ state.isValid
            ? 'text-success'
            : 'text-danger' }>
            { state.isValid
              ? '是'
              : '否' }
          </span>
        </div>
        <div>
          <span className="mr-1 font-medium">是否提交中:</span>
          <span className={ state.isSubmitting
            ? 'text-warning'
            : 'text-text3' }>
            { state.isSubmitting
              ? '是'
              : '否' }
          </span>
        </div>
        <div>
          <span className="mr-1 font-medium">是否已修改:</span>
          <span className={ state.isDirty
            ? 'text-info'
            : 'text-text3' }>
            { state.isDirty
              ? '是'
              : '否' }
          </span>
        </div>
      </div>
      <div className="mt-2">
        <div className="mb-1 text-xs text-text2 font-medium">表单值:</div>
        <pre className="max-h-64 overflow-auto rounded-xs bg-background4 p-2 text-xs text-text2">
          { JSON.stringify(state.values, null, 2) }
        </pre>
      </div>
      <div className="mt-2">
        <div className="mb-1 text-xs text-text2 font-medium">错误信息:</div>
        <pre className="max-h-64 overflow-auto rounded-xs bg-background4 p-2 text-xs text-text2">
          { JSON.stringify(state.errors, null, 2) }
        </pre>
      </div>
    </div>
  )
}

export default App
