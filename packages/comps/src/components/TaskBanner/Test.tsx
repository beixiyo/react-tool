'use client'

import { LANGUAGES } from 'i18n'
import { useLanguage } from 'i18n/react'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../Button'
import type { StackedCardsVariant } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { GradientText } from '../GradientText'
import { Slider } from '../Slider'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'
import type { TaskBannerConfig, TaskBannerPlacement } from '.'
import { TASK_BANNER_DEFAULT_STACKED_CARDS, TaskBanner } from '.'

/** Digest 同款渐变 loading 配色（首尾同色，无缝转圈） */
const GRADIENT_COLORS = ['#ffaa40', '#9c40ff', '#ffaa40']

const PLACEMENTS: TaskBannerPlacement[] = ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right']

/** 渐变 loading 文字（模拟业务的处理中彩条内容） */
function pendingContent(text: string) {
  return (
    <GradientText seamlessLoop colors={ GRADIENT_COLORS } className="text-sm font-medium">
      { text }
    </GradientText>
  )
}

/**
 * 模拟一次异步任务：failTimes 次失败后才成功
 * 重试走 onRetry 递归重发，演示「失败条 → 重试 → 处理中 → 成功」闭环
 */
function simulateTask(text: string, failTimes: number, reason?: string) {
  const task = TaskBanner.start(pendingContent(text))

  setTimeout(() => {
    if (failTimes > 0) {
      task.fail({
        reason: reason && `${reason} · ${text}`,
        onRetry: () => simulateTask(text, failTimes - 1, reason),
        showClose: true,
      })
    }
    else {
      task.succeed()
    }
  }, 1500)
}

function simulateClosableTask(text: string) {
  const task = TaskBanner.start({
    content: pendingContent(text),
    showClose: true,
  })

  setTimeout(() => {
    task.fail({
      reason: `可手动关闭 · ${text}`,
      onRetry: () => simulateClosableTask(text),
    })
  }, 1500)
}

/** 自定义汇总条：只接管内容，进出场动画仍由组件那层 motion.div 负责 */
const customSummary: TaskBannerConfig['renderSummary'] = ({ count, expand }) => (
  <button type="button" onClick={ expand } className="rounded-full bg-text px-4 py-2 text-sm text-background">
    自定义汇总条 · 收起了
    { count }
    { ' 条，点开' }
  </button>
)

/** 自定义面板：retry / close 直接用 ctx 给的，出栈时序不用自己管 */
const customPanel: TaskBannerConfig['renderPanel'] = ({ failures, retry, close, collapse }) => (
  <div className="w-96 overflow-hidden rounded-xl bg-text text-background">
    <button type="button" onClick={ collapse } className="w-full px-4 py-3 text-left text-sm font-medium">
      自定义面板 ·{ failures.length }
      { ' 条，点此收起' }
    </button>

    { failures.map((item) => (
      <div key={ item.id } className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
        <span className="truncate opacity-80">{ item.reason }</span>
        <span className="flex shrink-0 gap-3 font-medium">
          <button type="button" onClick={ () => retry(item) }>
            重试
          </button>
          <button type="button" className="opacity-60" onClick={ () => close(item) }>
            关闭
          </button>
        </span>
      </div>
    )) }
  </div>
)

/** 演示分区：说明只写这一组按钮在验什么，设计动机看组件文档 */
function Section(props: SectionProps) {
  const { title, desc, children } = props

  return (
    <section className="flex flex-col gap-2 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <span className="text-sm font-semibold text-text2">{ title }</span>
      <p className="text-xs leading-relaxed text-text3">{ desc }</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">{ children }</div>
    </section>
  )
}

function TaskBannerExample() {
  const { language, changeLanguage } = useLanguage()

  const animationTasks = useRef<ReturnType<typeof TaskBanner.notify>[]>([])
  useEffect(() => () => animationTasks.current.forEach((task) => task.close()), [])

  const [customStack, setCustomStack] = useState(false)
  const [tightThreshold, setTightThreshold] = useState(false)
  const [looseGap, setLooseGap] = useState(false)
  const [stackCollapseOn, setStackCollapseOn] = useState(false)
  const [showStackCount, setShowStackCount] = useState(true)
  const [collapseVariant, setCollapseVariant] = useState<StackedCardsVariant>(TASK_BANNER_DEFAULT_STACKED_CARDS.variant)
  const [collapseStyle, setCollapseStyle] = useState({
    offsetX: TASK_BANNER_DEFAULT_STACKED_CARDS.offsetX as number,
    offsetY: TASK_BANNER_DEFAULT_STACKED_CARDS.offsetY as number,
    scaleStep: TASK_BANNER_DEFAULT_STACKED_CARDS.scaleStep as number,
    opacityStep: TASK_BANNER_DEFAULT_STACKED_CARDS.opacityStep as number,
  })

  /** 整摞收拢当前生效的配置；关掉时传 undefined 恢复原行为 */
  const applyStackCollapse = (enabled: boolean, variant: StackedCardsVariant, style = collapseStyle, showCount = showStackCount) => {
    TaskBanner.config({
      collapse: enabled
        ? { threshold: 2, showCount, stackedCards: { variant, ...style } }
        : undefined,
    })
  }

  const toggleStackCollapse = (next: boolean) => {
    setStackCollapseOn(next)
    applyStackCollapse(next, collapseVariant)
  }

  const changeCollapseVariant = (next: StackedCardsVariant) => {
    setCollapseVariant(next)
    if (stackCollapseOn) {
      applyStackCollapse(true, next)
    }
  }

  const changeCollapseStyle = (key: keyof typeof collapseStyle, value: number) => {
    const next = { ...collapseStyle, [key]: value }
    setCollapseStyle(next)
    if (stackCollapseOn) {
      applyStackCollapse(true, collapseVariant, next)
    }
  }

  const toggleCustomStack = (next: boolean) => {
    setCustomStack(next)
    TaskBanner.config({
      renderSummary: next
        ? customSummary
        : undefined,
      renderPanel: next
        ? customPanel
        : undefined,
    })
  }

  const toggleThreshold = (next: boolean) => {
    setTightThreshold(next)
    TaskBanner.config({
      maxVisibleFailures: next
        ? 1
        : 3,
    })
  }

  const toggleGap = (next: boolean) => {
    setLooseGap(next)
    TaskBanner.config({
      containerClassName: next
        ? 'gap-8'
        : undefined,
    })
  }

  return (
    <div className="h-full overflow-auto bg-background p-4 text-text">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 py-4">
        <ThemeToggle />

        <Section title="任务生命周期" desc="start 发起处理中彩条；成功即淡出，失败驻留直到重试或关闭；close 由业务静默收走">
          <Button variant="success" onClick={ () => simulateTask('买牛奶，明天提醒我', 0) }>
            成功
          </Button>

          <Button variant="danger" onClick={ () => simulateTask('整理 Q3 复盘要点', 1, '服务器异常') }>
            失败 · 自定义 reason
          </Button>

          <Button variant="danger" onClick={ () => simulateTask('不传 reason 的任务', 1) }>
            失败 · i18n 缺省文案
          </Button>

          <Button variant="warning" onClick={ () => simulateClosableTask('允许手动关闭') }>
            失败 + showClose
          </Button>

          <Button
            onClick={ () => {
              const task = TaskBanner.start(pendingContent('被其他流程接管的任务'))
              setTimeout(() => task.close(), 1500)
            } }
          >
            静默关闭（close）
          </Button>
        </Section>

        <Section title="堆叠与收拢" desc="新条头插（最新在上）；失败超过阈值后更早的收拢为汇总条，点开逐条重试，点头部或 Esc 收起">
          <Button
            onClick={ () =>
              ['A', 'B', 'C', 'D'].forEach((text, i) => {
                setTimeout(() => simulateTask(`任务 ${text} · 顺序提交`, 0), i * 400)
              }) }
          >
            连发 4 条成功
          </Button>

          <Button
            variant="danger"
            onClick={ () => {
              for (let i = 1; i <= 6; i++) {
                simulateTask(`失败任务 #${i}`, 1, '服务器异常')
              }
            } }
          >
            连发 6 条失败（触发收拢）
          </Button>

          <Switch checked={ tightThreshold } onChange={ toggleThreshold } label="收拢阈值 1（默认 3）" />
        </Section>

        <Section
          title="整摞收拢：层叠卡片"
          desc="可见条目数达到阈值（默认 2）即整摞收成层叠卡片，底部露边最多 3 层；点击展开、Esc 或末端按钮收起；顶层彩条的重试 / ✕ 照常可用，与失败收拢独立组合"
        >
          <Switch checked={ stackCollapseOn } onChange={ toggleStackCollapse } label="开启整摞收拢（阈值 2）" />
          <Switch
            checked={ showStackCount }
            label="显示数量徽标"
            onChange={ (next) => {
              setShowStackCount(next)
              if (stackCollapseOn) applyStackCollapse(true, collapseVariant, collapseStyle, next)
            } }
          />

          { (['border', 'shadow', 'background'] as const).map((variant) => (
            <Button
              key={ variant }
              variant={ variant === collapseVariant
                ? 'secondary'
                : 'default' }
              onClick={ () => changeCollapseVariant(variant) }
            >
              { variant }
            </Button>
          )) }

          <div className="grid w-full gap-4 rounded-xl border border-border bg-background2 p-4 sm:grid-cols-2">
            <CollapseStyleSlider
              label="横向偏移"
              value={ collapseStyle.offsetX }
              min={ -12 }
              max={ 12 }
              step={ 1 }
              unit="px"
              onChange={ (value) => changeCollapseStyle('offsetX', value) }
            />
            <CollapseStyleSlider
              label="纵向间距"
              value={ collapseStyle.offsetY }
              min={ 2 }
              max={ 16 }
              step={ 1 }
              unit="px"
              onChange={ (value) => changeCollapseStyle('offsetY', value) }
            />
            <CollapseStyleSlider
              label="逐层向内收拢"
              value={ collapseStyle.scaleStep }
              min={ 0 }
              max={ 0.15 }
              step={ 0.005 }
              onChange={ (value) => changeCollapseStyle('scaleStep', value) }
            />
            <CollapseStyleSlider
              label="每层透明度"
              value={ collapseStyle.opacityStep }
              min={ 0 }
              max={ 0.2 }
              step={ 0.01 }
              onChange={ (value) => changeCollapseStyle('opacityStep', value) }
            />
          </div>

          <p className="w-full text-xs text-text2">
            动画验收：选择定位生成 4 张常驻卡片；聚焦堆叠按 Enter / Space 展开，按 Esc 收起 动画中再次展开或按 Esc 可反向，顶卡应始终贴住锚定边
          </p>
          { PLACEMENTS.map((placement) => (
            <Button
              key={ placement }
              onClick={ () => {
                animationTasks.current.forEach((task) => task.close())
                toggleStackCollapse(true)
                animationTasks.current = [4, 3, 2, 1].map((index) =>
                  TaskBanner.notify({
                    content: `动画卡片 ${index}`,
                    placement,
                    duration: 0,
                    showClose: true,
                    className: 'w-72',
                  })
                )
              } }
            >
              验收 { placement }
            </Button>
          )) }

          <Button
            onClick={ () =>
              ['一', '二', '三', '四'].forEach((text, i) => {
                setTimeout(() => TaskBanner.start({ content: `长一点的驻留任务停留在页面 ${text}`, showClose: true }), i * 400)
              }) }
          >
            连发 4 条驻留任务
          </Button>

          <Button
            variant="danger"
            onClick={ () => {
              for (let i = 1; i <= 4; i++) {
                simulateTask(`失败任务 #${i}`, 1, '服务器异常')
              }
            } }
          >
            连发 4 条失败（与失败收拢叠加）
          </Button>
        </Section>

        <Section title="notify：静态提示条" desc="带操作按钮的一次性提示，默认 5 秒自动消失；duration 传 0 常驻，由业务 close()">
          <Button
            onClick={ () =>
              TaskBanner.notify({
                content: 'Transcription canceled',
                action: { text: '撤销', onClick: () => simulateTask('撤销后重新转写', 0) },
                showIcon: false,
                placement: 'bottom',
                onExpire: () => console.log('撤销窗口已过期'),
              }) }
          >
            提示 + 撤销（5s 自动消失）
          </Button>

          <Button
            onClick={ () => {
              const notice = TaskBanner.notify({
                content: '常驻提示，2s 后由业务关闭',
                duration: 0,
                placement: 'bottom',
              })
              setTimeout(() => notice.close(), 2000)
            } }
          >
            常驻（duration 0 + close）
          </Button>
        </Section>

        <Section title="placement：六个定位" desc="条目级属性，不指定才跟随全局配置；各定位独立堆叠、独立收拢，底部一摞自下而上排">
          { PLACEMENTS.map((placement) => (
            <Button
              key={ placement }
              onClick={ () =>
                TaskBanner.notify({
                  content: placement,
                  action: { text: '知道了', onClick: () => {} },
                  showIcon: false,
                  placement,
                }) }
            >
              { placement }
            </Button>
          )) }

          <Button
            variant="warning"
            onClick={ () => {
              TaskBanner.notify({ content: '底部提示', showIcon: false, placement: 'bottom' })
              simulateTask('顶部照常排队的任务', 1, '服务器异常')
            } }
          >
            底部提示 + 顶部失败条同屏
          </Button>
        </Section>

        <Section title="定制单条：className 与 render" desc="className 三件套只改样式不动结构；render 整条自己画（runAction / close 会先出栈再回调）">
          <Button
            onClick={ () =>
              TaskBanner.notify({
                content: '换了底色与按钮配色',
                action: { text: '撤销', onClick: () => {} },
                showIcon: false,
                placement: 'bottom',
                className: 'bg-systemOrange/15 ring-1 ring-systemOrange/40',
                contentClassName: 'text-left text-systemOrange',
                actionClassName: 'text-systemOrange',
              }) }
          >
            className 三件套
          </Button>

          <Button
            onClick={ () =>
              TaskBanner.notify({
                content: null,
                duration: 0,
                placement: 'bottom',
                action: { onClick: () => simulateTask('自定义渲染触发的任务', 0) },
                render: ({ runAction, close }) => (
                  <div className="flex w-80 items-center justify-between gap-4 rounded-xl bg-text px-4 py-3 text-background">
                    <span className="text-sm">整条自己画</span>
                    <span className="flex gap-3 text-sm font-medium">
                      <button type="button" onClick={ runAction }>
                        撤销
                      </button>
                      <button type="button" className="opacity-60" onClick={ close }>
                        关闭
                      </button>
                    </span>
                  </div>
                ),
              }) }
          >
            render 整条接管（常驻）
          </Button>

          <Button
            variant="danger"
            onClick={ () => {
              const task = TaskBanner.start({
                content: pendingContent('外观由 start 定义'),
                className: 'bg-systemOrange/15',
                actionClassName: 'text-systemOrange',
              })
              setTimeout(() => task.fail({ reason: '失败时不必再抄一遍外观' }), 1200)
            } }
          >
            fail 继承 start 的外观
          </Button>
        </Section>

        <Section title="定制整摞：汇总条 / 面板 / 容器" desc="汇总条与面板是整摞的行为，入口在 TaskBanner.config；render 只接管内容，进出场动画仍由组件负责">
          <Switch checked={ customStack } onChange={ toggleCustomStack } label="自定义汇总条 / 面板" />

          <Button
            variant="danger"
            onClick={ () => {
              for (let i = 1; i <= 6; i++) {
                simulateTask(`看汇总条 #${i}`, 1, '服务器异常')
              }
            } }
          >
            连发 6 条失败看效果
          </Button>

          <Switch checked={ looseGap } onChange={ toggleGap } label="容器间距 gap-8" />
        </Section>

        <Section title={ `i18n（当前：${language}）` } desc="重试 / 缺省失败 / 失败汇总文案内置在 taskBanner 命名空间，挂着失败条时切语言立即跟随">
          <Button onClick={ () => changeLanguage(LANGUAGES.ZH_CN) }>简体中文</Button>
          <Button onClick={ () => changeLanguage(LANGUAGES.ZH_TW) }>繁體中文</Button>
          <Button onClick={ () => changeLanguage(LANGUAGES.EN_US) }>English</Button>
          <Button onClick={ () => changeLanguage(LANGUAGES.JA_JP) }>日本語</Button>
        </Section>
      </div>

      <GithubSourceLink />
    </div>
  )
}

function CollapseStyleSlider(props: CollapseStyleSliderProps) {
  const { label, value, min, max, step, unit, onChange } = props

  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-center justify-between gap-3 text-xs text-text2">
        { label }
        <span className="font-mono text-text3 tabular-nums">
          { value.toFixed(
            step < 1
              ? 3
              : 0,
          ) }
          { unit }
        </span>
      </span>
      <Slider ariaLabel={ label } value={ value } min={ min } max={ max } step={ step } onChange={ (next) => onChange(next as number) } />
    </label>
  )
}

export default TaskBannerExample

type CollapseStyleSliderProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (value: number) => void
}

type SectionProps = {
  /** 分区标题 */
  title: string
  /** 这一组按钮在验什么，写行为，不写设计动机 */
  desc: ReactNode
  /** 本区的操作按钮 */
  children: ReactNode
}
