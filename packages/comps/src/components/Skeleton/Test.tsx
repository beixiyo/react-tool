import { useState } from 'react'
import type { Rounded } from '../../types'
import { Button } from '../Button'
import { Card } from '../Card'
import { Slider } from '../Slider'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'
import { Skeleton, SkeletonCard } from '.'

const RADIUS_OPTIONS = [
  { value: 'auto' as const, label: 'auto·0.25em' },
  { value: 'full' as const, label: 'full·胶囊' },
  { value: 'none' as const, label: 'none·直角' },
  { value: 'md' as const, label: 'md·6px' },
  { value: 4, label: '数值 4px' },
]

function SkeletonDemo() {
  const [active, setActive] = useState(true)
  const [rounded, setRounded] = useState<Rounded | number | 'auto'>('auto')
  const [duration, setDuration] = useState(1)
  const skeletonProps = { active, rounded, animationDuration: duration }

  return (
    <div className="min-h-screen bg-background p-8 text-text">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">骨架屏组件演示</h1>
          <ThemeToggle />
        </header>

        <Card title="动画与圆角">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-6">
              <Switch label="启用扫光动画" checked={ active } onChange={ setActive } />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-text2">圆角：</span>
                { RADIUS_OPTIONS.map(({ value, label }) => (
                  <Button
                    key={ label }
                    aria-pressed={ rounded === value }
                    className={ rounded === value
                      ? 'bg-systemBlue/10 text-systemBlue'
                      : undefined }
                    onClick={ () => {
                      setRounded(value)
                    } }
                  >
                    { label }
                  </Button>
                )) }
              </div>
              <Button
                onClick={ () => {
                  setActive(true)
                  setRounded('auto')
                  setDuration(1)
                } }
              >
                重置
              </Button>
            </div>
            <p id="skeleton-duration" className="text-text2">动画时长：{ duration.toFixed(1) } 秒</p>
            <Slider
              aria-labelledby="skeleton-duration"
              min={ 0.5 }
              max={ 3 }
              step={ 0.5 }
              value={ duration }
              onChange={ setDuration }
            />
            <Skeleton { ...skeletonProps } />
          </div>
        </Card>

        <Card title="跟随字号的自适应排版">
          <div className="space-y-6">
            <h1 className="space-y-2 text-4xl font-bold">
              标题 h1
              <Skeleton { ...skeletonProps } />
            </h1>
            <h3 className="space-y-2 text-xl font-medium">
              小标题 h3
              <Skeleton { ...skeletonProps } />
            </h3>
            <div className="space-y-2 text-base">
              <p>段落正文 p</p>
              <Skeleton { ...skeletonProps } />
            </div>
            <p className="text-sm text-text2">
              骨架默认继承所在上下文的字号，此处用等价排版的 div 承载段落骨架，避免 div 嵌入 p
            </p>
          </div>
        </Card>

        <Card title="段落行数与小数宽度">
          <div className="space-y-4">
            <p className="text-text2">count=1（默认单行）</p>
            <Skeleton { ...skeletonProps } />
            <p className="text-text2">count=3.5（三行 + 半宽行）</p>
            <Skeleton { ...skeletonProps } count={ 3.5 } />
            <p className="text-text2">count=0（空状态，无骨架行）</p>
            <Skeleton { ...skeletonProps } count={ 0 } />
          </div>
        </Card>

        <Card title="原有预设尺寸与数字尺寸">
          <div className="space-y-4">
            { (['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <div key={ size } className="space-y-2">
                <p className="text-sm text-text2">size={ size }</p>
                <Skeleton { ...skeletonProps } size={ size } />
              </div>
            )) }
            <p className="text-sm text-text2">size=full（填满固定尺寸容器）</p>
            <div className="h-16 w-full">
              <Skeleton { ...skeletonProps } size="full" />
            </div>
            <p className="text-sm text-text2">size=24（高 24px，宽 96px）</p>
            <Skeleton { ...skeletonProps } size={ 24 } />
            <p className="text-sm text-text2">style 自定义宽高（32px × 75%）</p>
            <Skeleton { ...skeletonProps } style={ { height: 32, width: '75%' } } />
            <p className="text-sm text-text2">className 工具类直接覆盖默认值（h-4 w-24 rounded-lg）</p>
            <Skeleton { ...skeletonProps } className="h-4 w-24 rounded-lg" />
          </div>
        </Card>

        <Card title="圆角与主题颜色">
          <div className="space-y-4">
            <p className="text-sm text-text2">auto（0.25em，随字号缩放）与 full（胶囊）、none（直角）对比</p>
            <div className="flex gap-4">
              <Skeleton active={ active } animationDuration={ duration } size="lg" />
              <Skeleton active={ active } animationDuration={ duration } size="lg" rounded="full" />
              <Skeleton active={ active } animationDuration={ duration } size="lg" rounded="none" />
            </div>
            <Skeleton
              { ...skeletonProps }
              baseColor="rgb(var(--systemBlue) / 0.15)"
              highlightColor="rgb(var(--systemBlue) / 0.4)"
            />
          </div>
        </Card>

        <Card title="保持原有布局的 SkeletonCard">
          <div className="grid gap-4 md:grid-cols-2">
            <SkeletonCard titleWidth="w-3/4" contentLines={ 3 } tagCount={ 2 } />
            <SkeletonCard titleWidth="w-2/3" contentLines={ 2 } tagCount={ 1 } delay={ 0.1 } />
            <SkeletonCard showContent={ false } titleWidth="w-4/5" tagCount={ 3 } delay={ 0.2 } />
            <SkeletonCard showTitle={ false } contentLines={ 1 } showTags={ false } />
          </div>
        </Card>
      </div>
    </div>
  )
}

export default SkeletonDemo
