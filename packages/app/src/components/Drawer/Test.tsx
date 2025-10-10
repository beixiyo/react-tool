'use client'

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import { useState } from 'react'
import { Drawer, DrawerFramer } from '.'

export default function DrawerDemo() {
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
    <div className="mx-auto py-10 container">
      <h1 className="mb-6 text-2xl font-bold">Drawer Component Demo</h1>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Tailwind CSS Version</h2>
          <div className="grid grid-cols-2 gap-4">
            {(['top', 'right', 'bottom', 'left'] as const).map(position => (
              <div key={ position } className="relative h-64 overflow-hidden border p-4">
                <h3 className="mb-2 text-lg font-semibold capitalize">
                  {position}
                  {' '}
                  Drawer
                </h3>
                <button
                  onClick={ () => toggleDrawer(position) }
                  className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                >
                  {getPositionIcon(position)}
                  Open
                  {' '}
                  {position}
                  {' '}
                  Drawer
                </button>

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
              <div key={ position } className="relative h-64 overflow-hidden border p-4">
                <h3 className="mb-2 text-lg font-semibold capitalize">
                  {position}
                  {' '}
                  Drawer
                </h3>

                <button
                  onClick={ () => toggleDrawer(position, true) }
                  className="flex items-center gap-2 rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
                >
                  {getPositionIcon(position)}
                  Open
                  {' '}
                  {position}
                  {' '}
                  Drawer
                </button>

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
  )
}
