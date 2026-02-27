import type { CSSProperties, ReactNode } from 'react'
import type { ComponentController, SemanticVariant } from '../../types'
import type { ButtonProps } from '../Button/types'

export interface ModalRef {
  hide: () => void
}

export type ModalVariant = SemanticVariant

export type TitleAlign = 'left' | 'center' | 'right'

export interface ModalProps {
  className?: string
  style?: CSSProperties
  variant?: ModalVariant

  headerClassName?: string
  headerStyle?: CSSProperties

  bodyClassName?: string
  bodyStyle?: CSSProperties

  footerClassName?: string
  footerStyle?: CSSProperties

  width?: number | string
  height?: number
  minWidth?: number

  /** 自定义头部，null 则清空 */
  header?: ReactNode
  /** 自定义底部，null 则清空 */
  footer?: ReactNode

  isOpen: boolean
  onClose?: () => void
  onOk?: () => void

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
   * @default false
   */
  showCloseBtn?: boolean

  /**
   * 是否显示边框
   * @default light: false, dark: true
   */
  bordered?: boolean
  children?: ReactNode
  /**
   * @default 99
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
   * @default false
   */
  center?: boolean
}

export type ModelType<ModalInstanceType> = ModalInstanceType & {
  [key in ModalVariant]: (props: Partial<ModalProps>) => ComponentController
}
