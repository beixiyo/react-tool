import { createRef } from 'react'
import { injectReactApp } from 'utils'
import { variantStyles } from '../constants'
import { Modal } from '../Modal'
import type { ModalProps, ModalRef } from '../types'

/**
 * 命令式入口只负责挂载与卸载
 *
 * `onOk` 的 loading、自动关闭与「返回 false 保持打开」都在 `Modal` 本体里，
 * 声明式与命令式同一套语义；这里只把「关闭」接到卸载上
 */
export function extendModal() {
  const keys = Object.keys(variantStyles) as (keyof typeof variantStyles)[]
  keys.forEach((type) => {
    Modal[type] = (props: Partial<ModalProps>) => mount({ ...props, variant: type })
  })

  /**
   * 强化命令式调用：支持 Modal.show(Component, props)
   */
  Modal.show = (Component: any, props: Partial<ModalProps> = {}) => mount(props, <Component />)
}

function mount(props: Partial<ModalProps>, children?: React.ReactNode) {
  const modalRef = createRef<ModalRef>()

  const unmount = injectReactApp(
    <Modal
      { ...props }
      ref={ modalRef }
      open
      onClose={ () => {
        props.onClose?.()
        cleanup()
      } }
      onExitComplete={ () => {
        try {
          props.onExitComplete?.()
        }
        finally {
          if (isCleaned) queueMicrotask(unmount)
        }
      } }
    >
      { children ?? props.children }
    </Modal>,
    { inSandbox: false },
  )

  let isCleaned = false
  function cleanup() {
    if (isCleaned) return
    isCleaned = true
    // 已挂载时等面板与遮罩都退场；挂载前关闭则没有动画可等
    if (modalRef.current) modalRef.current.hide()
    else queueMicrotask(unmount)
  }

  return {
    close: cleanup,
  }
}
