'use client'

import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { Button } from '../Button'
import { Card } from '../Card'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'
import { Mask } from '.'

/** 自定义遮罩色（颜色本身是演示主体） */
const CUSTOM_MASK_STYLE = {
  backgroundColor: 'rgba(59, 130, 246, 0.25)',
  backdropFilter: 'blur(2px)',
}

function MaskTest() {
  const [open, setOpen] = useState(true)
  const [custom, setCustom] = useState(false)

  return (
    <Card
      className="min-h-screen rounded-none border-0 shadow-none"
      padding="lg"
      title="Mask 遮罩"
      headerActions={ <ThemeToggle /> }
      bodyClassName="space-y-8"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <Card title="控制" variant="glass" padding="lg">
          <div className="flex flex-wrap items-center gap-6">
            <Switch checked={ open } onChange={ setOpen } label="显示遮罩" />
            <Switch checked={ custom } onChange={ setCustom } label="自定义 backgroundColor / backdropFilter" />
          </div>
        </Card>

        <Card title="容器内遮罩（父元素需 relative）" variant="glass" padding="lg">
          <div className="border-border bg-background2 relative h-64 overflow-hidden rounded-xl border p-6">
            <h3 className="text-text text-lg font-semibold">被遮挡的内容</h3>
            <p className="text-text2 mt-2 text-sm">
              Mask 以 absolute inset-0 铺满最近的定位祖先，进入与退出时背景色和模糊度做过渡
            </p>

            <AnimatePresence>
              { open && (
                <Mask
                  style={ custom
                    ? CUSTOM_MASK_STYLE
                    : undefined }
                  onClick={ () => setOpen(false) }
                >
                  <Button
                    variant="primary"
                    onClick={ (e) => {
                      e.stopPropagation()
                      setOpen(false)
                    } }
                  >
                    关闭遮罩
                  </Button>
                </Mask>
              ) }
            </AnimatePresence>
          </div>
        </Card>

        <Card title="空内容遮罩" variant="glass" padding="lg">
          <div className="border-border bg-background2 text-text2 relative h-32 overflow-hidden rounded-xl border p-4 text-sm">
            无 children 时仅作为背景遮挡层
            <Mask />
          </div>
        </Card>
      </div>
    </Card>
  )
}

export default MaskTest
