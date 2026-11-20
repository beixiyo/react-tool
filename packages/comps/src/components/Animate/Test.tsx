import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '../Button'
import { Card } from '../Card'
import { AnimateShow, MOTION_TRANSITIONS } from '.'

/**
 * AnimateShow 组件测试页面
 * 展示各种动画变体、显示模式和配置选项
 */
function AnimateShowTestPage() {
  const [compareOpen, setCompareOpen] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [show1, setShow1] = useState(true)
  const [show2, setShow2] = useState(true)
  const [show3, setShow3] = useState(true)
  const [show4, setShow4] = useState(true)
  const [show5, setShow5] = useState(true)
  const [show6, setShow6] = useState(true)
  const [show7, setShow7] = useState(true)
  const [show8, setShow8] = useState(true)
  const [show9, setShow9] = useState(true)
  const [show10, setShow10] = useState(true)

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        { /* 页面标题 */ }
        <div className="mb-8">
          <h1 className="text-text mb-2 text-3xl font-bold">
            AnimateShow 组件测试
          </h1>
          <p className="text-text2">
            测试 AnimateShow 组件的各种动画变体、显示模式和配置选项
          </p>
        </div>

        <Card className="space-y-4 p-6">
          <h2 className="text-text text-xl font-semibold">AnimateShow · 弹簧对比</h2>
          <p className="text-text2 text-sm">两侧用同一个无回弹弹簧预设，只比较不同时长。</p>
          <Button
            size="sm"
            aria-expanded={ compareOpen }
            onClick={ () => setCompareOpen((open) => !open) }
          >
            同时切换
          </Button>
          <div className="grid grid-cols-2 gap-4">
            <section className="min-w-0 space-y-2">
              <h3 className="text-text2 text-sm">显式时长 · 600ms</h3>
              <AnimateShow show={ compareOpen } duration={ 0.6 } className="overflow-hidden">
                <div className="bg-background2 text-text h-28 rounded-lg p-4">相同内容，同步开合</div>
              </AnimateShow>
            </section>
            <section className="min-w-0 space-y-2">
              <h3 className="text-text2 text-sm">默认时长 · 300ms</h3>
              <AnimateShow show={ compareOpen } className="overflow-hidden">
                <div className="bg-background2 text-text h-28 rounded-lg p-4">相同内容，同步开合</div>
              </AnimateShow>
            </section>
          </div>
        </Card>

        <Card className="p-6">
          <Button size="sm" aria-expanded={ expanded } aria-controls="height-reveal-demo" onClick={ () => setExpanded(!expanded) }>
            切换高度与宽度
          </Button>
          <section id="height-reveal-demo" className="mt-3 space-y-2">
            <motion.div
              initial={ false }
              animate={ {
                height: expanded
                  ? 80
                  : 0,
              } }
              transition={ MOTION_TRANSITIONS.smooth }
              className="bg-background2 overflow-hidden rounded-lg"
            >
              <p className="p-4">同一组弹簧参数用于高度</p>
            </motion.div>
            <motion.div
              initial={ false }
              animate={ {
                width: expanded
                  ? 240
                  : 40,
              } }
              transition={ MOTION_TRANSITIONS.smooth }
              className="bg-background3 h-3 max-w-full rounded-lg"
            />
          </section>
        </Card>

        { /* 基础动画变体测试 */ }
        <Card className="p-6">
          <h2 className="text-text mb-4 text-xl font-semibold">
            基础动画变体
          </h2>
          <div className="space-y-4">
            { /* top-bottom */ }
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text font-medium">top-bottom（默认）</span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={ () => setShow1(!show1) }
                >
                  { show1
                    ? '隐藏'
                    : '显示' }
                </Button>
              </div>
              <AnimateShow show={ show1 } variants="top-bottom">
                <div className="bg-background2 border-border rounded-lg border p-4">
                  从上方滑入，向下方滑出
                </div>
              </AnimateShow>
            </div>

            { /* bottom-top */ }
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text font-medium">bottom-top</span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={ () => setShow2(!show2) }
                >
                  { show2
                    ? '隐藏'
                    : '显示' }
                </Button>
              </div>
              <AnimateShow show={ show2 } variants="bottom-top">
                <div className="bg-background2 border-border rounded-lg border p-4">
                  从下方滑入，向上方滑出
                </div>
              </AnimateShow>
            </div>

            { /* left-right */ }
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text font-medium">left-right</span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={ () => setShow3(!show3) }
                >
                  { show3
                    ? '隐藏'
                    : '显示' }
                </Button>
              </div>
              <AnimateShow show={ show3 } variants="left-right">
                <div className="bg-background2 border-border rounded-lg border p-4">
                  从左侧滑入，向右侧滑出
                </div>
              </AnimateShow>
            </div>

            { /* right-left */ }
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text font-medium">right-left</span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={ () => setShow4(!show4) }
                >
                  { show4
                    ? '隐藏'
                    : '显示' }
                </Button>
              </div>
              <AnimateShow show={ show4 } variants="right-left">
                <div className="bg-background2 border-border rounded-lg border p-4">
                  从右侧滑入，向左侧滑出
                </div>
              </AnimateShow>
            </div>

            { /* fade */ }
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text font-medium">fade</span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={ () => setShow5(!show5) }
                >
                  { show5
                    ? '隐藏'
                    : '显示' }
                </Button>
              </div>
              <AnimateShow show={ show5 } variants="fade">
                <div className="bg-background2 border-border rounded-lg border p-4">
                  淡入淡出效果
                </div>
              </AnimateShow>
            </div>

            { /* scale */ }
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text font-medium">scale</span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={ () => setShow6(!show6) }
                >
                  { show6
                    ? '隐藏'
                    : '显示' }
                </Button>
              </div>
              <AnimateShow show={ show6 } variants="scale">
                <div className="bg-background2 border-border rounded-lg border p-4">
                  缩放淡入淡出效果
                </div>
              </AnimateShow>
            </div>
          </div>
        </Card>

        { /* 显示模式测试 */ }
        <Card className="p-6">
          <h2 className="text-text mb-4 text-xl font-semibold">
            显示模式测试
          </h2>
          <div className="space-y-4">
            { /* display 模式（默认） */ }
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text font-medium">
                  display 模式（默认，隐藏时 display: none）
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={ () => setShow7(!show7) }
                >
                  { show7
                    ? '隐藏'
                    : '显示' }
                </Button>
              </div>
              <AnimateShow show={ show7 } display="block">
                <div className="bg-background2 border-border rounded-lg border p-4">
                  使用 display 模式，隐藏时完全从 DOM 流中移除
                </div>
              </AnimateShow>
            </div>

            { /* visibility 模式 */ }
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text font-medium">
                  visibility 模式（隐藏时 visibility: hidden）
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={ () => setShow8(!show8) }
                >
                  { show8
                    ? '隐藏'
                    : '显示' }
                </Button>
              </div>
              <AnimateShow show={ show8 } visibilityMode>
                <div className="bg-background2 border-border rounded-lg border p-4">
                  使用 visibility 模式，隐藏时仍占据空间
                </div>
              </AnimateShow>
            </div>
          </div>
        </Card>

        { /* 高级配置测试 */ }
        <Card className="p-6">
          <h2 className="text-text mb-4 text-xl font-semibold">
            高级配置测试
          </h2>
          <div className="space-y-4">
            { /* 自定义 duration */ }
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text font-medium">
                  自定义动画时长（1 秒）
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={ () => setShow9(!show9) }
                >
                  { show9
                    ? '隐藏'
                    : '显示' }
                </Button>
              </div>
              <AnimateShow show={ show9 } duration={ 1 } variants="fade">
                <div className="bg-background2 border-border rounded-lg border p-4">
                  动画时长为 1 秒，比默认的 0.3 秒更慢
                </div>
              </AnimateShow>
            </div>

            { /* exitSetMode */ }
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text font-medium">
                  exitSetMode（退出时同步设置，无退出动画）
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={ () => setShow10(!show10) }
                >
                  { show10
                    ? '隐藏'
                    : '显示' }
                </Button>
              </div>
              <AnimateShow show={ show10 } exitSetMode variants="top-bottom">
                <div className="bg-background2 border-border rounded-lg border p-4">
                  启用 exitSetMode，退出时立即隐藏，无退出动画。适用于路由切换等场景
                </div>
              </AnimateShow>
            </div>
          </div>
        </Card>

        { /* 使用说明 */ }
        <Card className="p-6">
          <h2 className="text-text mb-4 text-xl font-semibold">
            使用说明
          </h2>
          <div className="text-text2 space-y-2 text-sm">
            <p>
              <strong className="text-text">show：</strong>
              控制组件的显示/隐藏状态
            </p>
            <p>
              <strong className="text-text">variants：</strong>
              动画变体，支持 'top-bottom'、'bottom-top'、'left-right'、'right-left'、'fade'、'scale' 或自定义 Variants 对象
            </p>
            <p>
              <strong className="text-text">display：</strong>
              显示模式，默认为 'block'，隐藏时设置为 'none'
            </p>
            <p>
              <strong className="text-text">visibilityMode：</strong>
              使用 visibility 模式而非 display 模式，隐藏时仍占据空间
            </p>
            <p>
              <strong className="text-text">duration：</strong>
              动画时长（秒），默认为 0.3
            </p>
            <p>
              <strong className="text-text">exitSetMode：</strong>
              退出时使用同步 set 模式，关闭退出动画，适用于路由动画等场景
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AnimateShowTestPage
