'use client'

import type { ModalProps, ModalRef, ModelType } from './types'
import { useTheme } from 'hooks'
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, memo, useEffect, useImperativeHandle, useState } from 'react'
import { cn } from 'utils'
import { Z } from '../../constants/z-index'
import { CloseBtn } from '../CloseBtn'
import { Mask } from '../Mask'
import { SafePortal } from '../SafePortal'
import { DURATION, variantStyles } from './constants'
import { extendModal } from './extendModal'
import { Footer } from './Footer'
import { Header } from './Header'
import { useModalStack } from './useModalStack'

const InnerModal = forwardRef<ModalRef, ModalProps>((
  props,
  ref,
) => {
  const [theme] = useTheme()
  const {
    width = 400,
    height,
    minWidth = 320,

    isOpen,
    onClose,
    onOk,

    zIndex: zIndexProp,
    titleText = 'Modal Title',
    titleAlign,
    showIcon,
    okText = 'OK',
    cancelText = 'Cancel',
    okLoading = false,
    cancelLoading = false,
    cancelButtonProps,
    okButtonProps,

    header,
    footer,

    children,
    className,
    style,
    variant = 'default',
    showCloseBtn = false,

    maskClassName,
    headerClassName,
    headerStyle,

    bodyClassName,
    bodyStyle,

    footerClassName,
    footerStyle,

    clickOutsideClose = false,
    escToClose = true,
    center = true,
    bordered = theme !== 'light',
  } = props
  const variantStyle = variantStyles[variant]
  const [open, setOpen] = useState(isOpen)

  /** 接入全局栈：自增 z-index、栈顶感知、仅栈顶响应 ESC */
  const { zIndex: autoZIndex, isTop } = useModalStack({ open, escToClose, onClose })
  /** 用户显式传入的 zIndex 优先；否则用栈分配的递增值，未就绪时回退到基础层级 */
  const zIndex = zIndexProp ?? autoZIndex ?? Z.modal

  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  /**
   * Ref
   */
  useImperativeHandle(ref, () => ({
    hide: () => {
      setOpen(false)
    },
  }))

  const ModalContent = (
    <AnimatePresence>
      { open && <Mask
        style={ { zIndex, backgroundColor: isTop
          ? undefined
          : 'transparent' } }
        className={ cn(
          'fixed',
          !center && 'items-start! pt-16',
          /** 非栈顶不渲染暗色遮罩与模糊，避免多层叠加越来越黑 */
          !isTop && 'backdrop-blur-none',
          maskClassName,
        ) }
      >
        { showCloseBtn && <CloseBtn
          onClick={ onClose }
          mode="fixed"
          variant="filled"
          className="z-modal right-4 top-4"
          size="xl"
        />}

        <div
          onClick={ clickOutsideClose
            ? onClose
            : undefined }
          className="fixed inset-0"
        ></div>

        <motion.div
          className={ cn(
            'relative rounded-3xl bg-background text-text shadow-card',
            bordered && 'border border-border',
            !width && 'w-[calc(100vw-2rem)] max-w-2xl',
            'mx-auto',
            variantStyle.bg,
            variantStyle.border,
          ) }
          style={ {
            width,
            minWidth: `${minWidth}px`,
            height,
            ...style,
          } }
          initial={ { scale: 0.5, opacity: 0 } }
          animate={ { scale: 1, opacity: 1 } }
          exit={ { scale: 0.5, opacity: 0 } }
          transition={ { duration: DURATION } }
        >
          <div className={ cn(
            'h-full max-h-[90vh] flex flex-col gap-4 p-4',
            className,
          ) }>
            { header === null
              ? null
              : header === undefined
                ? <Header
                    isOpen={ open }
                    variant={ variant }
                    onClose={ onClose }
                    titleText={ titleText }
                    titleAlign={ titleAlign }
                    showIcon={ showIcon }
                    header={ header }
                    headerClassName={ headerClassName }
                    headerStyle={ headerStyle }
                  />
                : header }

            <div
              className={ cn(
                `overflow-y-auto overflow-x-hidden flex-1 text-sm`,
                bodyClassName,
              ) }
              style={ bodyStyle }
            >
              { children }
            </div>

            { footer === null
              ? null
              : footer === undefined
                ? <Footer
                    isOpen={ open }
                    variant={ variant }
                    onClose={ onClose }
                    onOk={ onOk }
                    okText={ okText }
                    cancelText={ cancelText }
                    okLoading={ okLoading }
                    cancelLoading={ cancelLoading }
                    cancelButtonProps={ cancelButtonProps }
                    okButtonProps={ okButtonProps }
                    footer={ footer }
                    footerClassName={ footerClassName }
                    footerStyle={ footerStyle }
                  />
                : footer }
          </div>
        </motion.div>
      </Mask> }
    </AnimatePresence>
  )

  return <SafePortal>{ ModalContent }</SafePortal>
})

export const Modal = memo<ModalProps>(InnerModal) as unknown as ModelType<typeof InnerModal>
Modal.displayName = 'Modal'

extendModal()
