import type { CSSProperties, ReactNode } from 'react'
import type { ComponentController, SemanticVariant } from '../../types'
import type { ButtonProps } from '../Button/types'
import type { CloseBtnProps } from '../CloseBtn'

export interface ModalRef {
  hide: () => void
}

export type ModalVariant = SemanticVariant | 'error'

export type TitleAlign = 'left' | 'center' | 'right'

export interface ModalProps {
  className?: string
  style?: CSSProperties
  variant?: ModalVariant

  maskClassName?: string

  headerClassName?: string
  headerStyle?: CSSProperties

  bodyClassName?: string
  bodyStyle?: CSSProperties

  footerClassName?: string
  footerStyle?: CSSProperties

  width?: number | string
  height?: number
  /**
   * 最小宽度（px），用户可覆盖
   * @default 400
   */
  minWidth?: number
  /**
   * 最小高度（px），用户可覆盖
   *
   * 默认会随 `height` / `autoHeight` 推导：
   * - 未传 `height` 时默认 0
   * - 传了 `height` 时默认 182
   */
  minHeight?: number
  /**
   * 是否让弹窗高度跟随内容自然增长
   *
   * 开启后会取消内部固定伸展布局，让内容优先撑开弹窗，超出视口时再由弹窗本体滚动
   * @default false
   */
  autoHeight?: boolean

  /** 自定义头部，null 则清空 */
  header?: ReactNode
  /** 自定义底部，null 则清空 */
  footer?: ReactNode

  isOpen: boolean
  onClose?: () => void
  /** Modal 退出动画全部完成后触发 */
  onExitComplete?: () => void
  /**
   * 点击确认按钮的回调
   *
   * 命令式 Modal 中返回 `false` 时会阻止自动关闭，适合在当前层上继续叠加新 Modal。
   */
  onOk?: () => void | false | Promise<void | false>

  titleText?: string
  /**
   * 标题对齐方式
   * @default 'center' for default variant, 'left' for others
   */
  titleAlign?: TitleAlign
  /**
   * 是否显示 header icon
   * @default true for non-default variants
   */
  showIcon?: boolean
  okText?: string
  cancelText?: string
  okLoading?: boolean
  cancelLoading?: boolean
  /**
   * 取消按钮属性
   */
  cancelButtonProps?: Partial<ButtonProps>
  /**
   * 确认按钮属性
   */
  okButtonProps?: Partial<ButtonProps>
  /**
   * 全局 fixed 关闭按钮配置
   *
   * - `false`：不显示
   * - `true`：显示全局 fixed 关闭按钮
   * - 对象：透传给 CloseBtn，className 会与默认 fixed 定位类合并
   *
   * @default false
   */
  fixedCloseBtn?: boolean | ModalCloseBtnConfig
  /**
   * 窗口内部关闭按钮配置
   *
   * - `false`：不显示
   * - `true`：显示窗口内部右上角关闭按钮
   * - 对象：透传给 CloseBtn，className 会与默认内部定位类合并
   *
   * @default false
   */
  innerCloseBtn?: boolean | ModalCloseBtnConfig

  /**
   * 是否显示边框
   * @default light: false, dark: true
   */
  bordered?: boolean
  children?: ReactNode
  /**
   * 自定义层级。不传时由全局栈自动分配递增的 z-index（从 `Z.modal` 起），
   * 保证后打开的 Modal 始终在更高层
   */
  zIndex?: number
  /**
   * @default false
   */
  clickOutsideClose?: boolean
  /**
   * @default true
   */
  escToClose?: boolean
  /**
   * @default true
   */
  center?: boolean
}

export interface ModalCloseBtnConfig extends Partial<Omit<CloseBtnProps, 'mode' | 'onClick'>> {
  /**
   * 关闭按钮视觉样式
   * @default 'filled' for fixedCloseBtn, 'default' for innerCloseBtn
   */
  variant?: CloseBtnProps['variant']
}

export type ModelType<ModalInstanceType> = ModalInstanceType & {
  [key in ModalVariant]: (props: Partial<ModalProps>) => ComponentController
} & {
  show: (Component: any, props?: Partial<ModalProps>) => ComponentController
}
