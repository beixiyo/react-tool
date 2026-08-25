import type {
  TaskBannerConfig,
  TaskBannerFailOptions,
  TaskBannerItemData,
  TaskBannerMotionProps,
  TaskBannerNotifyOptions,
  TaskBannerStartOptions,
} from './types'
import { TASK_BANNER_NOTICE_DURATION } from './constants'

/**
 * TaskBanner 全局堆叠状态仓库
 *
 * 与 messageStore 同范式（发布订阅 + useSyncExternalStore），关键差异：
 * - 新任务**头插**（视觉上最新在上），而非 Message 的追加队尾
 * - 条目带状态机：pending →（移除 | failed），failed 持久存在直到重试 / 关闭；
 *   notice 与状态机无关，只是一条到时自动出栈的静态提示
 * - 额外持有一份全局配置（文案 / 收拢阈值 / 容器位置），变更同样走订阅通知
 */

let items: TaskBannerItemData[] = []
let seed = 0
const listeners = new Set<Listener>()

const defaultConfig: TaskBannerConfig = {
  maxVisibleFailures: 3,
  topOffset: 64,
  bottomOffset: 64,
  placement: 'top',
}

let config: TaskBannerConfig = { ...defaultConfig }

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

/**
 * 头插一条新彩条，并让同 layoutId 的旧条目让出 layoutId
 *
 * layoutId 是 motion 的共享布局标识，同一时刻只能有一个持有者，
 * 否则新旧两条会争抢同一个布局目标、互相把对方拽走
 */
function push(item: TaskBannerItemData, layoutId: TaskBannerMotionProps['layoutId']) {
  const restItems = layoutId
    ? items.map(prev => prev.motionProps?.layoutId === layoutId
        ? { ...prev, motionProps: { ...prev.motionProps, layoutId: undefined } }
        : prev)
    : items

  items = [item, ...restItems]
  emit()
}

export const taskBannerStore = {
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  /** 返回稳定引用，仅在内容变化时生成新数组 */
  getSnapshot(): TaskBannerItemData[] {
    return items
  },

  /** 返回稳定引用，仅在 setConfig 时生成新对象 */
  getConfig(): TaskBannerConfig {
    return config
  },

  /** 增量合并全局配置（收拢阈值 / 容器位置），并通知容器重渲染 */
  setConfig(patch: Partial<TaskBannerConfig>) {
    config = { ...config, ...patch }
    emit()
  },

  /** 新增一条处理中彩条，头插到栈顶（最新在上），返回其唯一 id */
  add(options: TaskBannerStartOptions) {
    const id = ++seed

    push({
      id,
      status: 'pending',
      placement: options.placement,
      motionProps: options.motionProps,
      content: options.content,
      className: options.className,
      contentClassName: options.contentClassName,
      actionClassName: options.actionClassName,
      render: options.render,
      showClose: options.showClose,
      closeBtnProps: options.closeBtnProps,
      onClose: options.onClose,
    }, options.motionProps?.layoutId)

    return id
  },

  /** 新增一条静态提示条，头插到栈顶，返回其唯一 id */
  notify(options: TaskBannerNotifyOptions) {
    const id = ++seed

    push({
      id,
      status: 'notice',
      placement: options.placement,
      motionProps: options.motionProps,
      content: options.content,
      variant: options.variant,
      showIcon: options.showIcon,
      action: options.action,
      className: options.className,
      contentClassName: options.contentClassName,
      actionClassName: options.actionClassName,
      render: options.render,
      /** 归一化收在这一处，渲染层只认已经定好的毫秒数 */
      duration: options.duration ?? TASK_BANNER_NOTICE_DURATION,
      onExpire: options.onExpire,
      showClose: options.showClose,
      closeBtnProps: options.closeBtnProps,
      onClose: options.onClose,
    }, options.motionProps?.layoutId)

    return id
  },

  /** 把指定彩条转为持久失败态；已失败 / 已移除则 no-op */
  fail(id: number, options?: TaskBannerFailOptions) {
    const target = items.find(item => item.id === id)
    if (!target || target.status === 'failed') {
      return
    }

    /** reason 原样存储（可为空），缺省文案由渲染层按当前语言用 i18n 兜底 */
    items = items.map(item => item.id === id
      ? {
          ...item,
          status: 'failed' as const,
          reason: options?.reason,
          onRetry: options?.onRetry,
          /** 外观字段是「不传即继承 start」，字符串 / 函数没有「显式传 false」的语义，用 ?? 足够 */
          className: options?.className ?? item.className,
          contentClassName: options?.contentClassName ?? item.contentClassName,
          actionClassName: options?.actionClassName ?? item.actionClassName,
          render: options?.render ?? item.render,
          showClose: hasOwn(options, 'showClose')
            ? options?.showClose
            : item.showClose,
          closeBtnProps: hasOwn(options, 'closeBtnProps')
            ? options?.closeBtnProps
            : item.closeBtnProps,
          onClose: hasOwn(options, 'onClose')
            ? options?.onClose
            : item.onClose,
        }
      : item)
    emit()
  },

  /** 移除指定彩条（成功结算、静默关闭、重试出栈均走此路径） */
  remove(id: number) {
    if (!items.some(item => item.id === id)) {
      return
    }
    items = items.filter(item => item.id !== id)
    emit()
  },
}

function hasOwn<T extends object, K extends PropertyKey>(
  value: T | undefined,
  key: K,
): value is T & Record<K, unknown> {
  return !!value && Object.prototype.hasOwnProperty.call(value, key)
}

type Listener = () => void
