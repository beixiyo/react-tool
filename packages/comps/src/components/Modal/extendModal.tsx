import type { ModalProps, ModalRef } from './types'
import { createRef } from 'react'
import { injectReactApp } from 'utils'
import { variantStyles } from './constants'
import { Modal } from './Modal'

function handleModalOk(onOk: ModalProps['onOk'] | undefined, cleanup: () => void) {
  const result = onOk?.()
  if (result && typeof (result as any).then === 'function') {
    ;(result as Promise<unknown>).then(() => {
      cleanup()
    })
  }
  else {
    cleanup()
  }
}

export function extendModal() {
  const keys = Object.keys(variantStyles) as (keyof typeof variantStyles)[]
  keys.forEach((type) => {
    Modal[type] = (props: Partial<ModalProps>) => {
      const modalRef = createRef<ModalRef>()

      const unmount = injectReactApp(
        <Modal
          { ...props }
          isOpen
          variant={ type }
          ref={ modalRef }
          onClose={ () => {
            props?.onClose?.()
            cleanup()
          } }
          onOk={ () => handleModalOk(props?.onOk, cleanup) }
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
      <Modal
        { ...props }
        isOpen
        ref={ modalRef }
        onClose={ () => {
          props?.onClose?.()
          cleanup()
        } }
        onOk={ () => handleModalOk(props?.onOk, cleanup) }
      >
        <Component />
      </Modal>,
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
