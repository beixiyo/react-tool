import { useEffect, useState } from 'react'
import { Button } from '../Button'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { Slider } from '../Slider'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'
import type { BottomGlowPosition } from './index'
import {
  BottomGlow,
  buildGlowBase,
  DESIGN_GLOW_COMPONENT,
  DESIGN_LIGHT,
  DESIGN_LIGHT_FILL,
  DESIGN_PINK_SCALE_TRACK,
  GLOW_FRAME,
  GLOW_LAYERS,
  GlowField,
  squeezeLayers,
} from './index'

/** 录音页正文栏的实际宽度（`max-w-4xl`），弧形只认容器宽度，量纲必须一致才有参考价值 */
const RECORDING_WIDTH = 896

/**
 * 录音页当前线上取的纵向压缩系数 = 设计稿宽 ÷ 宿主宽
 *
 * 1 表示照搬设计稿比例（弧顶顶到容器宽的 45%，896 上就是 401px）；
 * 越小弧越扁。线上值让弧顶落回设计稿的绝对高度 180px
 */
const RECORDING_SQUEEZE = DESIGN_GLOW_COMPONENT.width / RECORDING_WIDTH

/** 中间白色亮条的线上取值：纵向量跟着压缩系数走，横向量原样取自设计稿 */
const RECORDING_LIGHT = {
  minWidth: DESIGN_LIGHT.minWidth,
  maxWidth: DESIGN_LIGHT.maxWidth,
  thickness: DESIGN_LIGHT.thickness * RECORDING_SQUEEZE,
  bottomOffset: DESIGN_LIGHT.bottomOffset * RECORDING_SQUEEZE,
  halo: { ...DESIGN_LIGHT.halo },
}

type RecordingLight = typeof RECORDING_LIGHT

/** 与 `RecordingGlowLayer` 同一套推导，改这里等于预演改那边 */
function useRecordingGlow(squeeze: number, fixedMotion: boolean) {
  const layers = squeezeLayers(GLOW_LAYERS, squeeze).map((layer, index) => (
    index === 0 && fixedMotion
      ? { ...layer, track: DESIGN_PINK_SCALE_TRACK }
      : layer
  ))
  /** 两端淡出宽度跟着横向模糊半径走，硬边才会完全落在淡出区内 */
  const fade = (layers[0].sigma / GLOW_FRAME.width) * 200
  return {
    layers,
    /** 各层「弧顶 + 3σ」的最大值，不够的话顶边会被裁成一道横线 */
    aspect: Math.max(...layers.map(layer => (
      (GLOW_FRAME.height - (layer.cy - layer.ry) + 3 * layer.sigma) / GLOW_FRAME.width
    ))),
    fade,
    /** 第一层（粉）的弧顶高出容器底边多少，占容器宽的比例 */
    rise: (GLOW_FRAME.height - (layers[0].cy - layers[0].ry)) / GLOW_FRAME.width,
    mask: `linear-gradient(to right, transparent, #000 ${fade.toFixed(2)}%, #000 ${(100 - fade).toFixed(2)}%, transparent)`,
  }
}

/** 亮条滑块；`halo` 三项是相对亮条自身厚度的倍率，不是绝对值 */
const LIGHT_CONTROLS: Array<{ path: 'minWidth' | 'maxWidth' | 'thickness' | 'bottomOffset' | 'blur' | 'shadowBlur' | 'shadowSpread'; label: string; min: number; max: number; step: number; ratio?: boolean; hint: string }> = [
  { path: 'minWidth', label: '亮条宽度·静音', min: 0, max: 1, step: 0.01, hint: '占容器宽的比例' },
  { path: 'maxWidth', label: '亮条宽度·满音量', min: 0, max: 1, step: 0.01, hint: '与静音值之差就是随说话伸缩的幅度' },
  { path: 'thickness', label: '亮条厚度', min: 0.001, max: 0.05, step: 0.0005, hint: '占容器宽的比例；外发光按倍率自动跟随' },
  { path: 'bottomOffset', label: '离底边距离', min: 0, max: 0.03, step: 0.0005, hint: '中心线抬离容器底边多少，占容器宽的比例' },
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
  const [squeeze, setSqueeze] = useState(RECORDING_SQUEEZE)
  const [light, setLight] = useState<RecordingLight>(RECORDING_LIGHT)
  const [additiveLight, setAdditiveLight] = useState(true)
  const [fixedArcMotion, setFixedArcMotion] = useState(true)
  const recording = useRecordingGlow(squeeze, fixedArcMotion)
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
            下面的「外部音量 / 录音中 / 呼吸循环 / 白色亮条」是<b>全页共用</b>的驱动，录音页那张卡也读它们；
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


        <Card title="录音页尺寸（896px 宽）" padding="xl">
          <p className="mb-5 text-sm text-text2">
            按录音页正文栏的真实宽度渲染，与 RecordingGlowLayer 共用同一套推导。
            椭圆逐值取自设计稿 Figma「iOS 18 - Voice」，本页不再重标形状，
            唯一的形状旋钮是「纵向压缩」——设计稿是 402 宽的手机，同一组比例搬到 896 上弧高会翻倍，
            压缩系数把它按宽度比压回设计稿的绝对高度。其余滑块都在调中间那条白色亮条，
            单位一律是容器宽度的比例
          </p>

          <div className="mb-6 overflow-x-auto">
            <div className="relative bg-white" style={ { width: RECORDING_WIDTH } }>
              <BottomGlow
                level={ level }
                active={ active }
                breathing={ breathing }
                showLight={ showLight }
                layers={ recording.layers }
                minLightWidth={ light.minWidth }
                maxLightWidth={ light.maxWidth }
                lightThickness={ light.thickness }
                lightBottomOffset={ light.bottomOffset }
                lightHalo={ light.halo }
                lightShape="bar"
                lightColor={ DESIGN_LIGHT_FILL }
                minLightOpacity={ DESIGN_LIGHT.opacity }
                maxLightOpacity={ DESIGN_LIGHT.opacity }
                lightBlendMode={ additiveLight
                  ? 'plus-lighter'
                  : 'normal' }
                levelResponse={ fixedArcMotion
                  ? { minOpacity: 1, maxOpacity: 1, scaleX: 1, scaleY: 1 }
                  : undefined }
                className="w-full"
                style={ {
                  aspectRatio: `${1 / recording.aspect}`,
                  /** 不透明底衬，`plus-lighter` 必须有它才有提亮效果 */
                  background: additiveLight
                    ? buildGlowBase('#fff')
                    : undefined,
                  maskImage: recording.mask,
                  WebkitMaskImage: recording.mask,
                } }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">纵向压缩</span>
              <span className="text-text2 tabular-nums">
                { squeeze.toFixed(3) }× ｜ 弧顶 { (recording.rise * RECORDING_WIDTH).toFixed(0) }px
              </span>
            </div>
            <Slider
              ariaLabel="纵向压缩"
              min={ 0.1 }
              max={ 1 }
              step={ 0.005 }
              value={ squeeze }
              onChange={ setSqueeze }
            />
            <span className="text-xs text-text2">
              1 = 照搬设计稿比例；线上值 { RECORDING_SQUEEZE.toFixed(3) } = 402 ÷ { RECORDING_WIDTH }，
              让弧顶落回设计稿的 180px。框高与两端淡出都会自动跟着变
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

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Switch
              checked={ additiveLight }
              label="亮条加色混合"
              ariaLabel="切换亮条 plus-lighter 混合"
              onChange={ setAdditiveLight }
            />
            <Switch
              checked={ fixedArcMotion }
              label="粉层固定动效"
              ariaLabel="切换粉层设计稿固定动效"
              onChange={ setFixedArcMotion }
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              onClick={ () => {
                setSqueeze(RECORDING_SQUEEZE)
                setLight(RECORDING_LIGHT)
                setAdditiveLight(true)
                setFixedArcMotion(true)
              } }
            >
              还原线上值
            </Button>
            <span className="text-xs text-text2 tabular-nums">
              推导结果：框高 { (recording.aspect * RECORDING_WIDTH).toFixed(0) }px
              ｜ 两端淡出 { recording.fade.toFixed(1) }%
              ｜ 模糊 σ { ((recording.layers[0].sigma / GLOW_FRAME.width) * RECORDING_WIDTH).toFixed(0) }px
            </span>
          </div>

          <pre className="mt-4 overflow-x-auto rounded-xl bg-black/5 p-4 text-xs leading-relaxed">
{ `const SQUEEZE = ${squeeze.toFixed(4)}

const LIGHT = {
  minWidth: ${light.minWidth.toFixed(4)},
  maxWidth: ${light.maxWidth.toFixed(4)},
  thickness: ${light.thickness.toFixed(4)},
  bottomOffset: ${light.bottomOffset.toFixed(4)},
  halo: {
    blur: ${light.halo.blur.toFixed(2)},
    shadowBlur: ${light.halo.shadowBlur.toFixed(2)},
    shadowSpread: ${light.halo.shadowSpread.toFixed(2)},
  },
} as const` }
          </pre>
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
