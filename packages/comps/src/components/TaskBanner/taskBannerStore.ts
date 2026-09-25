import {
  TASK_BANNER_DEFAULT_COLLAPSE_THRESHOLD,
  TASK_BANNER_DEFAULT_STACKED_CARDS,
  TASK_BANNER_MAX_COLLAPSE_LAYERS,
  TASK_BANNER_NOTICE_DURATION,
} from './constants'
import type {
  TaskBannerCollapseConfig,
  TaskBannerConfig,
  TaskBannerFailOptions,
  TaskBannerItemData,
  TaskBannerMotionProps,
  TaskBannerNotifyOptions,
  TaskBannerStartOptions,
} from './types'

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

/**
 * notice 的驻留计时（id → timer）
 *
 * 放在仓库而不是渲染层：整摞收拢的展开 / 收起会重挂 TaskBannerBar，
 * 计时若跟着组件走会被重置成整投时长；仓库持有则只认「条目何时入栈」
 */
const noticeTimers = new Map<number, ReturnType<typeof setTimeout>>()

function clearNoticeTimer(id: number) {
  const timer = noticeTimers.get(id)
  if (timer === undefined) {
    return
  }
  clearTimeout(timer)
  noticeTimers.delete(id)
}

/** notice 到点：出栈并触发 onExpire；手动关闭 / 点操作按钮不走这里 */
function expireNotice(id: number) {
  const item = items.find((entry) => entry.id === id)
  noticeTimers.delete(id)
  taskBannerStore.remove(id)
  item?.onExpire?.()
}

/**
 * 归一化整摞收拢配置：阈值 / 层数在 API 边界定死，渲染层只认已归一化的值
 *
 * 层数上限与 StackedCards 一致（1-3）；阈值最低 1（单条也收，虽无视觉意义但不拦截）
 */
function normalizeCollapse(collapse: TaskBannerCollapseConfig | undefined): TaskBannerCollapseConfig | undefined {
  if (!collapse) {
    return undefined
  }

  const layers = Math.min(Math.max(Math.floor(collapse.stackedCards?.layers ?? TASK_BANNER_MAX_COLLAPSE_LAYERS), 1), TASK_BANNER_MAX_COLLAPSE_LAYERS) as
    | 1
    | 2
    | 3

  return {
    threshold: Math.max(Math.floor(collapse.threshold ?? TASK_BANNER_DEFAULT_COLLAPSE_THRESHOLD), 1),
    stackedCards: {
      ...TASK_BANNER_DEFAULT_STACKED_CARDS,
      ...collapse.stackedCards,
      layers,
    },
    className: collapse.className,
    showCount: collapse.showCount ?? true,
    countClassName: collapse.countClassName,
    render: collapse.render,
  }
}

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
    ? items.map((prev) => (prev.motionProps?.layoutId === layoutId
      ? { ...prev, motionProps: { ...prev.motionProps, layoutId: undefined } }
      : prev)
    )
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

  /**
   * 增量合并全局配置（收拢阈值 / 容器位置 / 整摞收拢），并通知容器重渲染；
   * `collapse` 整体替换并就地归一化，传 `undefined` 关闭整摞收拢
   */
  setConfig(patch: Partial<TaskBannerConfig>) {
    const next = { ...config, ...patch }
    if (hasOwn(patch, 'collapse')) {
      next.collapse = normalizeCollapse(patch.collapse)
    }
    config = next
    emit()
  },

  /** 新增一条处理中彩条，头插到栈顶（最新在上），返回其唯一 id */
  add(options: TaskBannerStartOptions) {
    const id = ++seed

    push(
      {
        id,
        status: 'pending',
        placement: options.placement,
        motionProps: options.motionProps,
        content: options.content,
        collapseEligible: options.collapseEligible ?? true,
        priority: options.priority ?? 0,
        className: options.className,
        contentClassName: options.contentClassName,
        actionClassName: options.actionClassName,
        render: options.render,
        showClose: options.showClose,
        closeBtnProps: options.closeBtnProps,
        onClose: options.onClose,
        escToClose: options.escToClose ?? !!options.showClose,
      },
      options.motionProps?.layoutId,
    )

    return id
  },

  /** 新增一条静态提示条，头插到栈顶，返回其唯一 id */
  notify(options: TaskBannerNotifyOptions) {
    const id = ++seed
    /** 归一化收在这一处，渲染层只认已经定好的毫秒数 */
    const duration = options.duration ?? TASK_BANNER_NOTICE_DURATION

    const item: TaskBannerItemData = {
      id,
      status: 'notice',
      placement: options.placement,
      motionProps: options.motionProps,
      content: options.content,
      collapseEligible: options.collapseEligible ?? true,
      priority: options.priority ?? 0,
      variant: options.variant,
      showIcon: options.showIcon,
      action: options.action,
      className: options.className,
      contentClassName: options.contentClassName,
      actionClassName: options.actionClassName,
      render: options.render,
      onExpire: options.onExpire,
      showClose: options.showClose,
      closeBtnProps: options.closeBtnProps,
      onClose: options.onClose,
      /** Esc 与 ✕ 同源：内置渲染画了 ✕ 才接 Esc；自绘 ✕ 的条子显式传 `escToClose` */
      escToClose: options.escToClose ?? !!options.showClose,
    }

    push(item, options.motionProps?.layoutId)

    /** 常驻（0）不排计时，交由业务自己 close；到点出栈并触发 onExpire */
    if (duration > 0) {
      noticeTimers.set(
        id,
        setTimeout(() => expireNotice(id), duration),
      )
    }

    return id
  },

  /** 把指定彩条转为持久失败态；已失败 / 已移除则 no-op */
  fail(id: number, options?: TaskBannerFailOptions) {
    const target = items.find((item) => item.id === id)
    if (!target || target.status === 'failed') {
      return
    }

    /** reason 原样存储（可为空），缺省文案由渲染层按当前语言用 i18n 兜底 */
    items = items.map((item) =>
      item.id === id
        ? {
          ...item,
          status: 'failed' as const,
          reason: options?.reason,
          onRetry: options?.onRetry,
          /** 外观字段是「不传即继承 start」，字符串 / 函数没有「显式传 false」的语义，用 ?? 足够 */
          className: options?.className ?? item.className,
          contentClassName: options?.contentClassName ?? item.contentClassName,
          actionClassName: options?.actionClassName ?? item.actionClassName,
          failureThumbnail: options?.failureThumbnail ?? item.failureThumbnail,
          retryIcon: options?.retryIcon ?? item.retryIcon,
          failureCloseIcon: options?.failureCloseIcon ?? item.failureCloseIcon,
          collapseEligible: options?.collapseEligible ?? item.collapseEligible,
          priority: options?.priority ?? item.priority,
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
          /** 失败态重新给了 showClose 就跟着它走，否则继承 start 时的判定 */
          escToClose: options?.escToClose ?? (hasOwn(options, 'showClose')
            ? !!options.showClose
            : item.escToClose),
        }
        : item
    )
    emit()
  },

  /** 移除指定彩条（成功结算、静默关闭、重试出栈、驻留到期均走此路径） */
  remove(id: number) {
    if (!items.some((item) => item.id === id)) {
      return
    }
    clearNoticeTimer(id)
    items = items.filter((item) => item.id !== id)
    emit()
  },
}

function hasOwn<T extends object, K extends PropertyKey>(value: T | undefined, key: K): value is T & Record<K, unknown> {
  return !!value && Object.prototype.hasOwnProperty.call(value, key)
}

type Listener = () => void
