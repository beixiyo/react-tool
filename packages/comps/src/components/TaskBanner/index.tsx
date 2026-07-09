'use client'

import type { ReactNode } from 'react'
import type { TaskBannerConfig, TaskBannerController, TaskBannerStartOptions } from './types'
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
 * 文案（重试 / 缺省失败 / 失败汇总）走组件库内置 i18n（taskBanner 命名空间），
 * 随全局语言自动切换，无需配置
 *
 * @example
 * ```tsx
 * const task = TaskBanner.start({ content: '正在创建卡片…' })
 * // 异步结算
 * task.succeed()
 * task.fail({ reason: t('serverError'), onRetry: () => restart() })
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
}

export * from './types'
