'use client'

import type { DatePickerRef } from './types'
import { addMonths, subMonths } from 'date-fns'
import { useRef, useState } from 'react'
import { Button } from '../Button'
import { ThemeToggle } from '../ThemeToggle'
import { DatePicker, DateRangePicker, MonthPicker, YearPicker } from './index'

export default function DatePickerTest() {
  // DatePicker 状态
  const [value1, setValue1] = useState<Date | null>(null)
  const [value3, setValue3] = useState<Date | null>(null)
  const [value4, setValue4] = useState<Date | null>(null)
  const [value5, setValue5] = useState<Date | null>(null)
  const [open, setOpen] = useState(false)

  // 精度选择测试状态
  const [precisionHour, setPrecisionHour] = useState<Date | null>(null)
  const [precisionMinute, setPrecisionMinute] = useState<Date | null>(null)
  const [precisionSecond, setPrecisionSecond] = useState<Date | null>(null)
  const [precisionHourSingle, setPrecisionHourSingle] = useState<Date | null>(null)

  // DateRangePicker 状态
  const [rangeValue1, setRangeValue1] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null })
  const [rangeValue2, setRangeValue2] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null })
  const [rangeValue3, setRangeValue3] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null })

  // 精度选择范围测试状态
  const [rangePrecisionMinute, setRangePrecisionMinute] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null })
  const [rangePrecisionSecond, setRangePrecisionSecond] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null })

  // MonthPicker 状态
  const [monthValue1, setMonthValue1] = useState<Date | null>(null)
  const [monthValue3, setMonthValue3] = useState<Date | null>(null)

  // YearPicker 状态
  const [yearValue1, setYearValue1] = useState<Date | null>(null)
  const [yearValue3, setYearValue3] = useState<Date | null>(null)

  const datePickerRef = useRef<DatePickerRef>(null)

  const today = new Date()
  const minDate = subMonths(today, 1)
  const maxDate = addMonths(today, 1)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-textPrimary">DatePicker 组件测试</h1>
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-4xl space-y-8">
        {/* ========== 日期选择器 ========== */ }
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-textPrimary">日期选择器 (DatePicker)</h2>
          <div className="space-y-2">
            <DatePicker
              value={ value1 }
              onChange={ setValue1 }
            />
            <p className="text-sm text-textSecondary">
              选中值:
              { ' ' }
              { value1 ? value1.toLocaleDateString('zh-CN') : '未选择' }
            </p>
          </div>
        </section>

        {/* ========== 月份选择器 ========== */ }
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-textPrimary">月份选择器 (MonthPicker)</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-textPrimary">基本用法</p>
              <MonthPicker
                value={ monthValue1 }
                onChange={ setMonthValue1 }
              />
              <p className="text-sm text-textSecondary">
                选中值:
                { ' ' }
                { monthValue1 ? monthValue1.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }) : '未选择' }
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-textPrimary">日期范围限制</p>
              <MonthPicker
                value={ monthValue3 }
                onChange={ setMonthValue3 }
                minDate={ minDate }
                maxDate={ maxDate }
              />
              <p className="text-sm text-textSecondary">
                限制范围:
                { ' ' }
                { minDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }) }
                { ' ' }
                ~
                { ' ' }
                { maxDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }) }
              </p>
            </div>
          </div>
        </section>

        {/* ========== 年份选择器 ========== */ }
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-textPrimary">年份选择器 (YearPicker)</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-textPrimary">基本用法</p>
              <YearPicker
                value={ yearValue1 }
                onChange={ setYearValue1 }
              />
              <p className="text-sm text-textSecondary">
                选中值:
                { ' ' }
                { yearValue1 ? yearValue1.getFullYear() : '未选择' }
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-textPrimary">自定义年份范围（前后各20年）</p>
              <YearPicker
                value={ yearValue3 }
                onChange={ setYearValue3 }
                yearRange={ 20 }
              />
              <p className="text-sm text-textSecondary">
                选中值:
                { ' ' }
                { yearValue3 ? yearValue3.getFullYear() : '未选择' }
              </p>
            </div>
          </div>
        </section>

        {/* ========== DatePicker 其他测试 ========== */ }

        {/* 日期范围限制 */ }
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-textPrimary">日期范围限制</h2>
          <div className="space-y-2">
            <DatePicker
              value={ value3 }
              onChange={ setValue3 }
              minDate={ minDate }
              maxDate={ maxDate }
            />
            <p className="text-sm text-textSecondary">
              限制范围:
              { ' ' }
              { minDate.toLocaleDateString('zh-CN') }
              { ' ' }
              ~
              { ' ' }
              { maxDate.toLocaleDateString('zh-CN') }
            </p>
          </div>
        </section>

        {/* 自定义禁用日期 */ }
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-textPrimary">自定义禁用日期</h2>
          <div className="space-y-2">
            <DatePicker
              value={ value4 }
              onChange={ setValue4 }
              disabledDate={ (date) => {
                // 禁用周末
                const day = date.getDay()
                return day === 0 || day === 6
              } }
            />
            <p className="text-sm text-textSecondary">
              已禁用周末
            </p>
          </div>
        </section>

        {/* 自定义触发器 */ }
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-textPrimary">自定义触发器</h2>
          <div className="space-y-2">
            <DatePicker
              value={ value5 }
              onChange={ setValue5 }
              trigger={
                <Button variant="ghost">
                  { value5 ? value5.toLocaleDateString('zh-CN') : '点击选择日期' }
                </Button>
              }
            />
          </div>
        </section>

        {/* 受控模式 */ }
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-textPrimary">受控模式</h2>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button onClick={ () => setOpen(!open) }>
                { open ? '关闭' : '打开' }
                日期选择器
              </Button>
              <Button
                variant="ghost"
                onClick={ () => {
                  datePickerRef.current?.open()
                } }
              >
                通过 Ref 打开
              </Button>
              <Button
                variant="ghost"
                onClick={ () => {
                  datePickerRef.current?.close()
                } }
              >
                通过 Ref 关闭
              </Button>
            </div>
            <DatePicker
              ref={ datePickerRef }
              value={ value1 }
              onChange={ setValue1 }
              open={ open }
              onOpenChange={ setOpen }
            />
          </div>
        </section>

        {/* 错误状态 */ }
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-textPrimary">错误状态</h2>
          <div className="space-y-2">
            <DatePicker
              value={ null }
              onChange={ () => { } }
              error
              errorMessage="请选择日期"
            />
          </div>
        </section>

        {/* 禁用状态 */ }
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-textPrimary">禁用状态</h2>
          <div className="space-y-2">
            <DatePicker
              value={ new Date() }
              onChange={ () => { } }
              disabled
            />
          </div>
        </section>

        {/* 不同定位 */ }
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-textPrimary">不同定位</h2>
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              value={ null }
              onChange={ () => { } }
              placement="bottom-start"
            />
            <DatePicker
              value={ null }
              onChange={ () => { } }
              placement="bottom-end"
            />
            <DatePicker
              value={ null }
              onChange={ () => { } }
              placement="top-start"
            />
            <DatePicker
              value={ null }
              onChange={ () => { } }
              placement="top-end"
            />
          </div>
        </section>

        {/* 自定义格式 */ }
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-textPrimary">自定义格式</h2>
          <div className="space-y-2">
            <DatePicker
              value={ value1 }
              onChange={ setValue1 }
              format="yyyy/MM/dd"
            />
            <DatePicker
              value={ value1 }
              onChange={ setValue1 }
              format="MM-dd-yyyy"
            />
          </div>
        </section>

        {/* 周起始日 */ }
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-textPrimary">周起始日</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-textSecondary">周日开始 (weekStartsOn=0)</p>
              <DatePicker
                value={ null }
                onChange={ () => { } }
                weekStartsOn={ 0 }
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-textSecondary">周一开始 (weekStartsOn=1)</p>
              <DatePicker
                value={ null }
                onChange={ () => { } }
                weekStartsOn={ 1 }
              />
            </div>
          </div>
        </section>

        {/* ========== 精度选择测试 ========== */ }
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-textPrimary">精度选择 (Precision)</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-textPrimary">精度到小时 (precision="hour")</p>
              <DatePicker
                value={ precisionHour }
                onChange={ setPrecisionHour }
                precision="hour"
              />
              <p className="text-sm text-textSecondary">
                选中值:
                { ' ' }
                { precisionHour
                  ? precisionHour.toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                    })
                  : '未选择' }
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-textPrimary">精度到分钟 (precision="minute")</p>
              <DatePicker
                value={ precisionMinute }
                onChange={ setPrecisionMinute }
                precision="minute"
              />
              <p className="text-sm text-textSecondary">
                选中值:
                { ' ' }
                { precisionMinute
                  ? precisionMinute.toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '未选择' }
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-textPrimary">精度到秒 (precision="second")</p>
              <DatePicker
                value={ precisionSecond }
                onChange={ (date) => {
                  console.log('📝 onChange 触发:', date || 'null')
                  setPrecisionSecond(date)
                } }
                onConfirm={ (date) => {
                  console.log('✅ onConfirm 触发 (数据改变且关闭):', date || 'null')
                } }
                precision="second"
              />
              <p className="text-sm text-textSecondary">
                选中值:
                { ' ' }
                { precisionSecond
                  ? precisionSecond.toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  : '未选择' }
              </p>
            </div>
          </div>
        </section>

        {/* ========== 日期范围选择器 ========== */ }
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-textPrimary">日期范围选择器 (DateRangePicker)</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-textPrimary">基本用法</p>
              <DateRangePicker
                value={ rangeValue1 }
                onChange={ setRangeValue1 }
              />
              <p className="text-sm text-textSecondary">
                选中范围:
                { ' ' }
                { rangeValue1.start && rangeValue1.end
                  ? `${rangeValue1.start.toLocaleDateString('zh-CN')} ~ ${rangeValue1.end.toLocaleDateString('zh-CN')}`
                  : '未选择' }
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-textPrimary">日期范围限制</p>
              <DateRangePicker
                value={ rangeValue2 }
                onChange={ setRangeValue2 }
                minDate={ minDate }
                maxDate={ maxDate }
              />
              <p className="text-sm text-textSecondary">
                限制范围:
                { ' ' }
                { minDate.toLocaleDateString('zh-CN') }
                { ' ' }
                ~
                { ' ' }
                { maxDate.toLocaleDateString('zh-CN') }
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-textPrimary">自定义禁用日期（禁用周末）</p>
              <DateRangePicker
                value={ rangeValue3 }
                onChange={ setRangeValue3 }
                disabledDate={ (date) => {
                  // 禁用周末
                  const day = date.getDay()
                  return day === 0 || day === 6
                } }
              />
              <p className="text-sm text-textSecondary">
                已禁用周末
              </p>
            </div>
          </div>
        </section>

        {/* ========== 日期范围精度选择测试 ========== */ }
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-textPrimary">日期范围精度选择 (DateRangePicker Precision)</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-textPrimary">精度到小时 (precision="hour")</p>
              <DatePicker
                value={ precisionHourSingle }
                onChange={ setPrecisionHourSingle }
                precision="hour"
              />
              <p className="text-sm text-textSecondary">
                选中值:
                { ' ' }
                { precisionHourSingle
                  ? precisionHourSingle.toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                    })
                  : '未选择' }
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-textPrimary">精度到分钟 (precision="minute")</p>
              <DateRangePicker
                value={ rangePrecisionMinute }
                onChange={ setRangePrecisionMinute }
                precision="minute"
              />
              <p className="text-sm text-textSecondary">
                选中范围:
                { ' ' }
                { rangePrecisionMinute.start && rangePrecisionMinute.end
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
                  : '未选择' }
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-textPrimary">精度到秒 (precision="second")</p>
              <DateRangePicker
                value={ rangePrecisionSecond }
                precision="second"
                onChange={ (date) => {
                  console.log('📝 onChange 触发:', date || 'null')
                  setRangePrecisionSecond(date)
                } }
                onConfirm={ (date) => {
                  console.log('✅ onConfirm 触发 (数据改变且关闭):', date || 'null')
                } }
              />
              <p className="text-sm text-textSecondary">
                选中范围:
                { ' ' }
                { rangePrecisionSecond.start && rangePrecisionSecond.end
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
                  : '未选择' }
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
