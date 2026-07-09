import type { ReactNode } from 'react'
import type { HTMLMotionProps } from 'motion/react'
import type { CloseBtnProps } from '../CloseBtn'

/**
 * 任务彩条状态：处理中 / 失败
 * 成功没有独立状态——成功即淡出移除
 */
export type TaskBannerStatus = 'pending' | 'failed'

/**
 * 堆叠仓库中单条任务彩条的数据
 * 由命令式调用（TaskBanner.start）生成，供 TaskBannerContainer 渲染
 */
export type TaskBannerItemData = {
  /** 仓库自增的唯一标识 */
  id: number
  /** 当前状态 */
  status: TaskBannerStatus
  /** TaskBanner 根 motion.div 的 motion 配置 */
  motionProps?: TaskBannerMotionProps
  /** 处理中显示的内容（如任务文字缩略、渐变 loading 文字） */
  content: ReactNode
  /** 失败原因文案（failed 态左侧显示） */
  reason?: ReactNode
  /** 点击重试的回调；触发前彩条已被移除，业务通常在此重新发起任务 */
  onRetry?: () => void
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
export type TaskBannerStartOptions = {
  /** 处理中显示的内容 */
  content: ReactNode
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
export type TaskBannerFailOptions = {
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
 * TaskBanner 根 motion.div 的 motion 配置
 * children / className 由内部接管；同 layoutId 的任务仅最新任务保留 layoutId
 */
export type TaskBannerMotionProps = Partial<Omit<HTMLMotionProps<'div'>, 'children' | 'className'>>

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
   * 容器距视口顶部距离（px），与 Message 堆叠容器默认一致
   * @default 64
   */
  topOffset: number
  /**
   * 容器水平定位：顶部居中 / 左上角 / 右上角
   * @default 'top'
   */
  placement: TaskBannerPlacement
}

/**
 * 任务彩条容器的水平定位
 * - `top`：顶部居中（默认）
 * - `top-left`：左上角
 * - `top-right`：右上角
 */
export type TaskBannerPlacement = 'top' | 'top-left' | 'top-right'
