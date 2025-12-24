'use client'

import { ClipboardCheck, Info } from 'lucide-react'
import { useState } from 'react'
import { Form, useForm } from '.'
import { Input, NumberInput, Radio, RadioGroup, Textarea } from '..'

import { Checkbox } from '../Checkbox/Checkbox'
import { Message } from '../Message'
import { Select } from '../Select/Select'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'

export default function App() {
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
    <div className="min-h-screen bg-slate-50 pb-10 dark:bg-slate-900">
      <div className="mx-auto max-w-3xl px-4 pt-72 container">

        <div className="flex items-center justify-between">
          <div className="mb-6 flex items-center justify-center gap-3">
            <ClipboardCheck className="h-10 w-10 text-blue-500" />
            <h1 className="text-center text-2xl text-slate-900 font-extrabold tracking-tight dark:text-slate-50">
              表单组件演示
            </h1>
          </div>
          <ThemeToggle />
        </div>

        {/* 表单状态监视示例 */ }
        <div className="mb-8 border border-slate-200/80 rounded-lg bg-white p-6 shadow-xs dark:border-slate-700/80 dark:bg-slate-800/50">
          <h2 className="mb-4 text-xl text-slate-700 font-semibold dark:text-slate-300">表单状态监视示例</h2>

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
              <label className="mb-2 block text-sm text-slate-700 font-medium dark:text-slate-300">
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
              <label className="mb-2 block text-sm text-slate-700 font-medium dark:text-slate-300">
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
              <label className="mb-2 block text-sm text-slate-700 font-medium dark:text-slate-300">
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
              <label className="text-sm text-slate-700 dark:text-slate-300">
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

            <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
              <button
                type="reset"
                className="border border-slate-300 rounded-lg px-4 py-2 text-slate-700 transition-colors dark:border-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
              >
                重置表单
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-500 px-4 py-2 text-white font-medium transition-colors hover:bg-blue-600"
              >
                提交表单
              </button>
            </div>
          </Form>
        </div>

        { Object.keys(submittedValues).length > 0 && (
          <div className="border border-slate-200/80 rounded-lg bg-white p-6 shadow-xs dark:border-slate-700/80 dark:bg-slate-800/50">
            <h2 className="mb-4 flex items-center gap-2 text-xl text-slate-700 font-semibold dark:text-slate-300">
              <Info className="h-5 w-5 text-blue-500" />
              提交的表单数据
            </h2>
            <pre className="overflow-auto rounded-lg bg-slate-100 p-4 text-sm dark:bg-slate-800 dark:text-slate-300">
              { JSON.stringify(submittedValues, null, 2) }
            </pre>
          </div>
        ) }
      </div>
    </div>
  )
}

/** 表单状态监视组件 */
function FormStateMonitor() {
  const form = useForm()
  const { state } = form

  return (
    <div className="fixed top-1 z-50 w-xl rounded-lg bg-slate-100 p-4 right-8 dark:bg-slate-700/50">
      <h3 className="mb-2 text-slate-700 font-medium dark:text-slate-300">表单状态：</h3>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="mr-1 font-medium">是否有效:</span>
          <span className={ state.isValid
            ? 'text-green-600 dark:text-green-400'
            : 'text-rose-600 dark:text-rose-400' }>
            { state.isValid
              ? '是'
              : '否' }
          </span>
        </div>
        <div>
          <span className="mr-1 font-medium">是否提交中:</span>
          <span className={ state.isSubmitting
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-slate-600 dark:text-slate-400' }>
            { state.isSubmitting
              ? '是'
              : '否' }
          </span>
        </div>
        <div>
          <span className="mr-1 font-medium">是否已修改:</span>
          <span className={ state.isDirty
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-slate-600 dark:text-slate-400' }>
            { state.isDirty
              ? '是'
              : '否' }
          </span>
        </div>
      </div>
      <div className="mt-2">
        <div className="mb-1 text-xs text-slate-700 font-medium dark:text-slate-300">表单值:</div>
        <pre className="max-h-64 overflow-auto rounded-sm bg-slate-200 p-2 text-xs dark:bg-slate-800 dark:text-slate-300">
          { JSON.stringify(state.values, null, 2) }
        </pre>
      </div>
      <div className="mt-2">
        <div className="mb-1 text-xs text-slate-700 font-medium dark:text-slate-300">错误信息:</div>
        <pre className="max-h-64 overflow-auto rounded-sm bg-slate-200 p-2 text-xs dark:bg-slate-800 dark:text-slate-300">
          { JSON.stringify(state.errors, null, 2) }
        </pre>
      </div>
    </div>
  )
}
