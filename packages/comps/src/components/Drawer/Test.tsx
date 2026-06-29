'use client'

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import { useState } from 'react'
import { Drawer, DrawerFramer } from '.'
import { Button } from '../Button'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'

function DrawerDemo() {
  const [openDrawers, setOpenDrawers] = useState({
    top: false,
    right: false,
    bottom: false,
    left: false,
  })

  const [openFramerDrawers, setOpenFramerDrawers] = useState({
    top: false,
    right: false,
    bottom: false,
    left: false,
  })

  const toggleDrawer = (position: keyof typeof openDrawers, isFramer = false) => {
    if (isFramer) {
      setOpenFramerDrawers(prev => ({ ...prev, [position]: !prev[position] }))
    }
    else {
      setOpenDrawers(prev => ({ ...prev, [position]: !prev[position] }))
    }
  }

  const getPositionIcon = (position: keyof typeof openDrawers) => {
    switch (position) {
      case 'top':
        return <ArrowUp className="h-4 w-4" />
      case 'right':
        return <ArrowRight className="h-4 w-4" />
      case 'bottom':
        return <ArrowDown className="h-4 w-4" />
      case 'left':
        return <ArrowLeft className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background p-8 text-text">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Drawer 组件</h1>
            <p className="mt-1 text-sm text-text2">抽屉组件，支持四个方向打开，提供 Tailwind 与 Framer Motion 两种实现</p>
          </div>
          <ThemeToggle />
        </header>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="mb-4 text-xl font-semibold">Tailwind CSS Version</h2>
            <div className="grid grid-cols-2 gap-4">
              {(['top', 'right', 'bottom', 'left'] as const).map(position => (
                <div key={ position } className="relative h-64 overflow-hidden border border-border rounded-lg bg-background2 p-4">
                  <h3 className="mb-2 text-lg font-semibold capitalize">
                    {position}
                    {' '}
                    Drawer
                  </h3>
                  <Button
                    variant="primary"
                    leftIcon={ getPositionIcon(position) }
                    onClick={ () => toggleDrawer(position) }
                  >
                    Open
                    {' '}
                    {position}
                    {' '}
                    Drawer
                  </Button>

                  <Drawer
                    open={ openDrawers[position] }
                    onClose={ () => toggleDrawer(position) }
                    position={ position }
                  >
                    <div className="p-4">
                      <h4 className="mb-2 text-lg font-medium">Drawer Content</h4>
                      <p>
                        This drawer opens from the
                        {position}
                        .
                      </p>
                    </div>
                  </Drawer>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">Framer Motion Version</h2>
            <div className="grid grid-cols-2 gap-4">
              {(['top', 'right', 'bottom', 'left'] as const).map(position => (
                <div key={ position } className="relative h-64 overflow-hidden border border-border rounded-lg bg-background2 p-4">
                  <h3 className="mb-2 text-lg font-semibold capitalize">
                    {position}
                    {' '}
                    Drawer
                  </h3>

                  <Button
                    variant="success"
                    leftIcon={ getPositionIcon(position) }
                    onClick={ () => toggleDrawer(position, true) }
                  >
                    Open
                    {' '}
                    {position}
                    {' '}
                    Drawer
                  </Button>

                  <DrawerFramer
                    open={ openFramerDrawers[position] }
                    onClose={ () => toggleDrawer(position, true) }
                    position={ position }
                  >
                    <div className="p-4">
                      <h4 className="mb-2 text-lg font-medium">Drawer Content</h4>
                      <p>
                        This drawer opens from the
                        {position}
                        {' '}
                        with Framer Motion.
                      </p>
                    </div>
                  </DrawerFramer>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default DrawerDemo
