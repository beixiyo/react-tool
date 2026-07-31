'use client'

import { useState } from 'react'
import { Button } from '../Button'
import { Card } from '../Card'
import { Modal } from '../Modal'
import { Popover } from '../Popover'
import { ThemeToggle } from '../ThemeToggle'

export default function EscapeLayerDemo() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-background p-6 text-text">
      <div className="mx-auto max-w-xl space-y-6">
        <ThemeToggle />

        <Card
          title="Escape Layer"
          hoverEffect={ false }
          className="gap-4"
        >
          <p className="text-sm leading-6 text-text2">
            打开 Modal 后再打开其中的 Popover。第一次按 Escape 只关闭 Popover，第二次才关闭 Modal。
          </p>

          <Button onClick={ () => setModalOpen(true) }>
            打开嵌套浮层演示
          </Button>
        </Card>

        <Modal
          isOpen={ modalOpen }
          titleText="父级 Modal"
          onClose={ () => setModalOpen(false) }
          onOk={ () => setModalOpen(false) }
        >
          <div className="space-y-4">
            <p className="text-sm text-text2">
              Popover 打开时，Escape 会优先交给位于栈顶的 Popover。
            </p>

            <Popover
              trigger="click"
              position="bottom"
              content={ (
                <div className="max-w-60 p-3 text-sm text-text">
                  我是子浮层。按一次 Escape 只会关闭我。
                </div>
              ) }
            >
              <Button variant="default">打开子级 Popover</Button>
            </Popover>
          </div>
        </Modal>
      </div>
    </main>
  )
}
