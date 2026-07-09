import type { ModalProps, ModalRef } from './types'
import { createRef, forwardRef, useState } from 'react'
import { injectReactApp } from 'utils'
import { variantStyles } from './constants'
import { Modal } from './Modal'

/**
 * 命令式 Modal 的包装组件
 *
 * 负责为异步 `onOk` 自动维护 `okLoading`：
 * - 同步 `onOk`（无返回值或非 Promise）→ 立即 cleanup，行为与旧版一致；返回 false 则保持打开
 * - 异步 `onOk`（返回 Promise）→ 触发时置 loading，期间禁止重复提交；resolve 后 cleanup；resolve false 则保持打开；reject 时复位 loading 并保持打开（不再吞掉错误）
 */
const ImperativeModal = forwardRef<ModalRef, ImperativeModalProps>((props, ref) => {
  const { onOk, cleanup, children, ...rest } = props
  const [okLoading, setOkLoading] = useState(false)

  const handleOk = () => {
    if (okLoading)
      return

    const result = onOk?.()
    if (result && typeof (result as any).then === 'function') {
      setOkLoading(true)
      ;(result as Promise<unknown>)
        .then((value) => {
          setOkLoading(false)
          if (value !== false)
            cleanup()
        })
        .catch((err) => {
          setOkLoading(false)
          console.error('[Modal] onOk rejected:', err)
        })
    }
    else {
      if (result !== false)
        cleanup()
    }
  }

  return (
    <Modal
      { ...rest }
      ref={ ref }
      isOpen
      okLoading={ okLoading }
      onOk={ handleOk }
    >
      { children }
    </Modal>
  )
})
ImperativeModal.displayName = 'ImperativeModal'

export function extendModal() {
  const keys = Object.keys(variantStyles) as (keyof typeof variantStyles)[]
  keys.forEach((type) => {
    Modal[type] = (props: Partial<ModalProps>) => {
      const modalRef = createRef<ModalRef>()

      const unmount = injectReactApp(
        <ImperativeModal
          { ...props }
          variant={ type }
          ref={ modalRef }
          onOk={ props?.onOk }
          cleanup={ () => cleanup() }
          onClose={ () => {
            props?.onClose?.()
            cleanup()
          } }
        />,
        {
          inSandbox: false,
        },
      )

      let isCleaned = false
      function cleanup() {
        if (isCleaned)
          return
        isCleaned = true
        modalRef.current?.hide()

        setTimeout(() => {
          unmount()
        }, 300)
      }

      return {
        close: cleanup,
      }
    }
  })

  /**
   * 强化命令式调用：支持 Modal.show(Component, props)
   */
  Modal.show = (Component: any, props: Partial<ModalProps> = {}) => {
    const modalRef = createRef<ModalRef>()

    const unmount = injectReactApp(
      <ImperativeModal
        { ...props }
        ref={ modalRef }
        onOk={ props?.onOk }
        cleanup={ () => cleanup() }
        onClose={ () => {
          props?.onClose?.()
          cleanup()
        } }
      >
        <Component />
      </ImperativeModal>,
      { inSandbox: false },
    )

    let isCleaned = false
    function cleanup() {
      if (isCleaned)
        return
      isCleaned = true
      modalRef.current?.hide()
      setTimeout(() => unmount(), 300)
    }

    return { close: cleanup }
  }
}

type ImperativeModalProps = {
  /** cleanup 由外部命令式调用注入，用于关闭并卸载 Modal */
  cleanup: () => void
} & Partial<ModalProps>
