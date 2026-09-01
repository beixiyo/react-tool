import { useEffect, useState } from 'react'
import { Button } from '../Button'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { Slider } from '../Slider'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'
import { GLOW_OPACITY_TRACK } from './constants'
import type { BottomGlowPosition } from './index'
import {
  BottomGlow,
  buildGlowBase,
  DESIGN_LIGHT,
  DESIGN_LIGHT_FILL,
  GLOW_FRAME,
  GLOW_LAYERS,
  GlowField,
} from './index'

/** 录音页设计稿的正文栏与椭圆尺寸，单位均为 px */
const RECORDING_WIDTH = 720
const RECORDING_ELLIPSE_HEIGHT = 60
const RECORDING_ELLIPSE_SINK = 20
const RECORDING_LAYER_BLUR = 20
const RECORDING_BLUR_HEADROOM = 3

/**
 * 光效容器需要容纳露出的 40px 椭圆弧，以及向上的 3σ 模糊尾部
 *
 * 椭圆本身仍严格保持设计稿的 720×60px，容器高度不是椭圆高度
 */
const RECORDING_FRAME_HEIGHT = RECORDING_ELLIPSE_HEIGHT - RECORDING_ELLIPSE_SINK
  + RECORDING_BLUR_HEADROOM * RECORDING_LAYER_BLUR
const RECORDING_ASPECT = RECORDING_FRAME_HEIGHT / RECORDING_WIDTH

/** 把录音设计稿 px 换到 GlowField 的横向基准坐标 */
const toGlowFrame = (value: number) => value / RECORDING_WIDTH * GLOW_FRAME.width

/**
 * 外层粉色椭圆标定为 720×60px，其余层保留相对粉层的原始几何关系
 *
 * 不能把三层强制成同一个椭圆：原始层组依靠不同的中心、尺寸与模糊，
 * 才能形成粉色 → 浅粉 → 蓝色的纵向色相结构
 */
const RECORDING_PINK_LAYER = GLOW_LAYERS[0]
const recordingPinkRy = toGlowFrame(RECORDING_ELLIPSE_HEIGHT) / 2
const recordingPinkCy = GLOW_FRAME.height + toGlowFrame(RECORDING_ELLIPSE_SINK) - recordingPinkRy
const recordingScaleX = GLOW_FRAME.width / 2 / RECORDING_PINK_LAYER.rx
const recordingScaleY = recordingPinkRy / RECORDING_PINK_LAYER.ry
const recordingBlurScale = toGlowFrame(RECORDING_LAYER_BLUR) / RECORDING_PINK_LAYER.sigma

const RECORDING_GLOW_LAYERS = GLOW_LAYERS.map(layer => ({
  ...layer,
  cx: GLOW_FRAME.width / 2 + (layer.cx - RECORDING_PINK_LAYER.cx) * recordingScaleX,
  cy: recordingPinkCy + (layer.cy - RECORDING_PINK_LAYER.cy) * recordingScaleY,
  rx: layer.rx * recordingScaleX,
  ry: layer.ry * recordingScaleY,
  sigma: layer.sigma * recordingBlurScale,
  track: undefined,
}))

/**
 * GlowField 静止时仍会乘呼吸轨道首帧透明度，这里反向补偿一次，
 * 让最终合成结果保持录音设计稿的 0.19～0.29
 */
const RECORDING_STATIC_FIELD_OPACITY = GLOW_OPACITY_TRACK[0].value
const RECORDING_LEVEL_RESPONSE = {
  minOpacity: 0.19 / RECORDING_STATIC_FIELD_OPACITY,
  maxOpacity: 0.29 / RECORDING_STATIC_FIELD_OPACITY,
  scaleX: 1,
  scaleY: 1,
} as const

/**
 * 中间白色亮条的录音页取值
 *
 * 横向宽度随输入强度伸缩；厚度与离底边继续使用容器宽度比例，
 * 在 720px 宿主上分别约为 4px 与 2px
 */
const RECORDING_LIGHT = {
  minWidth: 0.3234,
  maxWidth: 0.90,
  thickness: 0.0055,
  bottomOffset: 0.0022,
  opacity: DESIGN_LIGHT.opacity,
  halo: { ...DESIGN_LIGHT.halo },
}

type RecordingLight = typeof RECORDING_LIGHT

const RECORDING_LAYER_LABELS: Record<string, string> = {
  pink: '粉色层',
  lightPink: '浅粉层',
  blue: '蓝色层',
}

type RecordingLayerControlPath = 'opacity' | 'widthScale' | 'heightScale' | 'blurScale'

type RecordingLayerStyle = {
  color: string
  visible: boolean
  opacity: number
  widthScale: number
  heightScale: number
  blurScale: number
}

type RecordingLayerStyles = Record<string, RecordingLayerStyle>

const RECORDING_LAYER_CONTROLS: Array<{
  path: RecordingLayerControlPath
  label: string
  min: number
  max: number
  step: number
}> = [
  { path: 'opacity', label: '透明度', min: 0, max: 1, step: 0.01 },
  { path: 'widthScale', label: '宽度', min: 0.25, max: 1.5, step: 0.01 },
  { path: 'heightScale', label: '高度', min: 0.25, max: 2, step: 0.01 },
  { path: 'blurScale', label: '模糊', min: 0, max: 3, step: 0.01 },
]

function createRecordingLayerStyles(): RecordingLayerStyles {
  return Object.fromEntries(RECORDING_GLOW_LAYERS.map(layer => [
    layer.id,
    {
      color: layer.color,
      visible: layer.id === 'pink',
      opacity: layer.opacity ?? 1,
      widthScale: 1,
      heightScale: 1,
      blurScale: 1,
    },
  ]))
}

/** 亮条滑块；`halo` 三项是相对亮条自身厚度的倍率，不是绝对值 */
const LIGHT_CONTROLS: Array<{ path: 'minWidth' | 'maxWidth' | 'thickness' | 'bottomOffset' | 'opacity' | 'blur' | 'shadowBlur' | 'shadowSpread'; label: string; min: number; max: number; step: number; ratio?: boolean; opacity?: boolean; hint: string }> = [
  { path: 'minWidth', label: '亮条宽度·静音', min: 0, max: 1, step: 0.01, hint: '占容器宽的比例' },
  { path: 'maxWidth', label: '亮条宽度·满音量', min: 0, max: 1, step: 0.01, hint: '与静音值之差就是随说话伸缩的幅度' },
  { path: 'thickness', label: '亮条厚度', min: 0.001, max: 0.05, step: 0.0005, hint: '占容器宽的比例；外发光按倍率自动跟随' },
  { path: 'bottomOffset', label: '离底边距离', min: 0, max: 0.03, step: 0.0005, hint: '中心线抬离容器底边多少，占容器宽的比例' },
  { path: 'opacity', label: '亮条整体亮度', min: 0, max: 1, step: 0.01, opacity: true, hint: '同时影响亮条本体与外发光的可见强度' },
  { path: 'blur', label: '自身模糊 ×厚度', min: 0, max: 3, step: 0.05, ratio: true, hint: '大于 1 会把亮条本体糊掉' },
  { path: 'shadowBlur', label: '外发光扩散 ×厚度', min: 0, max: 6, step: 0.05, ratio: true, hint: '光晕铺多远' },
  { path: 'shadowSpread', label: '外发光外扩 ×厚度', min: 0, max: 4, step: 0.05, ratio: true, hint: '光晕的实心部分' },
]

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
  const [glowScale, setGlowScale] = useState(1)
  const [blurScale, setBlurScale] = useState(1)
  const [lightThickness, setLightThickness] = useState(0.02)
  const [aspect, setAspect] = useState(RECORDING_ASPECT)
  const [light, setLight] = useState<RecordingLight>(RECORDING_LIGHT)
  const [recordingLayerStyles, setRecordingLayerStyles] = useState(createRecordingLayerStyles)
  const [additiveLight, setAdditiveLight] = useState(true)
  const recordingLayers = RECORDING_GLOW_LAYERS
    .filter(layer => recordingLayerStyles[layer.id]?.visible !== false)
    .map((layer) => {
      const layerStyle = recordingLayerStyles[layer.id]
      const heightScale = layerStyle?.heightScale ?? 1

      return {
        ...layer,
        color: layerStyle?.color ?? layer.color,
        opacity: layerStyle?.opacity ?? layer.opacity ?? 1,
        rx: layer.rx * (layerStyle?.widthScale ?? 1),
        cy: GLOW_FRAME.height - (GLOW_FRAME.height - layer.cy) * heightScale,
        ry: layer.ry * heightScale,
        sigma: layer.sigma * (layerStyle?.blurScale ?? 1),
      }
    })
  const setRecordingLayerField = (id: string, path: RecordingLayerControlPath) => (value: number) => {
    setRecordingLayerStyles(prev => ({
      ...prev,
      [id]: { ...prev[id], [path]: value },
    }))
  }
  const isHaloPath = (path: typeof LIGHT_CONTROLS[number]['path']) => path === 'blur' || path === 'shadowBlur' || path === 'shadowSpread'
  const readLight = (path: typeof LIGHT_CONTROLS[number]['path']) => (isHaloPath(path)
    ? light.halo[path]
    : light[path])
  const setLightField = (path: typeof LIGHT_CONTROLS[number]['path']) => (value: number) => setLight(prev => (
    isHaloPath(path)
      ? { ...prev, halo: { ...prev.halo, [path]: value } }
      : { ...prev, [path]: value }
  ))
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

        <Card title="胶囊形态（AskFlowtica 输入框 / 语音输入法浮层）" padding="xl">
          <p className="mb-5 text-sm text-text2">
            用默认的 CAPSULE_GLOW_LAYERS 渲染 —— 40px 高的胶囊塞不下设计稿那道 180px 的弧，
            所以只有这一处的**几何**是单独标定的；亮条配方（渐变收尾、加色混合、无 box-shadow）与录音页共用同一份默认值。
            下面的「外部音量 / 录音中 / 白色亮条」是<b>全页共用</b>的驱动；呼吸循环只用于通用组件形态，录音页按设计稿保持静态几何；
            「光场缩放 / 模糊倍率 / 亮条厚度 / 光效位置」只作用于本卡
          </p>

          <div className="flex flex-col gap-8">
            <div className="rounded-3xl bg-brand p-8 sm:p-12">
              <BottomGlow
                level={ level }
                active={ active }
                glowScale={ glowScale }
                blurScale={ blurScale }
                lightThickness={ lightThickness }
                breathing={ breathing }
                showLight={ showLight }
                position={ position }
                contentClassName="text-[clamp(1rem,10cqw,2rem)] font-medium tracking-wide text-black/55"
                contentStyle={ { letterSpacing: '0.04em' } }
                className="mx-auto max-w-md aspect-[3.28/1] rounded-full bg-white shadow-lg"
              >
                Listening...
              </BottomGlow>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">光场缩放（仅本卡）</span>
                <span className="text-text2 tabular-nums">{ Math.round(glowScale * 100) }%</span>
              </div>
              <Slider ariaLabel="光场缩放" min={ 0.3 } max={ 2 } step={ 0.01 } value={ glowScale } onChange={ (value) => setGlowScale(value) } />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">模糊倍率（仅本卡）</span>
                <span className="text-text2 tabular-nums">{ blurScale.toFixed(2) }×</span>
              </div>
              <Slider ariaLabel="模糊倍率" min={ 0.1 } max={ 2 } step={ 0.01 } value={ blurScale } onChange={ (value) => setBlurScale(value) } />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">亮条厚度（仅本卡）</span>
                <span className="text-text2 tabular-nums">{ (lightThickness * 100).toFixed(2) }% 容器宽</span>
              </div>
              <Slider ariaLabel="亮条厚度" min={ 0 } max={ 0.06 } step={ 0.001 } value={ lightThickness } onChange={ (value) => setLightThickness(value) } />
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


        <Card title="输入框形态（AskFlowtica / 新建卡片）" padding="xl">
          <p className="mb-5 text-sm text-text2">
            复刻 ChatInput 的宿主结构：光效层是容器的最后一个子节点、`absolute inset-0`，
            所以必须沉到 <b>-z-10</b> 才会落在「容器底色之上、文字与按钮之下」那一档；
            而负 z 只在层叠上下文内生效，容器因此需要 <b>isolate</b>。
            两者缺一：只给 -z-10 光效会穿到底色后面整个消失，只给 z-0 则 baseColor
            那层不透明底衬会把 ✕ / ✓ 整片盖掉。这一格就是用来盯住这个组合的
          </p>

          <div className="relative isolate mx-auto max-w-md overflow-hidden rounded-2xl border border-border bg-background p-4">
            <p className="text-sm text-text3">Click to input text, long press fn for voice input</p>

            <div className="mt-6 flex items-center justify-between">
              <Button size="sm" variant="ghost">✕</Button>
              <span className="text-sm text-text3">Listening...</span>
              <Button size="sm" variant="ghost">✓</Button>
            </div>

            <BottomGlow
              level={ level }
              active={ active }
              breathing={ breathing }
              showLight={ showLight }
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 size-full rounded-2xl"
              baseColor="rgb(var(--background))"
            />
          </div>
        </Card>

        <Card title="录音页尺寸（720px 宽）" padding="xl">
          <p className="mb-5 text-sm text-text2">
            按设计稿正文栏的真实宽度渲染。外层粉色基准形状是 720×60px 扁椭圆，
            浅粉与蓝色保留原始层组相对它的尺寸、纵向偏移和模糊比例；粉色层向下沉入 20px，
            自身曲率直接形成两端由尖到圆的过渡。光效容器额外保留向上的 3σ 模糊空间，因此默认高度为 100px
          </p>

          <div className="mb-6 overflow-x-auto">
            <div className="relative mx-auto bg-white" style={ { width: RECORDING_WIDTH } }>
              <BottomGlow
                level={ level }
                active={ active }
                breathing={ false }
                showLight={ showLight }
                layers={ recordingLayers }
                minLightWidth={ light.minWidth }
                maxLightWidth={ light.maxWidth }
                lightThickness={ light.thickness }
                lightBottomOffset={ light.bottomOffset }
                lightHalo={ light.halo }
                lightShape="bar"
                lightColor={ DESIGN_LIGHT_FILL }
                minLightOpacity={ light.opacity }
                maxLightOpacity={ light.opacity }
                lightBlendMode={ additiveLight
                  ? 'plus-lighter'
                  : 'normal' }
                levelResponse={ RECORDING_LEVEL_RESPONSE }
                className="w-full"
                style={ {
                  aspectRatio: `${1 / aspect}`,
                  /** 不透明底衬，`plus-lighter` 必须有它才有提亮效果 */
                  background: additiveLight
                    ? buildGlowBase('#fff')
                    : undefined,
                } }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">光效容器高度</span>
              <span className="text-text2 tabular-nums">
                { (aspect * 100).toFixed(1) }% ｜ { (aspect * RECORDING_WIDTH).toFixed(0) }px
              </span>
            </div>
            <Slider
              ariaLabel="光效容器高度"
              min={ 0.05 }
              max={ 0.6 }
              step={ 0.002 }
              value={ aspect }
              onChange={ setAspect }
            />
            <span className="text-xs text-text2">
              只控制可见画布与模糊余量，不拉伸椭圆；设计稿基准为 { RECORDING_FRAME_HEIGHT }px
            </span>
          </div>

          <div className="mt-8 mb-4 flex items-center gap-3">
            <span className="text-sm font-medium">中间白色亮条</span>
            <span className="text-xs text-text2">宽度随音量伸缩，是「光在跟着说话动」的主要来源</span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            { LIGHT_CONTROLS.map(control => (
              <div key={ control.path } className="grid gap-2">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{ control.label }</span>
                  <span className="text-text2 tabular-nums">
                    { control.ratio
                      ? `${readLight(control.path).toFixed(2)}× ｜ ${(readLight(control.path) * light.thickness * RECORDING_WIDTH).toFixed(1)}px`
                      : control.opacity
                        ? `${(readLight(control.path) * 100).toFixed(0)}%`
                        : `${(readLight(control.path) * 100).toFixed(2)}% ｜ ${Math.round(readLight(control.path) * RECORDING_WIDTH)}px` }
                  </span>
                </div>
                <Slider
                  ariaLabel={ control.label }
                  min={ control.min }
                  max={ control.max }
                  step={ control.step }
                  value={ readLight(control.path) }
                  onChange={ setLightField(control.path) }
                />
                <span className="text-xs text-text2">{ control.hint }</span>
              </div>
            )) }
          </div>

          <div className="mt-8 mb-4 flex items-center gap-3">
            <span className="text-sm font-medium">光场颜色层</span>
            <span className="text-xs text-text2">每层可独立调整；宽高与模糊按当前层基准值的倍率计算</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            { RECORDING_GLOW_LAYERS.map((layer) => {
              const layerStyle = recordingLayerStyles[layer.id]
              const label = RECORDING_LAYER_LABELS[layer.id] ?? layer.id

              return (
                <div key={ layer.id } className="flex min-w-0 flex-col rounded-xl border border-border">
                  <div className="flex items-center justify-between gap-3 p-3">
                    <label className="flex min-w-0 items-center gap-3 text-sm">
                      <input
                        type="color"
                        aria-label={ `${label}颜色` }
                        value={ layerStyle.color }
                        onChange={ event => setRecordingLayerStyles(prev => ({
                          ...prev,
                          [layer.id]: { ...prev[layer.id], color: event.target.value },
                        })) }
                        className="size-9 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-1"
                      />
                      <span className="min-w-0">
                        <span className="block font-medium">{ label }</span>
                        <span className="block truncate font-mono text-xs text-text2">{ layerStyle.color.toUpperCase() }</span>
                      </span>
                    </label>
                    <Switch
                      checked={ layerStyle.visible }
                      ariaLabel={ `切换${label}` }
                      onChange={ visible => setRecordingLayerStyles(prev => ({
                        ...prev,
                        [layer.id]: { ...prev[layer.id], visible },
                      })) }
                    />
                  </div>

                  <div className="grid gap-4 border-t border-border p-3">
                    { RECORDING_LAYER_CONTROLS.map((control) => {
                      const value = layerStyle[control.path]
                      const pixelValue = control.path === 'widthScale'
                        ? (layer.rx * 2 / GLOW_FRAME.width) * RECORDING_WIDTH * value
                        : control.path === 'heightScale'
                          ? (layer.ry * 2 / GLOW_FRAME.width) * RECORDING_WIDTH * value
                          : control.path === 'blurScale'
                            ? (layer.sigma / GLOW_FRAME.width) * RECORDING_WIDTH * value
                            : undefined

                      return (
                        <div key={ control.path } className="grid gap-2">
                          <div className="flex items-baseline justify-between gap-2 text-xs">
                            <span className="font-medium">{ control.label }</span>
                            <span className="whitespace-nowrap text-text2 tabular-nums">
                              { Math.round(value * 100) }%
                              { pixelValue === undefined
                                ? ''
                                : ` ｜ ${pixelValue.toFixed(1)}px` }
                            </span>
                          </div>
                          <Slider
                            ariaLabel={ `${label}${control.label}` }
                            min={ control.min }
                            max={ control.max }
                            step={ control.step }
                            value={ value }
                            onChange={ setRecordingLayerField(layer.id, control.path) }
                          />
                        </div>
                      )
                    }) }
                  </div>
                </div>
              )
            }) }
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Switch
              checked={ additiveLight }
              label="亮条加色混合"
              ariaLabel="切换亮条 plus-lighter 混合"
              onChange={ setAdditiveLight }
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              onClick={ () => {
                setAspect(RECORDING_ASPECT)
                setLight(RECORDING_LIGHT)
                setRecordingLayerStyles(createRecordingLayerStyles())
                setAdditiveLight(true)
              } }
            >
              还原设计稿值
            </Button>
            <span className="text-xs text-text2 tabular-nums">
              外层椭圆 { RECORDING_WIDTH }×{ RECORDING_ELLIPSE_HEIGHT }px
              ｜ 下沉 { RECORDING_ELLIPSE_SINK }px
              ｜ 模糊 σ { RECORDING_LAYER_BLUR }px
              ｜ 容器 { RECORDING_WIDTH }×{ RECORDING_FRAME_HEIGHT }px
            </span>
          </div>

        </Card>

        <Card title="设计原比例 402:288" padding="xl">
          <p className="mb-5 text-sm text-text2">
            胶囊是 3.28:1，会把设计稿 288 单位的垂直色相压扁约 2.4 倍。这里按设计稿原比例渲染， 自上而下应依次读到 粉 #EB92E3 → 浅粉 #FCDEFA → 蓝 #5F7EE9。
            右侧多出的白色亮条是本组件自己的元素，Android 侧没有，它正好压在蓝层核心上。
            这两块固定用参考尺寸下的模糊与满高，不跟上面的滑块走——否则「与设计稿对齐」这件事就没了基准
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
                glowScale={ 1 }
                layers={ GLOW_LAYERS }
                contentClassName="text-[clamp(1rem,10cqw,2rem)] font-medium tracking-wide text-black/55"
                className="aspect-402/288 w-full rounded-2xl bg-white"
              >
                Listening...
              </BottomGlow>
            </div>
          </div>
        </Card>

        <p className="text-sm text-text2">
          下面两块和胶囊长得一样是对的：它们不调样式，只验证组件边界会把越界的 level 夹回 0-1。
          左边传 -1 应当与静音完全一致，右边传 2 应当与满音量完全一致
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card title="越界输入夹取 · level = -1">
            <div className="rounded-2xl bg-brand p-6">
              <BottomGlow level={ -1 } contentClassName="text-[clamp(1rem,10cqw,2rem)] font-medium tracking-wide text-black/55" className="mx-auto max-w-72 aspect-[3.28/1] rounded-full bg-white">
                Idle
              </BottomGlow>
            </div>
          </Card>

          <Card title="越界输入夹取 · level = 2">
            <div className="rounded-2xl bg-brand p-6">
              <BottomGlow level={ 2 } contentClassName="text-[clamp(1rem,10cqw,2rem)] font-medium tracking-wide text-black/55" className="mx-auto max-w-72 aspect-[3.28/1] rounded-full bg-white">
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
