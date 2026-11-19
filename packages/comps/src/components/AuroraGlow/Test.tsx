'use client'

import { useState } from 'react'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Card } from '../Card'
import { Slider } from '../Slider'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'
import { AuroraGlow } from '.'
import type { AuroraGlowProps } from './types'

/** 演示用配色方案（颜色本身是演示主体） */
const COLOR_PRESETS: { name: string; colors: string[] }[] = [
  { name: '默认柔光', colors: ['#fecdd3', '#ddd6fe', '#bae6fd', '#fbcfe8'] },
  { name: '霓虹', colors: ['#22d3ee', '#a855f7', '#f43f5e', '#facc15'] },
  { name: '暖橙色标', colors: ['rgb(255,161,19) 10%', 'rgb(255,94,58) 50%', 'rgb(255,45,85) 90%'] },
]

const GRADIENTS: NonNullable<AuroraGlowProps['gradient']>[] = ['linear', 'conic']

export default function AuroraGlowTest() {
  const [gradient, setGradient] = useState<NonNullable<AuroraGlowProps['gradient']>>('conic')
  const [presetIndex, setPresetIndex] = useState(0)
  const [spread, setSpread] = useState(4)
  const [blur, setBlur] = useState(18)
  const [intensity, setIntensity] = useState(0.8)
  const [durationMs, setDurationMs] = useState(3000)
  const [angle, setAngle] = useState(90)
  const [animated, setAnimated] = useState(true)
  const [bloom, setBloom] = useState(true)

  const colors = COLOR_PRESETS[presetIndex]!.colors

  return (
    <Card
      className="min-h-screen rounded-none border-0 shadow-none"
      padding="lg"
      title="AuroraGlow 辉光容器"
      headerActions={ <ThemeToggle /> }
      bodyClassName="space-y-8"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
        <Card title="控制面板" variant="glass" padding="lg" shadow="md">
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <Badge variant="secondary">渐变形态 gradient</Badge>
              <div className="flex gap-2">
                { GRADIENTS.map((item) => (
                  <Button
                    key={ item }
                    size="sm"
                    variant={ gradient === item
                      ? 'primary'
                      : 'default' }
                    onClick={ () => setGradient(item) }
                  >
                    { item }
                  </Button>
                )) }
              </div>
            </div>

            <div className="space-y-2">
              <Badge variant="secondary">配色 colors</Badge>
              <div className="flex flex-wrap gap-2">
                { COLOR_PRESETS.map((preset, index) => (
                  <Button
                    key={ preset.name }
                    size="sm"
                    variant={ presetIndex === index
                      ? 'primary'
                      : 'default' }
                    onClick={ () => setPresetIndex(index) }
                  >
                    { preset.name }
                  </Button>
                )) }
              </div>
            </div>

            <RangeField label="扩散 spread" unit="px" min={ 0 } max={ 24 } step={ 1 } value={ spread } onChange={ setSpread } />
            <RangeField label="模糊 blur" unit="px" min={ 0 } max={ 48 } step={ 1 } value={ blur } onChange={ setBlur } />
            <RangeField label="不透明度 intensity" min={ 0 } max={ 1 } step={ 0.05 } value={ intensity } onChange={ setIntensity } />
            { gradient === 'conic'
              ? <RangeField label="一圈时长 durationMs" unit="ms" min={ 500 } max={ 8000 } step={ 100 } value={ durationMs } onChange={ setDurationMs } />
              : <RangeField label="角度 angle" unit="deg" min={ 0 } max={ 360 } step={ 5 } value={ angle } onChange={ setAngle } /> }

            <div className="flex flex-wrap gap-6">
              <Switch
                checked={ animated }
                onChange={ setAnimated }
                disabled={ gradient === 'linear' }
                label="自动旋转（仅 conic）"
              />
              <Switch checked={ bloom } onChange={ setBloom } label="内侧柔光 bloom" />
            </div>
          </div>
        </Card>

        <Card title="预览" variant="glass" padding="lg" shadow="md" bodyClassName="flex min-h-80 flex-col items-center justify-center gap-10">
          <AuroraGlow
            gradient={ gradient }
            colors={ colors }
            spread={ spread }
            blur={ blur }
            intensity={ intensity }
            durationMs={ durationMs }
            angle={ angle }
            animated={ animated }
            bloom={ bloom }
          >
            <Button variant="default" rounded="full" className="px-6">+ Ask Anything</Button>
          </AuroraGlow>

          <AuroraGlow
            gradient={ gradient }
            colors={ colors }
            spread={ spread }
            blur={ blur }
            intensity={ intensity }
            durationMs={ durationMs }
            angle={ angle }
            animated={ animated }
            bloom={ bloom }
            radius={ 16 }
          >
            <div className="bg-background text-text2 rounded-2xl px-6 py-4 text-sm">
              radius=16 的卡片形态
            </div>
          </AuroraGlow>
        </Card>
      </div>
    </Card>
  )
}

function RangeField({ label, unit = '', ...rest }: RangeFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Badge variant="secondary">{ label }</Badge>
        <Badge>{ `${rest.value}${unit}` }</Badge>
      </div>
      <Slider className="w-full" { ...rest } />
    </div>
  )
}

type RangeFieldProps = {
  label: string
  unit?: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
}
