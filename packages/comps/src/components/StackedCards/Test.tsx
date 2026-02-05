'use client'

import { useState } from 'react'
import {
  Button,
  Slider,
  StackedCards,
  ThemeToggle,
} from '../index'

export default function Page() {
  const [layers, setLayers] = useState(3)
  const [offsetX, setOffsetX] = useState(10)
  const [offsetY, setOffsetY] = useState(10)
  const [scaleStep, setScaleStep] = useState(0.03)
  const [opacityStep, setOpacityStep] = useState(0.08)

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs text-textSecondary">Stacked Cards</p>
            <h1 className="text-2xl font-semibold text-textPrimary">
              多层堆叠卡片预览
            </h1>
            <p className="text-sm text-textSecondary">
              可调节层数、偏移、缩放与透明度，最大支持 3 层
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex items-center justify-center rounded-2xl border border-border bg-backgroundSecondary/60 p-8">
            <StackedCards
              layers={ layers as 1 | 2 | 3 }
              offsetX={ offsetX }
              offsetY={ offsetY }
              scaleStep={ scaleStep }
              opacityStep={ opacityStep }
              className="h-64 w-80"
              topLayerClassName="bg-background"
              contentClassName="p-5"
            >
              <div className="flex h-full flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-xs text-textSecondary">Today</div>
                  <div className="text-lg font-semibold text-textPrimary">
                    Design Sync
                  </div>
                  <div className="text-sm text-textSecondary">
                    12:30 - 13:15 · Studio 4A
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button>Join</Button>
                  <Button variant="primary">Details</Button>
                </div>
              </div>
            </StackedCards>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
            <div className="space-y-5">
              <ControlSlider
                label="层数"
                value={ layers }
                min={ 1 }
                max={ 3 }
                step={ 1 }
                onChange={ v => setLayers(v) }
              />
              <ControlSlider
                label="X 偏移"
                value={ offsetX }
                min={ 0 }
                max={ 20 }
                step={ 1 }
                unit="px"
                onChange={ v => setOffsetX(v) }
              />
              <ControlSlider
                label="Y 偏移"
                value={ offsetY }
                min={ 0 }
                max={ 20 }
                step={ 1 }
                unit="px"
                onChange={ v => setOffsetY(v) }
              />
              <ControlSlider
                label="缩放差"
                value={ scaleStep }
                min={ 0 }
                max={ 0.08 }
                step={ 0.01 }
                onChange={ v => setScaleStep(v) }
              />
              <ControlSlider
                label="透明度差"
                value={ opacityStep }
                min={ 0 }
                max={ 0.2 }
                step={ 0.01 }
                onChange={ v => setOpacityStep(v) }
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <StackedCards
            layers={ 2 }
            offsetX={ 6 }
            offsetY={ 12 }
            className="h-44 w-full"
            topLayerClassName="bg-background"
            contentClassName="p-5"
          >
            <div className="space-y-3">
              <div className="text-xs text-textSecondary">Quick View</div>
              <div className="text-base font-semibold text-textPrimary">
                Weekly Insights
              </div>
              <p className="text-sm text-textSecondary">
                5 updates · 2 pending approvals
              </p>
            </div>
          </StackedCards>

          <StackedCards
            layers={ 3 }
            offsetX={ 12 }
            offsetY={ 6 }
            scaleStep={ 0.02 }
            opacityStep={ 0.06 }
            className="h-44 w-full"
            topLayerClassName="bg-background"
            contentClassName="p-5"
          >
            <div className="space-y-3">
              <div className="text-xs text-textSecondary">Focus</div>
              <div className="text-base font-semibold text-textPrimary">
                Release Checklist
              </div>
              <p className="text-sm text-textSecondary">
                3 items remaining · ETA 2h
              </p>
            </div>
          </StackedCards>
        </div>
      </div>
    </main>
  )
}

function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-textSecondary">{ label }</span>
        <span className="text-sm font-mono text-textTertiary tabular-nums">
          { value.toFixed(step < 1
            ? 2
            : 0) }
          { unit ?? '' }
        </span>
      </div>
      <Slider
        value={ value }
        min={ min }
        max={ max }
        step={ step }
        onChange={ v => onChange(v as number) }
      />
    </div>
  )
}
