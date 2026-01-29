import { Bell, Info, Menu, Settings } from 'lucide-react'
import { Popover } from '.'
import { ThemeToggle } from '../ThemeToggle'

export default function PopoverExample() {
  return (
    <div className="bg-backgroundSecondary p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between w-full">
          <h1 className="mb-8 text-3xl text-textPrimary font-bold hover:animate-shake">Popover Demo</h1>
          <ThemeToggle />
        </div>

        <div className="flex items-center justify-around rounded-lg bg-background border border-border p-6">
          <Popover
            contentClassName="p-4"
            onClose={ () => { console.log('close') } }
            onOpen={ () => { console.log('open') } }
            trigger="hover"
            position="top"
            content={ (
              <div className="w-64">
                <h3 className="mb-2 text-textPrimary font-semibold">Settings</h3>
                <p className="text-textSecondary">Hover popover with custom content at the top position.</p>
              </div>
            ) }
          >
            <button className="rounded-lg p-4 transition-colors hover:bg-backgroundSecondary">
              <Settings className="text-textSecondary" />
            </button>
          </Popover>

          <Popover
            contentClassName="p-4"
            trigger="click"
            position="bottom"
            content={ (
              <div className="w-64">
                <h3 className="mb-2 text-textPrimary font-semibold">Information</h3>
                <p className="text-textSecondary">Click popover with custom content at the bottom position.</p>
              </div>
            ) }
          >
            <button className="rounded-lg p-4 transition-colors hover:bg-backgroundSecondary">
              <Info className="text-textSecondary" />
            </button>
          </Popover>

          <Popover
            contentClassName="p-4"
            trigger="hover"
            position="left"
            content={ (
              <div className="w-64">
                <h3 className="mb-2 text-textPrimary font-semibold">Notifications</h3>
                <p className="text-textSecondary">Hover popover with custom content at the left position.</p>
              </div>
            ) }
          >
            <button className="rounded-lg p-4 transition-colors hover:bg-backgroundSecondary">
              <Bell className="text-textSecondary" />
            </button>
          </Popover>

          <Popover
            contentClassName="p-4"
            trigger="click"
            position="right"
            content={ (
              <div className="w-64">
                <h3 className="mb-2 text-textPrimary font-semibold">Menu</h3>
                <p className="text-textSecondary">Click popover with custom content at the right position.</p>
              </div>
            ) }
          >
            <button className="rounded-lg p-4 transition-colors hover:bg-backgroundSecondary">
              <Menu className="text-textSecondary" />
            </button>
          </Popover>
        </div>

        <div className="rounded-lg bg-background border border-border p-6">
          <h2 className="mb-4 text-xl text-textPrimary font-semibold">Features:</h2>
          <ul className="list-disc list-inside text-textSecondary space-y-2">
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
