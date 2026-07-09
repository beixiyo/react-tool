'use client'

import { LANGUAGES } from 'i18n'
import { useLanguage } from 'i18n/react'
import { TaskBanner } from '.'
import { Button } from '../Button'
import { GithubSourceLink } from '../GithubSourceLink'
import { GradientText } from '../GradientText'
import { ThemeToggle } from '../ThemeToggle'

/** Digest 同款渐变 loading 配色（首尾同色，无缝转圈） */
const GRADIENT_COLORS = ['#ffaa40', '#9c40ff', '#ffaa40']

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

function TaskBannerExample() {
  const { language, changeLanguage } = useLanguage()

  return (
    <div className="h-full overflow-auto bg-background p-4 text-text">
      <div className="mx-auto max-w-4xl flex flex-col gap-6">
        <ThemeToggle />

        <div className="flex flex-col gap-2">
          <span className="text-sm text-text2 font-semibold">基础：处理中 → 成功 / 失败</span>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="success"
              onClick={ () => simulateTask('买牛奶，明天提醒我', 0) }
            >
              成功任务（1.5s 后淡出）
            </Button>

            <Button
              variant="danger"
              onClick={ () => simulateTask('整理 Q3 复盘要点', 1, '服务器异常') }
            >
              失败一次（自定义 reason，重试后成功）
            </Button>

            <Button
              variant="danger"
              onClick={ () => simulateTask('不传 reason 的任务', 1) }
            >
              失败一次（i18n 缺省失败文案）
            </Button>

            <Button
              onClick={ () => {
                const task = TaskBanner.start(pendingContent('被其他流程接管的任务'))
                setTimeout(() => task.close(), 1500)
              } }
            >
              静默关闭（close）
            </Button>

            <Button
              variant="warning"
              onClick={ () => simulateClosableTask('允许手动关闭的失败任务') }
            >
              失败任务（显示关闭按钮）
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-text2 font-semibold">堆叠：最新在上，处理中不计入收拢</span>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={ () => {
                ['任务 A', '任务 B', '任务 C', '任务 D'].forEach((text, i) => {
                  setTimeout(() => simulateTask(`${text} · 顺序提交`, 0), i * 400)
                })
              } }
            >
              连发 4 条成功任务
            </Button>

            <Button
              variant="danger"
              onClick={ () => {
                for (let i = 1; i <= 6; i++) {
                  simulateTask(`失败任务 #${i}`, 1, '服务器异常')
                }
              } }
            >
              连发 6 条失败（超 3 条收拢汇总）
            </Button>

            <Button
              variant="warning"
              onClick={ () => {
                simulateTask('会成功的任务', 0)
                for (let i = 1; i <= 4; i++) {
                  simulateTask(`混合失败 #${i}`, 2, '连接有误')
                }
              } }
            >
              混合连发（1 成功 + 4 失败）
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-text2 font-semibold">
            i18n：文案内置组件库（taskBanner 命名空间），随全局语言切换（当前：
            { language }
            ）
          </span>
          <div className="flex flex-wrap gap-2">
            <Button onClick={ () => changeLanguage(LANGUAGES.ZH_CN) }>简体中文</Button>
            <Button onClick={ () => changeLanguage(LANGUAGES.ZH_TW) }>繁體中文</Button>
            <Button onClick={ () => changeLanguage(LANGUAGES.EN_US) }>English</Button>
            <Button onClick={ () => changeLanguage(LANGUAGES.JA_JP) }>日本語</Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-text2 font-semibold">config：收拢阈值</span>
          <div className="flex flex-wrap gap-2">
            <Button onClick={ () => TaskBanner.config({ maxVisibleFailures: 1 }) }>
              收拢阈值改为 1
            </Button>

            <Button onClick={ () => TaskBanner.config({ maxVisibleFailures: 3 }) }>
              收拢阈值还原为 3
            </Button>
          </div>
        </div>

        <div className="text-xs text-text3 leading-relaxed">
          <p>验证点：</p>
          <p>1. 新彩条插在栈顶（最新在上），与 Message（最新在下）相反</p>
          <p>2. 失败彩条默认无关闭按钮；显式 showClose 后可点叉关闭，重试后重新进入处理中</p>
          <p>3. 失败超过阈值（默认 3）后，更早的失败条收拢为汇总条</p>
          <p>4. 点击汇总条展开面板：列出全部失败条目、逐条重试；点头部或 Esc 收起</p>
          <p>5. 挂着失败条时切语言，重试按钮 / 汇总 / 缺省失败文案应立即跟随变化</p>
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default TaskBannerExample
