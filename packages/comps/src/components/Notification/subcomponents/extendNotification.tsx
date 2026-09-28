import type { ReactNode } from 'react'
import { createRef } from 'react'
import { injectReactApp } from 'utils'
import { DURATION, variantStyles } from '../constants'
import { Notification } from '../Notification'
import type { NotificationOptions, NotificationRef, NotificationVariant } from '../types'

export function extendNotification() {
  const keys = Object.keys(variantStyles) as NotificationVariant[]

  keys.forEach((type) => {
    Notification[type] = (
      content: ReactNode,
      options?: NotificationOptions,
    ) => {
      const notificationRef = createRef<NotificationRef>()
      const {
        position = 'topRight',
        duration = type === 'loading'
          ? 0
          : DURATION,
        showClose = false,
        onClose,
        ...restOptions
      } = options || {}

      const unmount = injectReactApp(
        <Notification
          { ...restOptions }
          content={ content }
          variant={ type }
          position={ position }
          duration={ duration }
          showClose={ showClose }
          ref={ notificationRef }
          onClose={ () => {
            onClose?.()
            cleanup()
          } }
        />,
        {
          inSandbox: false,
        },
      )

      let isCleaned = false
      function cleanup() {
        if (isCleaned) return
        isCleaned = true
        notificationRef.current?.hide()

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
