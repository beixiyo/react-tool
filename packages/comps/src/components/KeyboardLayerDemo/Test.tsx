'use client'

import { useKeyboardLayer } from 'hooks'
import { useState } from 'react'
import { Button } from '../Button'
import { Card } from '../Card'
import { Modal } from '../Modal'
import { Popover } from '../Popover'
import { ThemeToggle } from '../ThemeToggle'

export default function KeyboardLayerDemo() {
  const [modalOpen, setModalOpen] = useState(false)
  const [shortcutActive, setShortcutActive] = useState(false)
  const [shortcutCount, setShortcutCount] = useState(0)

  useKeyboardLayer({
    active: shortcutActive,
    keys: ['Enter'],
    altKey: true,
    onKeyDown: () => setShortcutCount(count => count + 1),
  })

  return (
    <main className="min-h-screen bg-background p-6 text-text">
      <div className="mx-auto max-w-xl space-y-6">
        <ThemeToggle />

        <Card title="Keyboard Layer" hoverEffect={ false } className="gap-4">
          <p className="text-sm leading-6 text-text2">
            激活后按 Alt + Enter，只有栈顶键盘层会响应
          </p>
          <div className="flex items-center gap-3">
            <Button onClick={ () => setShortcutActive(active => !active) }>
              { shortcutActive
                ? '停用快捷键层'
                : '激活快捷键层' }
            </Button>
            <span className="text-sm text-text2">
              触发次数：
              { shortcutCount }
            </span>
          </div>
        </Card>

        <Card title="嵌套浮层" hoverEffect={ false } className="gap-4">
          <p className="text-sm leading-6 text-text2">
            打开 Modal 后再打开 Popover。第一次按 Escape 只关闭 Popover，第二次才关闭 Modal
          </p>
          <Button onClick={ () => setModalOpen(true) }>打开嵌套浮层</Button>
        </Card>

        <Modal
          isOpen={ modalOpen }
          titleText="父级 Modal"
          onClose={ () => setModalOpen(false) }
          onOk={ () => setModalOpen(false) }
        >
          <Popover
            trigger="click"
            position="bottom"
            content={ <div className="max-w-60 p-3 text-sm text-text">我是栈顶子浮层</div> }
          >
            <Button variant="default">打开子级 Popover</Button>
          </Popover>
        </Modal>
      </div>
    </main>
  )
}
