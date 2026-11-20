'use client'

import { useRef, useState } from 'react'
import { MOTION_TRANSITIONS } from '../Animate'
import { Button } from '../Button'
import { SizeTransition } from './SizeTransition'

export default function SizeTransitionTest() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLElement>(null)

  return (
    <main className="bg-background text-text min-h-screen space-y-4 p-6">
      <Button aria-expanded={ open } aria-controls="size-transition-demo" onClick={ () => setOpen(!open) }>
        切换尺寸
      </Button>
      <SizeTransition
        as="aside"
        ref={ panelRef }
        id="size-transition-demo"
        className="bg-background2 overflow-hidden rounded-lg"
        open={ open }
        variants={ {
          closed: { width: 80, height: 48 },
          open: { width: 260, height: 96 },
        } }
        transition={ MOTION_TRANSITIONS.smooth }
        whileHover={ { x: 2 } }
      >
        <p className="p-3">单节点宽高过渡</p>
      </SizeTransition>
      <SizeTransition
        as="a"
        href="#size-transition-demo"
        className="text-text2 inline-block"
        open={ open }
        animate={ {
          opacity: open
            ? 1
            : 0.5,
        } }
        transition={ { duration: 0.2 } }
      >
        显式 animate 覆盖默认状态
      </SizeTransition>
    </main>
  )
}
