'use client'

import { BarChart3, Globe, MessageCircle, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { Switch } from '.'
import { ThemeToggle } from '../ThemeToggle'

function SwitchDemo() {
  const [checked1, setChecked1] = useState(false)
  const [checked2, setChecked2] = useState(true)
  const [checked3, setChecked3] = useState(false)
  const [langChecked, setLangChecked] = useState(false)
  const [labelChecked, setLabelChecked] = useState(false)

  return (
    <div className="min-h-screen bg-background px-4 py-12 lg:px-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg bg-background2 p-6 shadow-card">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl text-text font-bold">Switch 组件演示</h1>
            <ThemeToggle />
          </div>

          <div className="space-y-8">
            {/* 基础用法 */ }
            <div className="space-y-4">
              <h2 className="text-lg text-text2 font-semibold">基础用法</h2>
              <div className="flex items-center space-x-4">
                <Switch />
                <span className="text-text2">默认开关</span>
              </div>
            </div>

            {/* 非受控组件 */}
            <div className="space-y-4">
              <h2 className="text-lg text-text2 font-semibold">非受控组件</h2>
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked={ false } />
                  <span className="text-text2">默认关闭</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked />
                  <span className="text-text2">默认开启</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked label="可切换状态" background="#8B5CF6" />
                </div>
              </div>
            </div>

            {/* 不同尺寸 */ }
            <div className="space-y-4">
              <h2 className="text-lg text-text2 font-semibold">不同尺寸</h2>
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <Switch size="sm" />
                  <span className="text-text2">小尺寸</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch size="md" />
                  <span className="text-text2">中尺寸</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch size="lg" />
                  <span className="text-text2">大尺寸</span>
                </div>
              </div>
            </div>

            {/* 受控组件 */ }
            <div className="space-y-4">
              <h2 className="text-lg text-text2 font-semibold">受控组件</h2>
              <div className="flex items-center space-x-4">
                <Switch checked={ checked1 } onChange={ setChecked1 } />
                <span className="text-text2">
                  当前状态:
                  { checked1
                    ? '开启'
                    : '关闭' }
                </span>
              </div>
            </div>

            {/* 自定义颜色 */ }
            <div className="space-y-4">
              <h2 className="text-lg text-text2 font-semibold">自定义颜色</h2>
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <Switch checked={ checked2 } onChange={ setChecked2 } background="#10B981" />
                  <span className="text-text2">绿色</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={ checked3 } onChange={ setChecked3 } background="#EF4444" />
                  <span className="text-text2">红色</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={ checked3 }
                    onChange={ setChecked3 }
                    size="md"
                    background="#e5e7eb"
                    withGradient={ false }
                    icon={ <BarChart3 size={ 12 } className="text-white" /> }
                    iconClassName="bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600"
                  />
                  <span className="text-text2">渐变</span>
                </div>
              </div>
            </div>

            {/* 带图标的开关 */ }
            <div className="space-y-4">
              <h2 className="text-lg text-text2 font-semibold">带图标的开关</h2>
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={ langChecked }
                    onChange={ setLangChecked }
                    checkedIcon={ <Globe className="text-gray-700 dark:text-gray-900" /> }
                    uncheckedIcon={ <MessageCircle className="text-gray-700 dark:text-gray-900" /> }
                    background="#6366F1"
                  />
                  <span className="text-text2">
                    { langChecked
                      ? '全球语言'
                      : '默认语言' }
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={ checked1 }
                    onChange={ setChecked1 }
                    checkedIcon={ <Sun className="text-gray-700 dark:text-gray-900" /> }
                    uncheckedIcon={ <Moon className="text-gray-700 dark:text-gray-900" /> }
                    background="#F59E0B"
                  />
                  <span className="text-text2">
                    { checked1
                      ? '白天模式'
                      : '夜间模式' }
                  </span>
                </div>
              </div>
            </div>

            {/* 带标签的开关 */}
            <div className="space-y-4">
              <h2 className="text-lg text-text2 font-semibold">带标签的开关</h2>
              <div className="flex items-center space-x-8">
                <Switch
                  checked={ labelChecked }
                  onChange={ setLabelChecked }
                  label="开启通知"
                  background="#8B5CF6"
                />
                <Switch
                  checked={ !labelChecked }
                  onChange={ val => setLabelChecked(!val) }
                  label="自动保存"
                  labelClassName="font-medium"
                  background="#EC4899"
                />
              </div>
            </div>

            {/* 禁用状态 */ }
            <div className="space-y-4">
              <h2 className="text-lg text-text2 font-semibold">禁用状态</h2>
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <Switch disabled />
                  <span className="text-text2">禁用</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch disabled checked />
                  <span className="text-text2">禁用（已选中）</span>
                </div>
                <Switch disabled checked label="禁用带标签" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SwitchDemo
