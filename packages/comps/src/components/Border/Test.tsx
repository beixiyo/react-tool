'use client'

import { useState } from 'react'
import { Border } from '.'
import { Badge } from '../Badge'
import { Card } from '../Card'
import { Input } from '../Input'
import { Separator } from '../Separator'
import { Slider } from '../Slider'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'

export default function BorderDemoPage() {
  const [dashLength, setDashLength] = useState(10)
  const [dashGap, setDashGap] = useState(12)
  const [strokeColor, setStrokeColor] = useState('#bbbbbb')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [animated, setAnimated] = useState(true)
  const [borderRadius, setBorderRadius] = useState(20)

  return (
    <Card
      className="min-h-screen rounded-none border-0 shadow-none"
      variant="default"
      padding="lg"
      title="SVG 虚线边框演示"
      headerActions={ <ThemeToggle /> }
      bodyClassName="space-y-8"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card
          title="控制面板"
          variant="glass"
          padding="lg"
          shadow="md"
        >
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary">虚线长度</Badge>
                <Badge>
                  { dashLength }
                  px
                </Badge>
              </div>
              <Slider
                className="w-full"
                min={ 1 }
                max={ 50 }
                step={ 1 }
                value={ dashLength }
                onChange={ setDashLength }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary">虚线间距</Badge>
                <Badge>
                  { dashGap }
                  px
                </Badge>
              </div>
              <Slider
                className="w-full"
                min={ 1 }
                max={ 50 }
                step={ 1 }
                value={ dashGap }
                onChange={ setDashGap }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary">边框宽度</Badge>
                <Badge>
                  { strokeWidth }
                  px
                </Badge>
              </div>
              <Slider
                className="w-full"
                min={ 1 }
                max={ 20 }
                step={ 1 }
                value={ strokeWidth }
                onChange={ setStrokeWidth }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary">圆角</Badge>
                <Badge>
                  { borderRadius }
                  px
                </Badge>
              </div>
              <Slider
                className="w-full"
                min={ 0 }
                max={ 50 }
                step={ 1 }
                value={ borderRadius }
                onChange={ setBorderRadius }
              />
            </div>

            <Input
              type="color"
              label="边框颜色"
              value={ strokeColor }
              containerClassName="w-full max-w-full"
              onChange={ v => setStrokeColor(v) }
              suffix={ (
                <Badge variant="outline" className="shrink-0 font-mono text-xs">
                  { strokeColor }
                </Badge>
              ) }
            />

            <Switch
              checked={ animated }
              onChange={ setAnimated }
              label="启用流动动画"
            />
          </div>
        </Card>

        <Card
          title="预览"
          padding="default"
          className="min-h-96"
          bodyClassName="h-full min-h-80"
        >
          <Border
            dashLength={ dashLength }
            dashGap={ dashGap }
            strokeColor={ strokeColor }
            strokeWidth={ strokeWidth }
            animated={ animated }
            borderRadius={ borderRadius }
            className="h-full min-h-72"
          >
            <Card
              variant="transparent"
              bordered={ false }
              shadow="none"
              hoverEffect={ false }
              padding="lg"
              className="h-full border-0 bg-background2/40"
              title="自定义内容区域"
              bodyClassName="flex flex-col items-center gap-4 text-center"
            >
              <Badge variant="outline">
                { dashLength }
                px 虚线 ·
                { dashGap }
                px 间距
              </Badge>
              <Separator orientation="horizontal" decorative className="w-full max-w-xs bg-border" />
              <Badge variant="secondary">边框随容器尺寸更新</Badge>
              <Badge variant="secondary">可放置任意子内容</Badge>
            </Card>
          </Border>
        </Card>
      </div>
    </Card>
  )
}
