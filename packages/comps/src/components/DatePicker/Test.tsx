'use client'

import type { DatePickerRef } from './types'
import { addMonths, subMonths } from 'date-fns'
import { useRef, useState } from 'react'
import { Button } from '../Button'
import { ThemeToggle } from '../ThemeToggle'
import { DatePicker, DateRangePicker, MonthPicker, YearPicker } from './index'

const cardClass
  = 'rounded-xl border border-border bg-background2/50 p-4 flex flex-col gap-3 min-w-0'

function DemoCard({
  title,
  children,
  valueText,
}: {
  title: string
  children: React.ReactNode
  valueText?: React.ReactNode
}) {
  return (
    <div className={ cardClass }>
      <p className="text-sm font-medium text-text shrink-0">{ title }</p>
      <div className="min-h-9 flex items-center">{ children }</div>
      { valueText != null && (
        <p className="text-xs text-text2 mt-auto">{ valueText }</p>
      ) }
    </div>
  )
}

export default function DatePickerTest() {
  const [value1, setValue1] = useState<Date | null>(null)
  const [value3, setValue3] = useState<Date | null>(null)
  const [value4, setValue4] = useState<Date | null>(null)
  const [value5, setValue5] = useState<Date | null>(null)
  const [customRenderValue, setCustomRenderValue] = useState<Date | null>(null)
  const [open, setOpen] = useState(false)

  const [precisionHour, setPrecisionHour] = useState<Date | null>(null)
  const [precisionMinute, setPrecisionMinute] = useState<Date | null>(null)
  const [precisionSecond, setPrecisionSecond] = useState<Date | null>(null)
  const [value12Hours, setValue12Hours] = useState<Date | null>(null)

  const [rangeValue1, setRangeValue1] = useState<{ start: Date | null, end: Date | null }>({
    start: null,
    end: null,
  })
  const [rangeValue2, setRangeValue2] = useState<{ start: Date | null, end: Date | null }>({
    start: null,
    end: null,
  })
  const [rangeValue3, setRangeValue3] = useState<{ start: Date | null, end: Date | null }>({
    start: null,
    end: null,
  })

  const [rangePrecisionMinute, setRangePrecisionMinute] = useState<{
    start: Date | null
    end: Date | null
  }>({ start: null, end: null })
  const [rangePrecisionSecond, setRangePrecisionSecond] = useState<{
    start: Date | null
    end: Date | null
  }>({ start: null, end: null })
  const [range12Hours, setRange12Hours] = useState<{ start: Date | null, end: Date | null }>({
    start: null,
    end: null,
  })

  const [monthValue1, setMonthValue1] = useState<Date | null>(null)
  const [monthValue3, setMonthValue3] = useState<Date | null>(null)
  const [yearValue1, setYearValue1] = useState<Date | null>(null)
  const [yearValue3, setYearValue3] = useState<Date | null>(null)

  const datePickerRef = useRef<DatePickerRef>(null)
  const today = new Date()
  const minDate = subMonths(today, 1)
  const maxDate = addMonths(today, 1)

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">DatePicker 组件测试</h1>
        <ThemeToggle />
      </div>

      <div className="space-y-10 max-w-[1600px] mx-auto">
        {/* ========== 一、日期选择器 DatePicker ========== */ }
        <section>
          <h2 className="text-lg font-semibold text-text mb-4 pb-2 border-b border-border">
            一、日期选择器 (DatePicker)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            <DemoCard
              title="基本用法"
              valueText={ value1 ? value1.toLocaleDateString('zh-CN') : '未选择' }
            >
              <DatePicker value={ value1 } onChange={ setValue1 } showClear />
            </DemoCard>
            <DemoCard
              title="日期范围限制"
              valueText={ `${minDate.toLocaleDateString('zh-CN')} ~ ${maxDate.toLocaleDateString('zh-CN')}` }
            >
              <DatePicker value={ value3 } onChange={ setValue3 } minDate={ minDate } maxDate={ maxDate } />
            </DemoCard>
            <DemoCard title="禁用周末" valueText="已禁用周末">
              <DatePicker
                value={ value4 }
                onChange={ setValue4 }
                disabledDate={ (date) => {
                  const day = date.getDay()
                  return day === 0 || day === 6
                } }
              />
            </DemoCard>
            <DemoCard title="自定义触发器">
              <DatePicker
                value={ value5 }
                onChange={ setValue5 }
                trigger={
                  <Button variant="ghost">{ value5 ? value5.toLocaleDateString('zh-CN') : '点击选择日期' }</Button>
                }
                use12Hours
                precision="second"
              />
            </DemoCard>
            <DemoCard
              title="自定义渲染"
              valueText={ customRenderValue ? customRenderValue.toLocaleDateString('zh-CN') : '未选择' }
            >
              <DatePicker
                value={ customRenderValue }
                use12Hours
                onChange={ setCustomRenderValue }
                renderTrigger={ ctx => (
                  <div
                    role="button"
                    tabIndex={ 0 }
                    onClick={ ctx.open }
                    onKeyDown={ e => (e.key === 'Enter' || e.key === ' ') && ctx.open() }
                    className="rounded-lg bg-background px-3 py-2 text-sm text-text transition-colors hover:bg-background2 cursor-pointer outline-hidden focus-visible:ring-2 focus-visible:ring-brand/50"
                  >
                    { ctx.displayValue || ctx.placeholder }
                  </div>
                ) }
              />
            </DemoCard>
            <DemoCard title="受控模式">
              <div className="flex flex-wrap gap-2 items-center">
                <Button onClick={ () => setOpen(!open) }>{ open ? '关闭' : '打开' }</Button>
                <Button variant="ghost" onClick={ () => datePickerRef.current?.open() }>
                  Ref 打开
                </Button>
                <Button variant="ghost" onClick={ () => datePickerRef.current?.close() }>
                  Ref 关闭
                </Button>
                <DatePicker
                  ref={ datePickerRef }
                  value={ value1 }
                  onChange={ setValue1 }
                  open={ open }
                  onOpenChange={ setOpen }
                />
              </div>
            </DemoCard>
            <DemoCard title="错误状态">
              <DatePicker value={ null } onChange={ () => { } } error errorMessage="请选择日期" />
            </DemoCard>
            <DemoCard title="禁用状态">
              <DatePicker value={ new Date() } onChange={ () => { } } disabled />
            </DemoCard>
            <DemoCard title="自定义格式 yyyy/MM/dd">
              <DatePicker value={ value1 } onChange={ setValue1 } format="yyyy/MM/dd" />
            </DemoCard>
            <DemoCard title="自定义格式 MM-dd-yyyy">
              <DatePicker value={ value1 } onChange={ setValue1 } format="MM-dd-yyyy" />
            </DemoCard>
            <DemoCard title="周起始 周日 (0)">
              <DatePicker value={ null } onChange={ () => { } } weekStartsOn={ 0 } />
            </DemoCard>
            <DemoCard title="周起始 周一 (1)">
              <DatePicker value={ null } onChange={ () => { } } weekStartsOn={ 1 } />
            </DemoCard>
          </div>
        </section>

        {/* ========== DatePicker 精度 ========== */ }
        <section>
          <h2 className="text-lg font-semibold text-text mb-4 pb-2 border-b border-border">
            DatePicker 精度 (precision)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <DemoCard
              title="精度到小时"
              valueText={
                precisionHour
                  ? precisionHour.toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                    })
                  : '未选择'
              }
            >
              <DatePicker value={ precisionHour } onChange={ setPrecisionHour } precision="hour" />
            </DemoCard>
            <DemoCard
              title="精度到分钟"
              valueText={
                precisionMinute
                  ? precisionMinute.toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '未选择'
              }
            >
              <DatePicker value={ precisionMinute } onChange={ setPrecisionMinute } precision="minute" />
            </DemoCard>
            <DemoCard
              title="精度到秒"
              valueText={
                precisionSecond
                  ? precisionSecond.toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  : '未选择'
              }
            >
              <DatePicker
                value={ precisionSecond }
                onChange={ setPrecisionSecond }
                precision="second"
                onConfirm={ d => console.log('onConfirm', d) }
              />
            </DemoCard>
            <DemoCard
              title="12 小时制 (minute)"
              valueText={
                value12Hours
                  ? value12Hours.toLocaleString('zh-CN', {
                      hour12: true,
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '未选择'
              }
            >
              <DatePicker value={ value12Hours } onChange={ setValue12Hours } precision="minute" use12Hours />
            </DemoCard>
          </div>
        </section>

        {/* ========== 二、日期范围选择器 DateRangePicker ========== */ }
        <section>
          <h2 className="text-lg font-semibold text-text mb-4 pb-2 border-b border-border">
            二、日期范围选择器 (DateRangePicker)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <DemoCard
              title="基本用法"
              valueText={
                rangeValue1.start && rangeValue1.end
                  ? `${rangeValue1.start.toLocaleDateString('zh-CN')} ~ ${rangeValue1.end.toLocaleDateString('zh-CN')}`
                  : '未选择'
              }
            >
              <DateRangePicker value={ rangeValue1 } onChange={ setRangeValue1 } />
            </DemoCard>
            <DemoCard
              title="日期范围限制"
              valueText={ `${minDate.toLocaleDateString('zh-CN')} ~ ${maxDate.toLocaleDateString('zh-CN')}` }
            >
              <DateRangePicker
                value={ rangeValue2 }
                onChange={ setRangeValue2 }
                minDate={ minDate }
                maxDate={ maxDate }
              />
            </DemoCard>
            <DemoCard title="禁用周末">
              <DateRangePicker
                value={ rangeValue3 }
                onChange={ setRangeValue3 }
                disabledDate={ (date) => {
                  const day = date.getDay()
                  return day === 0 || day === 6
                } }
              />
            </DemoCard>
            <DemoCard
              title="精度到分钟"
              valueText={
                rangePrecisionMinute.start && rangePrecisionMinute.end
                  ? `${rangePrecisionMinute.start.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })} ~ ${rangePrecisionMinute.end.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                  : '未选择'
              }
            >
              <DateRangePicker
                value={ rangePrecisionMinute }
                onChange={ setRangePrecisionMinute }
                precision="minute"
              />
            </DemoCard>
            <DemoCard
              title="精度到秒"
              valueText={
                rangePrecisionSecond.start && rangePrecisionSecond.end
                  ? `${rangePrecisionSecond.start.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })} ~ ${rangePrecisionSecond.end.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}`
                  : '未选择'
              }
            >
              <DateRangePicker
                value={ rangePrecisionSecond }
                onChange={ setRangePrecisionSecond }
                precision="second"
              />
            </DemoCard>
            <DemoCard
              title="12 小时制 (minute)"
              valueText={
                range12Hours.start && range12Hours.end
                  ? `${range12Hours.start.toLocaleString('zh-CN', { hour12: true, hour: '2-digit', minute: '2-digit' })} ~ ${range12Hours.end.toLocaleString('zh-CN', { hour12: true, hour: '2-digit', minute: '2-digit' })}`
                  : '未选择'
              }
            >
              <DateRangePicker
                value={ range12Hours }
                onChange={ setRange12Hours }
                precision="minute"
                use12Hours
              />
            </DemoCard>
          </div>
        </section>

        {/* ========== 三、月份选择器 MonthPicker ========== */ }
        <section>
          <h2 className="text-lg font-semibold text-text mb-4 pb-2 border-b border-border">
            三、月份选择器 (MonthPicker)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DemoCard
              title="基本用法"
              valueText={ monthValue1 ? monthValue1.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }) : '未选择' }
            >
              <MonthPicker value={ monthValue1 } onChange={ setMonthValue1 } />
            </DemoCard>
            <DemoCard
              title="日期范围限制"
              valueText={ `${minDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })} ~ ${maxDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}` }
            >
              <MonthPicker
                value={ monthValue3 }
                onChange={ setMonthValue3 }
                minDate={ minDate }
                maxDate={ maxDate }
              />
            </DemoCard>
          </div>
        </section>

        {/* ========== 四、年份选择器 YearPicker ========== */ }
        <section>
          <h2 className="text-lg font-semibold text-text mb-4 pb-2 border-b border-border">
            四、年份选择器 (YearPicker)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DemoCard title="基本用法" valueText={ yearValue1 ? String(yearValue1.getFullYear()) : '未选择' }>
              <YearPicker value={ yearValue1 } onChange={ setYearValue1 } />
            </DemoCard>
            <DemoCard title="自定义年份范围（前后各 20 年）" valueText={ yearValue3 ? String(yearValue3.getFullYear()) : '未选择' }>
              <YearPicker value={ yearValue3 } onChange={ setYearValue3 } yearRange={ 20 } />
            </DemoCard>
          </div>
        </section>
      </div>
    </div>
  )
}
