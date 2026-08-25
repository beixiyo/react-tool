'use client'

import type { ReactNode } from 'react'
import type {
  TaskBannerConfig,
  TaskBannerController,
  TaskBannerNoticeController,
  TaskBannerNotifyOptions,
  TaskBannerStartOptions,
} from './types'
import { isObj } from '@jl-org/tool'
import { I18nProvider } from 'i18n/react'
import { injectReactApp } from 'utils'
import { allResources } from '../../i18n'
import { TaskBannerContainer } from './TaskBannerContainer'
import { taskBannerStore } from './taskBannerStore'

let mounted = false

/**
 * 懒挂载全局唯一的堆叠容器（仅首次命令式调用时执行一次）
 *
 * 容器注入在独立 React root，故需自带 I18nProvider——它复用 i18n 全局单例，
 * 与宿主应用的语言切换互通；resources 为幂等补注册，宿主未注册 comps 资源也能工作
 */
function ensureContainer() {
  if (mounted || typeof document === 'undefined') {
    return
  }
  mounted = true
  injectReactApp(
    <I18nProvider resources={ allResources }>
      <TaskBannerContainer />
    </I18nProvider>,
    { inSandbox: false },
  )
}

/**
 * 任务状态彩条（命令式 API）
 *
 * 面向「提交后异步处理」的任务承接区，与通用 toast（Message）的分工：
 * - Message：瞬时提示，最新在下，超高自动丢弃
 * - TaskBanner：任务状态，**最新在上**，失败持久可重试，
 *   失败超过阈值收拢为汇总条、点击展开逐条重试
 *
 * `notify` 是这一摞里的例外：它不是任务，只是一条带操作按钮的提示。
 * 之所以不归给 Message，是因为它常与同一业务的失败条成对出现
 * （取消提示与转写失败提示），走同一个容器才能保证两者出现在同一位置、
 * 遵守同一套堆叠规则
 *
 * 文案（重试 / 缺省失败 / 失败汇总）走组件库内置 i18n（taskBanner 命名空间），
 * 随全局语言自动切换，无需配置
 *
 * 外观定制由粗到细三档，见 `TaskBannerAppearance`：换 ReactNode 内容 →
 * 传 className → 传 `render` 整条自己画。汇总条与面板的对应入口在
 * `TaskBanner.config`（它们不属于某一条，是整摞的行为）
 *
 * @example
 * ```tsx
 * const task = TaskBanner.start({ content: '正在创建卡片…' })
 * // 异步结算
 * task.succeed()
 * task.fail({ reason: t('serverError'), onRetry: () => restart() })
 *
 * // 带撤销的提示条，5 秒后自动消失
 * TaskBanner.notify({
 *   content: 'Transcription canceled',
 *   action: { text: 'Undo', onClick: () => retranscribe() },
 *   placement: 'bottom',
 * })
 *
 * // 整条自己画：出栈时序仍由 ctx 的方法保证
 * TaskBanner.notify({
 *   content: null,
 *   render: ({ runAction, close }) => (
 *     <MyToast onUndo={ runAction } onDismiss={ close } />
 *   ),
 * })
 * ```
 */
export const TaskBanner = {
  /** 增量合并全局配置（收拢阈值 / 容器位置），可多次调用 */
  config(patch: Partial<TaskBannerConfig>) {
    taskBannerStore.setConfig(patch)
  },

  /** 发起一条处理中彩条（头插到栈顶），返回结算控制器 */
  start(contentOrOptions: ReactNode | TaskBannerStartOptions): TaskBannerController {
    ensureContainer()

    const options = isObj(contentOrOptions) && 'content' in contentOrOptions
      ? contentOrOptions as TaskBannerStartOptions
      : { content: contentOrOptions as ReactNode }

    const id = taskBannerStore.add(options)

    return {
      succeed: () => taskBannerStore.remove(id),
      fail: options => taskBannerStore.fail(id, options),
      close: () => taskBannerStore.remove(id),
    }
  },

  /**
   * 弹一条静态提示（头插到栈顶），默认 5 秒后自动消失
   *
   * 返回的控制器只有 `close`：提示条没有成功 / 失败之分，
   * 用它在业务提前接管时把提示收走（如用户已在别处完成了同一件事）
   */
  notify(contentOrOptions: ReactNode | TaskBannerNotifyOptions): TaskBannerNoticeController {
    ensureContainer()

    const options = isObj(contentOrOptions) && 'content' in contentOrOptions
      ? contentOrOptions as TaskBannerNotifyOptions
      : { content: contentOrOptions as ReactNode }

    const id = taskBannerStore.notify(options)

    return {
      close: () => taskBannerStore.remove(id),
    }
  },
}

export * from './constants'
export * from './types'
