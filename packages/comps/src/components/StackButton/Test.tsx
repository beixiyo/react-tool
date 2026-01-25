'use client'

import type { StackingToggleConfig, ToggleItem } from './types'
import {
  AudioLines,
  CheckCircle2,
  Heart,
  Lightbulb,
  Settings,
} from 'lucide-react'
import { useState } from 'react'
import {
  Slider,
  StackButton,
  ThemeToggle,
} from '../index'

const fiveItems: ToggleItem[] = [
  { id: 'audio', icon: <AudioLines /> },
  { id: 'check', icon: <CheckCircle2 /> },
  { id: 'idea', icon: <Lightbulb /> },
  { id: 'settings', icon: <Settings /> },
  { id: 'heart', icon: <Heart /> },
]

export default function Page() {
  const [config, setConfig] = useState<StackingToggleConfig>({
    buttonSize: 48,
    overlapMargin: -12,
    activeGap: 4,
    borderRadius: 14,
    springStiffness: 280,
    springDamping: 26,
    springMass: 0.9,
    colorTransitionDuration: 0.35,
  })

  const updateConfig = (key: keyof StackingToggleConfig, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-backgroundSecondary p-6">
      <div className="flex flex-col items-center gap-12 w-full max-w-lg">
        <ThemeToggle />
        <StackButton items={ fiveItems } config={ config } />

        <div className="w-full space-y-6 bg-background rounded-2xl p-6 shadow-sm border border-border">
          <div className="grid gap-5">
            <ConfigSlider
              label="按钮大小"
              value={ config.buttonSize ?? 48 }
              min={ 32 }
              max={ 72 }
              step={ 1 }
              unit="px"
              onChange={ v => updateConfig('buttonSize', v) }
            />

            <ConfigSlider
              label="重叠边距"
              value={ config.overlapMargin ?? -12 }
              min={ -24 }
              max={ 0 }
              step={ 1 }
              unit="px"
              onChange={ v => updateConfig('overlapMargin', v) }
            />

            <ConfigSlider
              label="激活间距"
              value={ config.activeGap ?? 4 }
              min={ 0 }
              max={ 16 }
              step={ 1 }
              unit="px"
              onChange={ v => updateConfig('activeGap', v) }
            />

            <ConfigSlider
              label="圆角半径"
              value={ config.borderRadius ?? 14 }
              min={ 4 }
              max={ 24 }
              step={ 1 }
              unit="px"
              onChange={ v => updateConfig('borderRadius', v) }
            />

            <div className="pt-2 border-t border-borderSecondary">
              <p className="text-xs text-textSecondary">弹簧动画</p>
            </div>

            <ConfigSlider
              label="刚度"
              value={ config.springStiffness ?? 280 }
              min={ 100 }
              max={ 500 }
              step={ 10 }
              onChange={ v => updateConfig('springStiffness', v) }
            />

            <ConfigSlider
              label="阻尼"
              value={ config.springDamping ?? 26 }
              min={ 10 }
              max={ 50 }
              step={ 1 }
              onChange={ v => updateConfig('springDamping', v) }
            />

            <ConfigSlider
              label="质量"
              value={ config.springMass ?? 0.9 }
              min={ 0.1 }
              max={ 2 }
              step={ 0.1 }
              onChange={ v => updateConfig('springMass', v) }
            />

            <ConfigSlider
              label="颜色持续时间"
              value={ config.colorTransitionDuration ?? 0.35 }
              min={ 0.1 }
              max={ 1 }
              step={ 0.05 }
              unit="s"
              onChange={ v => updateConfig('colorTransitionDuration', v) }
            />
          </div>
        </div>
      </div>
    </main>
  )
}

function ConfigSlider({
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
        <label className="text-sm text-textSecondary">{ label }</label>
        <span className="text-sm font-mono text-textTertiary tabular-nums">
          { value.toFixed(step < 1
            ? 1
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
        className="w-full"
      />
    </div>
  )
}
