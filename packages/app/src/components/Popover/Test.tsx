import { Bell, Info, Menu, Settings } from 'lucide-react'
import { Popover } from '.'

export default function PopoverExample() {
  return (
    <div className="bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="mb-8 text-3xl text-gray-900 font-bold hover:(animate-shake)">Popover Demo</h1>

        <div className="flex items-center justify-around rounded-lg bg-white p-6 shadow-xs">
          <Popover
            trigger="hover"
            position="top"
            content={ (
              <div className="w-64">
                <h3 className="mb-2 text-gray-900 font-semibold">Settings</h3>
                <p className="text-gray-600">Hover popover with custom content at the top position.</p>
              </div>
            ) }
          >
            <button className="rounded-lg p-4 transition-colors hover:bg-gray-100">
              <Settings className="text-gray-600" />
            </button>
          </Popover>

          <Popover
            trigger="click"
            position="bottom"
            content={ (
              <div className="w-64">
                <h3 className="mb-2 text-gray-900 font-semibold">Information</h3>
                <p className="text-gray-600">Click popover with custom content at the bottom position.</p>
              </div>
            ) }
          >
            <button className="rounded-lg p-4 transition-colors hover:bg-gray-100">
              <Info className="text-gray-600" />
            </button>
          </Popover>

          <Popover
            trigger="hover"
            position="left"
            content={ (
              <div className="w-64">
                <h3 className="mb-2 text-gray-900 font-semibold">Notifications</h3>
                <p className="text-gray-600">Hover popover with custom content at the left position.</p>
              </div>
            ) }
          >
            <button className="rounded-lg p-4 transition-colors hover:bg-gray-100">
              <Bell className="text-gray-600" />
            </button>
          </Popover>

          <Popover
            trigger="click"
            position="right"
            content={ (
              <div className="w-64">
                <h3 className="mb-2 text-gray-900 font-semibold">Menu</h3>
                <p className="text-gray-600">Click popover with custom content at the right position.</p>
              </div>
            ) }
          >
            <button className="rounded-lg p-4 transition-colors hover:bg-gray-100">
              <Menu className="text-gray-600" />
            </button>
          </Popover>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-xs">
          <h2 className="mb-4 text-xl font-semibold">Features:</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Supports multiple positions (top, bottom, left, right)</li>
            <li>Different trigger modes (hover, click)</li>
            <li>Smart positioning to avoid viewport edges</li>
            <li>Smooth animations with Framer Motion</li>
            <li>Fully responsive and accessible</li>
            <li>Custom content support (ReactNode)</li>
            <li>Event callbacks (onOpen, onClose)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
