import type { ReactNode } from 'react'
import type { MessageProps, MessageRef, MessageVariant } from './types'
import { isObj } from '@jl-org/tool'
import { createRef } from 'react'
import { injectReactApp } from 'utils'
import { Message } from '.'
import { DURATION, variantStyles } from './constants'

export function extendMessage() {
  const keys = Object.keys(variantStyles) as MessageVariant[]

  keys.forEach((type) => {
    Message[type] = (contentOrProps: ReactNode | Partial<MessageProps>, duration?: number) => {
      const isProps = isObj(contentOrProps) && 'content' in contentOrProps
      const userProps = isProps ? (contentOrProps as Partial<MessageProps>) : { content: contentOrProps as ReactNode }
      const content = userProps.content!

      const messageRef = createRef<MessageRef>()
      const finalDuration = duration ?? userProps.duration ?? (type === 'loading' ? 0 : DURATION)

      const unmount = injectReactApp(
        <Message
          variant={ type }
          { ...userProps }
          content={ content }
          duration={ finalDuration }
          ref={ messageRef }
          onClose={ () => {
            cleanup()
            userProps.onClose?.()
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
        messageRef.current?.hide()

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
