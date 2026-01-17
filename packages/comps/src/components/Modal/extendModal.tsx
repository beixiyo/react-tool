import type { ModalProps, ModalRef } from './types'
import { createRef } from 'react'
import { injectReactApp } from 'utils'
import { variantStyles } from './constants'
import { Modal } from './Modal'

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
          onOk={ () => {
            props?.onOk?.()
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
}
