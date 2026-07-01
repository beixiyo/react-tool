import { useMotionValue } from 'motion/react'
import { useEffect, useState } from 'react'
import { Button } from '../Button'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { ProgressBar } from '../Progress'
import { Slider } from '../Slider'
import { ThemeToggle } from '../ThemeToggle'
import { CountdownBorder } from './index'

function CountdownBorderTest() {
  const [resetKey, setResetKey] = useState(0)
  const [running, setRunning] = useState(true)
  const [controlledProgress, setControlledProgress] = useState(0.72)
  const motionProgress = useMotionValue(0.46)

  useEffect(() => {
    motionProgress.set(controlledProgress)
  }, [controlledProgress, motionProgress])

  return (
    <div className="min-h-screen bg-background p-6 text-text">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">CountdownBorder 组件</h1>
            <p className="mt-1 text-sm text-text2">圆角矩形边框倒计时，可包裹任意内容</p>
          </div>

          <ThemeToggle />
        </header>

        <Card
          title="Toast 风格"
          headerActions={
            <div className="flex gap-2">
              <Button size="sm" onClick={ () => setRunning(value => !value) }>
                { running ? 'Pause' : 'Start' }
              </Button>
              <Button size="sm" onClick={ () => setResetKey(value => value + 1) }>Restart</Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <CountdownBorder
              resetKey={ resetKey }
              running={ running }
              duration={ 8000 }
              width={ 360 }
              height={ 64 }
              radius={ 16 }
              startX={ 125 }
              className="shadow-toast"
              contentClassName="flex items-center justify-between gap-3 px-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-sm font-semibold text-brand">
                  AI
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">Meeting detected</div>
                  <div className="truncate text-sm text-text2">Product Sync</div>
                </div>
              </div>

              <Button size="sm" className="shrink-0">Start recording</Button>
            </CountdownBorder>

            <p className="text-sm text-text2">
              保留 meeting-toast 的起跑位置与细描边，内容完全由 children 决定
            </p>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card title="受控 progress">
            <div className="flex flex-col gap-4">
              <CountdownBorder
                progress={ controlledProgress }
                width={ 320 }
                height={ 96 }
                radius={ 24 }
                strokeWidth={ 3 }
                pathClassName="stroke-systemOrange"
                contentClassName="flex flex-col justify-center px-5"
              >
                <div className="text-sm font-semibold">Controlled progress</div>
                <div className="mt-1 text-xs text-text2">{ Math.round(controlledProgress * 100) }%</div>
              </CountdownBorder>

              <Slider
                min={ 0 }
                max={ 1 }
                step={ 0.01 }
                value={ controlledProgress }
                onChange={ value => setControlledProgress(value) }
              />
            </div>
          </Card>

          <Card title="MotionValue progress">
            <div className="flex flex-col gap-4">
              <CountdownBorder
                progress={ motionProgress }
                width={ 320 }
                height={ 96 }
                radius={ 12 }
                strokeWidth={ 4 }
                startX={ 40 }
                pathClassName="stroke-systemGreen"
                contentClassName="flex flex-col justify-center px-5"
              >
                <div className="text-sm font-semibold">MotionValue input</div>
                <div className="mt-1 text-xs text-text2">可直接接 motion/react 动画值</div>
              </CountdownBorder>

              <ProgressBar value={ controlledProgress } />
            </div>
          </Card>
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default CountdownBorderTest
