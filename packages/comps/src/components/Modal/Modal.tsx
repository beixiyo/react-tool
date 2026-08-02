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
    minWidth = 400,
    minHeight,
    autoHeight = false,

    isOpen,
    onClose,
    onExitComplete,
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
    fixedCloseBtn,
    innerCloseBtn,

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
  /** 是否提供了有效宽度：区分 undefined 与 0/''，决定走 style.width 还是兜底类 */
  const hasWidth = width != null && width !== ''
  /** 没有显式给高度时，默认按内容自适应 */
  const shouldAutoHeight = autoHeight || height == null
  const resolvedMinHeight = minHeight ?? (shouldAutoHeight
    ? 0
    : 182)
  const [open, setOpen] = useState(isOpen)

  /** 接入全局栈：自增 z-index、栈顶感知、仅栈顶响应 ESC */
  const { zIndex: autoZIndex, isTop } = useModalStack({
    open,
    zIndex: zIndexProp,
    escToClose,
    onClose,
  })
  /** 用户显式传入的 zIndex 优先；否则用栈分配的递增值，未就绪时回退到基础层级 */
  const zIndex = zIndexProp ?? autoZIndex ?? Z.modal
  const fixedCloseBtnConfig = typeof fixedCloseBtn === 'object'
    ? fixedCloseBtn
    : {}
  const {
    variant: fixedCloseBtnVariant,
    className: fixedCloseBtnClassName,
    size: fixedCloseBtnSize,
    ...fixedCloseBtnProps
  } = fixedCloseBtnConfig
  const innerCloseBtnConfig = typeof innerCloseBtn === 'object'
    ? innerCloseBtn
    : {}
  const {
    variant: innerCloseBtnVariant,
    className: innerCloseBtnClassName,
    size: innerCloseBtnSize,
    ...innerCloseBtnProps
  } = innerCloseBtnConfig
  const showFixedCloseBtn = !!fixedCloseBtn
  const showInnerCloseBtn = !!innerCloseBtn

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
    <AnimatePresence onExitComplete={ onExitComplete }>
      { open && <Mask
        data-modal-top={ isTop }
        style={ {
          zIndex,
          ...(!isTop
            ? { backgroundColor: 'transparent' }
            : {}),
        } }
        className={ cn(
          'fixed',
          !center && 'items-start! pt-16',
          maskClassName,
        ) }
      >
        { showFixedCloseBtn && <CloseBtn
          { ...fixedCloseBtnProps }
          onClick={ onClose }
          mode="fixed"
          variant={ fixedCloseBtnVariant ?? 'filled' }
          className={ cn('z-modal right-4 top-4', fixedCloseBtnClassName) }
          size={ fixedCloseBtnSize ?? 'xl' }
        />}

        <div
          onClick={ clickOutsideClose
            ? onClose
            : undefined }
          className="fixed inset-0"
        ></div>

        <motion.div
          className={ cn(
            'relative flex flex-col max-h-[90vh] rounded-3xl bg-background text-text shadow-card',
            bordered && 'border border-border',
            shouldAutoHeight && 'h-fit',
            /** 仅在未提供有效宽度时使用兜底类，避免与下方 style.width 语义冲突（区分 undefined 与 0/''） */
            !hasWidth && 'w-[calc(100vw-2rem)] max-w-2xl',
            'mx-auto',
            variantStyle.bg,
            variantStyle.border,
          ) }
          style={ {
            ...(hasWidth
              ? { width }
              : {}),
            minWidth: `${minWidth}px`,
            minHeight: `${resolvedMinHeight}px`,
            height: shouldAutoHeight
              ? undefined
              : height,
            ...style,
          } }
          initial={ { scale: 0.5, opacity: 0 } }
          animate={ { scale: 1, opacity: 1 } }
          exit={ { scale: 0.5, opacity: 0 } }
          transition={ { duration: DURATION } }
        >
          { showInnerCloseBtn && <CloseBtn
            { ...innerCloseBtnProps }
            onClick={ onClose }
            mode="absolute"
            variant={ innerCloseBtnVariant ?? 'default' }
            className={ cn('right-4 top-3 z-1', innerCloseBtnClassName) }
            size={ innerCloseBtnSize ?? 'md' }
          />}

          <div className={ cn(
            shouldAutoHeight
              ? 'flex-none flex flex-col gap-4 p-6'
              : 'flex-1 min-h-0 flex flex-col gap-4 p-6',
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
