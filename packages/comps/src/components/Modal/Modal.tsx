'use client'

import type { ModalProps, ModalRef, ModelType } from './types'
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import { CloseBtn } from '../CloseBtn'
import { Mask } from '../Mask'
import { DURATION, variantStyles } from './constants'
import { extendModal } from './extendModal'
import { Footer } from './Footer'
import { Header } from './Header'

const InnerModal = forwardRef<ModalRef, ModalProps>((
  props,
  ref,
) => {
  const {
    width = 400,
    height,
    minWidth = 320,

    isOpen,
    onClose,
    onOk,

    zIndex = 50,
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

    headerClassName,
    headerStyle,

    bodyClassName,
    bodyStyle,

    footerClassName,
    footerStyle,

    clickOutsideClose = false,
    escToClose = true,
    center = true,
  } = props
  const variantStyle = variantStyles[variant]
  const [open, setOpen] = useState(isOpen)

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && escToClose) {
        onClose?.()
      }
    },
    [escToClose, onClose],
  )

  useEffect(
    () => {
      if (open) {
        document.addEventListener('keydown', handleEscape)
      }
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    },
    [open, handleEscape],
  )

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
        style={ { zIndex } }
        className={ center
          ? undefined
          : 'items-start! pt-16' }
      >
        { showCloseBtn && <CloseBtn
          onClick={ onClose }
          mode="fixed"
          variant="filled"
          className="right-4 top-4"
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

  return createPortal(ModalContent, document.body)
})

export const Modal = memo<ModalProps>(InnerModal) as unknown as ModelType<typeof InnerModal>
Modal.displayName = 'Modal'

extendModal()
