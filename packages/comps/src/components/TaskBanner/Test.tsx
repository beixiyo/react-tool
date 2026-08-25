'use client'

import type { ReactNode } from 'react'
import type { TaskBannerConfig, TaskBannerPlacement } from '.'
import { LANGUAGES } from 'i18n'
import { useLanguage } from 'i18n/react'
import { useState } from 'react'
import { TaskBanner } from '.'
import { Button } from '../Button'
import { GithubSourceLink } from '../GithubSourceLink'
import { GradientText } from '../GradientText'
import { ThemeToggle } from '../ThemeToggle'

/** Digest 同款渐变 loading 配色（首尾同色，无缝转圈） */
const GRADIENT_COLORS = ['#ffaa40', '#9c40ff', '#ffaa40']

const PLACEMENTS: TaskBannerPlacement[] = [
  'top-left',
  'top',
  'top-right',
  'bottom-left',
  'bottom',
  'bottom-right',
]

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
 * reason 不传时走组件库 i18n 的缺省失败文案（taskBanner.failed）
 */
function simulateTask(text: string, failTimes: number, reason?: string) {
  const task = TaskBanner.start(pendingContent(text))

  setTimeout(() => {
    if (failTimes > 0) {
      task.fail({
        reason: reason && `${reason} · ${text}`,
        onRetry: () => simulateTask(text, failTimes - 1, reason),
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
  <button
    type="button"
    onClick={ expand }
    className="rounded-full bg-text px-4 py-2 text-sm text-background"
  >
    自定义汇总条 · 收起了
    { count }
    { ' 条，点开' }
  </button>
)

/** 自定义面板：retry / close 直接用 ctx 给的，出栈时序不用自己管 */
const customPanel: TaskBannerConfig['renderPanel'] = ({ failures, retry, close, collapse }) => (
  <div className="w-96 overflow-hidden rounded-xl bg-text text-background">
    <button
      type="button"
      onClick={ collapse }
      className="w-full px-4 py-3 text-left text-sm font-medium"
    >
      自定义面板 ·
      { failures.length }
      { ' 条，点此收起' }
    </button>

    { failures.map(item => (
      <div key={ item.id } className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
        <span className="truncate opacity-80">{ item.reason }</span>
        <span className="shrink-0 flex gap-3 font-medium">
          <button type="button" onClick={ () => retry(item) }>重试</button>
          <button type="button" className="opacity-60" onClick={ () => close(item) }>关闭</button>
        </span>
      </div>
    )) }
  </div>
)

/**
 * 演示分区
 *
 * 说明就近跟着这一组按钮，而不是攒成一段验证点堆在页尾——
 * 页尾那种写法一多就没人对得上「哪条说明对应哪个按钮」
 */
function Section(props: SectionProps) {
  const { title, desc, children } = props

  return (
    <section className="flex flex-col gap-2 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <span className="text-sm text-text2 font-semibold">{ title }</span>
      <p className="text-xs text-text3 leading-relaxed">{ desc }</p>
      <div className="mt-1 flex flex-wrap gap-2">{ children }</div>
    </section>
  )
}

function TaskBannerExample() {
  const { language, changeLanguage } = useLanguage()

  /** 汇总条 / 面板的自定义渲染挂在全局配置上，用开关演示「挂上」与「还原」两侧 */
  const [customStack, setCustomStack] = useState(false)

  const toggleCustomStack = () => {
    const next = !customStack
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

  return (
    <div className="h-full overflow-auto bg-background p-4 text-text">
      <div className="mx-auto max-w-3xl flex flex-col gap-5 py-4">
        <ThemeToggle />

        <Section
          title="任务：处理中 → 成功 / 失败"
          desc="成功即淡出，没有独立成功态；失败持久驻留直到重试或关闭，重试后重新回到处理中"
        >
          <Button variant="success" onClick={ () => simulateTask('买牛奶，明天提醒我', 0) }>
            成功
          </Button>

          <Button variant="danger" onClick={ () => simulateTask('整理 Q3 复盘要点', 1, '服务器异常') }>
            失败（自定义 reason）
          </Button>

          <Button variant="danger" onClick={ () => simulateTask('不传 reason 的任务', 1) }>
            失败（i18n 缺省文案）
          </Button>

          <Button variant="warning" onClick={ () => simulateClosableTask('允许手动关闭') }>
            失败 + 关闭按钮
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

        <Section
          title="堆叠与收拢"
          desc="新条头插，最新在上（与 Message 的最新在下相反）；处理中不计入收拢，失败超过阈值后更早的收拢为汇总条，点开可逐条重试，点头部或 Esc 收起"
        >
          <Button
            onClick={ () => ['A', 'B', 'C', 'D'].forEach((text, i) => {
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

          <Button onClick={ () => TaskBanner.config({ maxVisibleFailures: 1 }) }>
            阈值改 1
          </Button>

          <Button onClick={ () => TaskBanner.config({ maxVisibleFailures: 3 }) }>
            阈值还原 3
          </Button>
        </Section>

        <Section
          title="notify：带操作按钮的提示条"
          desc="不是任务，只是一条静态提示，默认 5 秒自动消失；duration 传 0 则常驻，交给业务 close()。业务本身已有等长计时器时用 0，免得两个时钟各走各的"
        >
          <Button
            onClick={ () => TaskBanner.notify({
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

        <Section
          title="placement：按定位分组"
          desc="placement 是条目级属性，不指定才跟随全局配置。六摞各排各的，收拢阈值也各算各的——顶部的建卡任务不会因为别处想把提示放到底部而被一起挪走。底部一摞自下而上排，最新的离底边最近"
        >
          { PLACEMENTS.map(placement => (
            <Button
              key={ placement }
              onClick={ () => TaskBanner.notify({
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

        <Section
          title="定制单条：className → render"
          desc="三档由粗到细——换 content / reason / action.text 的 ReactNode，传 className 三件套（结构不变只改样式），传 render 整条自己画（内置结构与那三个 className 一并让位）。render 里的 runAction / close 会先出栈再回调，自己去调 item.onRetry 彩条不会消失"
        >
          <Button
            onClick={ () => TaskBanner.notify({
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
            onClick={ () => TaskBanner.notify({
              content: null,
              duration: 0,
              placement: 'bottom',
              action: { onClick: () => simulateTask('自定义渲染触发的任务', 0) },
              render: ({ runAction, close }) => (
                <div className="w-80 flex items-center justify-between gap-4 rounded-xl bg-text px-4 py-3 text-background">
                  <span className="text-sm">整条自己画</span>
                  <span className="flex gap-3 text-sm font-medium">
                    <button type="button" onClick={ runAction }>撤销</button>
                    <button type="button" className="opacity-60" onClick={ close }>关闭</button>
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

        <Section
          title="定制整摞：containerClassName / renderSummary / renderPanel"
          desc="汇总条与面板不属于某一条，是整摞的行为，入口在 TaskBanner.config。两个 render 只接管内容，外面那层 motion.div 仍由组件出——AnimatePresence 要靠稳定的 key 与真实 motion 子节点才跑得了退场动画"
        >
          <Button
            variant={ customStack
              ? 'success'
              : 'default' }
            onClick={ toggleCustomStack }
          >
            { customStack
              ? '自定义汇总条 / 面板：已挂上'
              : '自定义汇总条 / 面板：未挂' }
          </Button>

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

          <Button onClick={ () => TaskBanner.config({ containerClassName: 'gap-8' }) }>
            容器间距改 gap-8
          </Button>

          <Button onClick={ () => TaskBanner.config({ containerClassName: undefined }) }>
            容器间距还原
          </Button>
        </Section>

        <Section
          title={ `i18n（当前：${language}）` }
          desc="重试 / 缺省失败 / 失败汇总三处文案内置在组件库的 taskBanner 命名空间，挂着失败条时切语言应立即跟随变化。notice 的文案与按钮全由业务给，组件库不猜语义"
        >
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

export default TaskBannerExample

type SectionProps = {
  /** 分区标题 */
  title: string
  /** 这一组按钮在验什么，写清行为而不是复述按钮名 */
  desc: ReactNode
  /** 本区的操作按钮 */
  children: ReactNode
}
