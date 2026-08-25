import type { HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'
import type { CloseBtnProps } from '../CloseBtn'
import type { MessageVariant } from '../Message/types'

/**
 * 单条彩条的外观定制，`start` / `notify` / `fail` 通用
 *
 * 由粗到细三档，按需要的自由度取一档即可：
 * 1. 传 `content` / `reason` / `action.text` 的 ReactNode——只换内容，保留内置结构
 * 2. 传这里的几个 className——保留结构，改样式
 * 3. 传 `render`——整条自己画，内置结构与上面的 className 全部让位
 *
 * `fail` 里不传的字段继承 `start` 时的取值，失败态不必把外观再抄一遍
 */
export type TaskBannerAppearance = {
  /** 彩条卡片根节点（底色、圆角、阴影、内边距都在这层） */
  className?: string
  /** 卡片内容区；默认居中限宽，横向排布内容时常要在这里改 */
  contentClassName?: string
  /** 操作按钮：failed 的重试按钮与 notice 的 action 按钮 */
  actionClassName?: string
  /**
   * 整条自己渲染
   *
   * 出栈与回调的时序由 {@link TaskBannerRenderContext} 里的方法保证，
   * 自定义渲染只管画，不用关心仓库状态
   */
  render?: (ctx: TaskBannerRenderContext) => ReactNode
}

/**
 * 自定义渲染一条彩条时拿到的上下文
 *
 * 三个方法都是「先出栈，再触发业务回调」，与内置按钮的行为完全一致——
 * 自定义渲染若自己去调 `item.onRetry`，彩条不会消失
 */
export type TaskBannerRenderContext = {
  /** 本条数据 */
  item: TaskBannerItemData
  /** 本条所在栈的定位，可据此决定自定义内容的方向 */
  placement: TaskBannerPlacement
  /** 触发重试（failed 态） */
  retry: () => void
  /** 触发操作按钮（notice 态） */
  runAction: () => void
  /** 关闭本条 */
  close: () => void
}

/**
 * 任务彩条状态
 * - `pending`：处理中，成功即淡出移除，没有独立的成功态
 * - `failed`：失败，持久驻留直到重试 / 关闭
 * - `notice`：与任务无关的静态提示，可带一个操作按钮，到时自动消失
 */
export type TaskBannerStatus = 'pending' | 'failed' | 'notice'

/**
 * 提示条上的操作按钮（如「撤销」）
 * 与失败条的重试同款样式与行为
 */
export type TaskBannerAction = {
  /**
   * 按钮文案
   *
   * 省略时内置渲染不画按钮——留给 `render` 自绘按钮的场景：
   * 那里按钮长什么样由业务定，但点击后要走的仍是同一个 `onClick`
   */
  text?: ReactNode
  /** 点击回调；触发前该条彩条已被移除 */
  onClick: () => void
}

/**
 * 堆叠仓库中单条任务彩条的数据
 * 由命令式调用（TaskBanner.start / TaskBanner.notify）生成，供 TaskBannerContainer 渲染
 */
export type TaskBannerItemData = TaskBannerAppearance & {
  /** 仓库自增的唯一标识 */
  id: number
  /** 当前状态 */
  status: TaskBannerStatus
  /**
   * 本条的定位；不传则跟随 {@link TaskBannerConfig.placement}
   *
   * 存的是「未解析」的原值：不指定的条目要能跟着全局配置一起动，
   * 提前落成具体值会让 `TaskBanner.config` 对已在场的彩条失效
   */
  placement?: TaskBannerPlacement
  /** TaskBanner 根 motion.div 的 motion 配置 */
  motionProps?: TaskBannerMotionProps
  /** 处理中 / 提示态显示的内容（如任务文字缩略、渐变 loading 文字） */
  content: ReactNode
  /** 失败原因文案（failed 态左侧显示） */
  reason?: ReactNode
  /** 点击重试的回调；触发前彩条已被移除，业务通常在此重新发起任务 */
  onRetry?: () => void
  /** notice 态的语义配色 */
  variant?: MessageVariant
  /** notice 态是否显示语义图标 */
  showIcon?: boolean
  /** notice 态的操作按钮 */
  action?: TaskBannerAction
  /** notice 态的驻留时长（毫秒），`0` 为常驻 */
  duration?: number
  /** notice 态到时自动移除后的回调；手动关闭 / 点操作按钮不会触发 */
  onExpire?: () => void
  /**
   * 是否显示关闭按钮
   * @default false
   */
  showClose?: boolean
  /**
   * 关闭按钮配置，mode / onClick 由 TaskBanner 接管
   */
  closeBtnProps?: TaskBannerCloseBtnConfig
  /** 点击关闭按钮后的回调；触发前彩条已被移除 */
  onClose?: () => void
}

/**
 * TaskBanner.start 的入参
 */
export type TaskBannerStartOptions = TaskBannerAppearance & {
  /** 处理中显示的内容 */
  content: ReactNode
  /**
   * 本条的定位；不传则跟随 {@link TaskBannerConfig.placement}
   */
  placement?: TaskBannerPlacement
  /** TaskBanner 根 motion.div 的 motion 配置 */
  motionProps?: TaskBannerMotionProps
  /**
   * 是否显示关闭按钮
   * @default false
   */
  showClose?: boolean
  /**
   * 关闭按钮配置，mode / onClick 由 TaskBanner 接管
   */
  closeBtnProps?: TaskBannerCloseBtnConfig
  /** 点击关闭按钮后的回调；触发前彩条已被移除 */
  onClose?: () => void
}

/**
 * TaskBanner.notify 的入参
 */
export type TaskBannerNotifyOptions = TaskBannerAppearance & {
  /** 提示文案 */
  content: ReactNode
  /** 操作按钮（如「撤销」）；不传则只是一条纯文案提示 */
  action?: TaskBannerAction
  /**
   * 驻留时长（毫秒），到时自动移除并触发 {@link TaskBannerNotifyOptions.onExpire}
   *
   * 传 `0` 表示常驻，由业务自己调 `close()`。业务已有等长计时器时优先用 `0`，
   * 避免两个时钟各走各的
   * @default 5000
   */
  duration?: number
  /** 到时自动移除后的回调；手动关闭 / 点操作按钮不会触发 */
  onExpire?: () => void
  /**
   * 语义配色
   * @default 'default'
   */
  variant?: MessageVariant
  /**
   * 是否显示语义图标；不传时沿用 Message 按 variant 的判断
   */
  showIcon?: boolean
  /**
   * 本条的定位；不传则跟随 {@link TaskBannerConfig.placement}
   */
  placement?: TaskBannerPlacement
  /** TaskBanner 根 motion.div 的 motion 配置 */
  motionProps?: TaskBannerMotionProps
  /**
   * 是否显示关闭按钮
   * @default false
   */
  showClose?: boolean
  /**
   * 关闭按钮配置，mode / onClick 由 TaskBanner 接管
   */
  closeBtnProps?: TaskBannerCloseBtnConfig
  /** 点击关闭按钮后的回调；触发前彩条已被移除 */
  onClose?: () => void
}

/**
 * 失败结算（controller.fail）的入参
 */
export type TaskBannerFailOptions = TaskBannerAppearance & {
  /**
   * 失败原因文案
   * @default 组件库 i18n 的 taskBanner.failed（随当前语言）
   */
  reason?: ReactNode
  /** 点击重试的回调；触发前失败彩条已被移除 */
  onRetry?: () => void
  /**
   * 是否显示关闭按钮；不传时继承 start 配置
   */
  showClose?: boolean
  /**
   * 关闭按钮配置；不传时继承 start 配置
   */
  closeBtnProps?: TaskBannerCloseBtnConfig
  /** 点击关闭按钮后的回调；不传时继承 start 配置 */
  onClose?: () => void
}

/**
 * TaskBanner 关闭按钮配置
 * mode / onClick 由内部接管，避免外部破坏布局与关闭行为
 */
export type TaskBannerCloseBtnConfig = Partial<Omit<CloseBtnProps, 'mode' | 'onClick'>>

/**
 * TaskBanner 根 motion.div 的配置（动画层，卡片外面那一层）
 *
 * `className` 会与内部的 `pointer-events-auto` 合并而不是覆盖；
 * `children` 由内部接管；同 layoutId 的任务仅最新任务保留 layoutId
 */
export type TaskBannerMotionProps = Partial<Omit<HTMLMotionProps<'div'>, 'children'>>

/**
 * TaskBanner.start 返回的结算控制器
 * 同一任务只会结算一次，重复调用任意结算方法为 no-op
 */
export type TaskBannerController = {
  /** 成功结算：彩条淡出移除 */
  succeed: () => void
  /** 失败结算：转为持久失败彩条（不可手动关闭，仅能重试） */
  fail: (options?: TaskBannerFailOptions) => void
  /** 静默移除（提示已被其他流程接管时使用） */
  close: () => void
}

/**
 * TaskBanner.notify 返回的控制器
 *
 * 提示条没有「结算」概念，只能被关掉，所以不给 succeed / fail
 */
export type TaskBannerNoticeController = {
  /** 移除这条提示；已移除则为 no-op，不触发 onExpire / onClose */
  close: () => void
}

/**
 * TaskBanner 全局配置
 * 文案走组件库内置 i18n（taskBanner 命名空间），不在此配置
 */
export type TaskBannerConfig = {
  /**
   * 失败彩条最多单独展示几条，更早的失败条收拢进汇总彩条
   * @default 3
   */
  maxVisibleFailures: number
  /**
   * 顶部定位时容器距视口顶部距离（px），与 Message 堆叠容器默认一致
   * @default 64
   */
  topOffset: number
  /**
   * 底部定位时容器距视口底部距离（px）
   * @default 64
   */
  bottomOffset: number
  /**
   * 容器默认水平定位，可被单条彩条的 `placement` 覆盖
   * @default 'top'
   */
  placement: TaskBannerPlacement
  /**
   * 每个定位栈的容器类
   *
   * 容器只负责定位与间距，本身不拦截鼠标事件；改 `gap` / 宽度这类布局属性在这里
   */
  containerClassName?: string
  /** 失败汇总条的类 */
  summaryClassName?: string
  /** 失败列表面板的类 */
  panelClassName?: string
  /** 自定义渲染失败汇总条；给了它，`summaryClassName` 不再生效 */
  renderSummary?: (ctx: TaskBannerSummaryContext) => ReactNode
  /** 自定义渲染失败列表面板；给了它，`panelClassName` 不再生效 */
  renderPanel?: (ctx: TaskBannerPanelContext) => ReactNode
}

/** 自定义渲染失败汇总条时拿到的上下文 */
export type TaskBannerSummaryContext = {
  /** 收拢进汇总条的失败条数 */
  count: number
  /** 所在栈的定位 */
  placement: TaskBannerPlacement
  /** 展开为失败列表面板 */
  expand: () => void
}

/** 自定义渲染失败列表面板时拿到的上下文 */
export type TaskBannerPanelContext = {
  /** 全部失败条目，最新在前 */
  failures: TaskBannerItemData[]
  /** 所在栈的定位 */
  placement: TaskBannerPlacement
  /** 重试某一条：先出栈，再触发它的 onRetry */
  retry: (item: TaskBannerItemData) => void
  /** 关闭某一条：先出栈，再触发它的 onClose */
  close: (item: TaskBannerItemData) => void
  /** 收起面板 */
  collapse: () => void
}

/**
 * 任务彩条容器的定位
 *
 * 顶部一组自上而下排列，底部一组自下而上排列，两者都是**最新的那条离锚定边最近**
 * - `top`：顶部居中（默认）
 * - `top-left`：左上角
 * - `top-right`：右上角
 * - `bottom`：底部居中
 * - `bottom-left`：左下角
 * - `bottom-right`：右下角
 */
export type TaskBannerPlacement =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'
