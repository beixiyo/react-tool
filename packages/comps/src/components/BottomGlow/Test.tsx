import { useEffect, useState } from 'react'
import { Button } from '../Button'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { Slider } from '../Slider'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'
import type { BottomGlowPosition } from './index'
import { BottomGlow, GlowField } from './index'

const POSITION_OPTIONS: Array<{ label: string; value: BottomGlowPosition }> = [
  { label: '左下', value: 'bottom-left' },
  { label: '底部居中', value: 'bottom-center' },
  { label: '右下', value: 'bottom-right' },
]

/** 生成接近说话节奏的演示音量，调用方可替换为真实音频分析结果 */
function getSimulatedLevel(time: number) {
  const carrier = Math.abs(Math.sin(time * 2.4))
  const detail = Math.abs(Math.sin(time * 7.1)) * 0.28
  return Math.min(1, 0.08 + carrier * 0.64 + detail)
}

function BottomGlowTest() {
  const [level, setLevel] = useState(0.35)
  const [active, setActive] = useState(true)
  const [autoPlay, setAutoPlay] = useState(true)
  const [glowHeight, setGlowHeight] = useState(1)
  const [showLight, setShowLight] = useState(true)
  const [breathing, setBreathing] = useState(true)
  const [position, setPosition] = useState<BottomGlowPosition>('bottom-center')

  useEffect(() => {
    if (!autoPlay) return

    const startedAt = performance.now()
    const timer = window.setInterval(() => {
      setLevel(getSimulatedLevel((performance.now() - startedAt) / 1000))
    }, 80)

    return () => window.clearInterval(timer)
  }, [autoPlay])

  return (
    <div className="min-h-screen bg-background p-6 text-text">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">BottomGlow 组件</h1>
            <p className="mt-1 text-sm text-text2">由外部强度驱动的通用容器底部光效</p>
          </div>

          <ThemeToggle />
        </header>

        <Card title="交互预览" padding="xl">
          <div className="flex flex-col gap-8">
            <div className="rounded-3xl bg-brand p-8 sm:p-12">
              <BottomGlow
                level={ level }
                active={ active }
                glowHeight={ glowHeight }
                breathing={ breathing }
                showLight={ showLight }
                position={ position }
                contentClassName="text-[clamp(1rem,10cqw,2rem)]"
                contentStyle={ { letterSpacing: '0.04em' } }
                className="mx-auto max-w-md shadow-lg"
              >
                Listening...
              </BottomGlow>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">光晕高度</span>
                <span className="text-text2 tabular-nums">{ Math.round(glowHeight * 100) }%</span>
              </div>
              <Slider ariaLabel="光晕高度" min={ 0.2 } max={ 1 } step={ 0.01 } value={ glowHeight } onChange={ (value) => setGlowHeight(value) } />
            </div>

            <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">外部音量</span>
                  <span className="text-text2 tabular-nums">{ Math.round(level * 100) }%</span>
                </div>
                <Slider ariaLabel="外部音量" min={ 0 } max={ 1 } step={ 0.01 } value={ level } disabled={ autoPlay } onChange={ (value) => setLevel(value) } />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Switch checked={ active } label="录音中" ariaLabel="切换录音状态" onChange={ setActive } />
                <Switch checked={ autoPlay } label="模拟输入" ariaLabel="切换自动模拟音量" onChange={ setAutoPlay } />
                <Switch checked={ breathing } label="呼吸循环" ariaLabel="切换 6s 呼吸循环" onChange={ setBreathing } />
                <Switch checked={ showLight } label="白色亮条" ariaLabel="切换底部白色亮条" onChange={ setShowLight } />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={ () => setLevel(0) }>
                静音
              </Button>
              <Button size="sm" onClick={ () => setLevel(0.5) }>
                中等
              </Button>
              <Button size="sm" onClick={ () => setLevel(1) }>
                满音量
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-sm font-medium">光效位置</span>
              { POSITION_OPTIONS.map((option) => (
                <Button
                  key={ option.value }
                  size="sm"
                  variant={ position === option.value
                    ? 'primary'
                    : 'default' }
                  onClick={ () => setPosition(option.value) }
                >
                  { option.label }
                </Button>
              )) }
            </div>
          </div>
        </Card>

        <Card title="设计原比例 402:288" padding="xl">
          <p className="mb-5 text-sm text-text2">
            胶囊是 3.28:1，会把设计稿 288 单位的垂直色相压扁约 2.4 倍。这里按设计稿原比例渲染， 自上而下应依次读到 粉 #EB92E3 → 浅粉 #FCDEFA → 蓝 #5F7EE9。
            右侧多出的白色亮条是本组件自己的元素，Android 侧没有，它正好压在蓝层核心上
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-text2">光场本体 GlowField</span>
              <div className="relative aspect-402/288 w-full overflow-hidden rounded-2xl bg-white">
                <GlowField level={ level } breathing={ breathing } />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-text2">完整组件 BottomGlow</span>
              <BottomGlow
                level={ level }
                active={ active }
                breathing={ breathing }
                showLight={ showLight }
                position={ position }
                className="aspect-402/288 w-full rounded-2xl"
              >
                Listening...
              </BottomGlow>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card title="静音边界">
            <div className="rounded-2xl bg-brand p-6">
              <BottomGlow level={ -1 } className="mx-auto max-w-72">
                Idle
              </BottomGlow>
            </div>
          </Card>

          <Card title="满音量边界">
            <div className="rounded-2xl bg-brand p-6">
              <BottomGlow level={ 2 } className="mx-auto max-w-72">
                Recording...
              </BottomGlow>
            </div>
          </Card>
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default BottomGlowTest
