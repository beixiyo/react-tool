import type { CSSProperties, ReactNode } from 'react'
import type { ComponentController } from '../../types'

export interface ModalRef {
  hide: () => void
}

export type ModalVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

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
  okText?: string
  cancelText?: string
  okLoading?: boolean
  cancelLoading?: boolean
  /**
   * @default false
   */
  showCloseBtn?: boolean

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
