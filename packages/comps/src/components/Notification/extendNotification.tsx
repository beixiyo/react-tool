import type { ReactNode } from 'react'
import type { NotificationPosition, NotificationRef, NotificationVariant } from './types'
import { createRef } from 'react'
import { injectReactApp } from 'utils'
import { Notification } from '.'
import { DURATION, variantStyles } from './constants'

export function extendNotification() {
  const keys = Object.keys(variantStyles) as NotificationVariant[]

  keys.forEach((type) => {
    Notification[type] = (
      content: ReactNode,
      options?: {
        position?: NotificationPosition
        duration?: number
        showClose?: boolean
      },
    ) => {
      const notificationRef = createRef<NotificationRef>()
      const { position = 'topRight', duration = type === 'loading'
        ? 0
        : DURATION, showClose = false }
        = options || {}

      const unmount = injectReactApp(
        <Notification
          content={ content }
          variant={ type }
          position={ position }
          duration={ duration }
          showClose={ showClose }
          ref={ notificationRef }
          onClose={ () => {
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
