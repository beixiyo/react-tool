'use client'

import { Bold, Italic, Link, List, MoreHorizontal, Redo, Search, Undo } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from 'utils'
import { Button } from '../Button'
import { ThemeToggle } from '../ThemeToggle'
import { useMenuNavigation } from './hooks/useMenuNavigation'
import { Toolbar } from './Toolbar'

const MENU_ITEMS = [
  { label: 'Heading 1' },
  { label: 'Heading 2', disabled: true },
  { label: 'Bullet list' },
  { label: 'Code block' },
  { label: 'Quote', disabled: true },
]

/** useMenuNavigation 演示：监听只绑在列表容器上，跳过禁用项，Tab 可离开 */
function MenuNavigationDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const { selectedIndex, setSelectedIndex } = useMenuNavigation({
    containerRef,
    items: MENU_ITEMS,
    isItemDisabled: (item) => !!item.disabled,
    onSelect: (item) => setPicked(item.label),
    onClose: () => containerRef.current?.blur(),
  })

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={ containerRef }
        role="listbox"
        tabIndex={ 0 }
        aria-activedescendant={ selectedIndex === undefined || selectedIndex < 0
          ? undefined
          : `menu-nav-${selectedIndex}` }
        className="w-60 flex flex-col gap-1 rounded-[20px] bg-background p-2 shadow-card outline-hidden focus-visible:ring-2 focus-visible:ring-border3"
      >
        { MENU_ITEMS.map((item, index) => (
          <div
            key={ item.label }
            id={ `menu-nav-${index}` }
            role="option"
            aria-selected={ selectedIndex === index }
            aria-disabled={ item.disabled || undefined }
            className={ cn(
              'h-9 flex items-center rounded-[10px] px-2 text-sm',
              item.disabled
                ? 'text-textDisabled'
                : 'cursor-pointer text-text',
              selectedIndex === index && 'bg-background3',
            ) }
            onMouseEnter={ () => !item.disabled && setSelectedIndex(index) }
            onClick={ () => !item.disabled && setPicked(item.label) }
          >
            { item.label }
          </div>
        )) }
      </div>
      <p className="text-xs text-text3">
        聚焦列表后用 ↑ ↓ / Home / End 移动（跳过禁用项）、Enter 选择、Tab 正常离开。已选：{ picked ?? '无' }
      </p>
    </div>
  )
}

function ToolbarTest() {
  return (
    <div className="p-8 bg-background2 min-h-screen text-text">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Toolbar 组件</h1>
            <p className="mt-1 text-sm text-text2">工具栏容器，支持分组、分隔符与固定/浮动两种形态</p>
          </div>
          <ThemeToggle />
        </header>

        <section>
          <h2 className="text-lg font-bold mb-4">Fixed Toolbar (Default)</h2>
          <div className="border border-border rounded-lg overflow-hidden bg-background">
            <Toolbar>
              <Toolbar.Group>
                <Button variant="ghost" size="sm" tooltip="Undo">
                  <Undo className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" tooltip="Redo">
                  <Redo className="size-4" />
                </Button>
              </Toolbar.Group>

              <Toolbar.Separator />

              <Toolbar.Group>
                <Button variant="ghost" size="sm" tooltip="Bold">
                  <Bold className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" tooltip="Italic">
                  <Italic className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" tooltip="Link">
                  <Link className="size-4" />
                </Button>
              </Toolbar.Group>

              <Toolbar.Separator />

              <Toolbar.Group>
                <Button variant="ghost" size="sm" leftIcon={ <List className="size-4" /> }>
                  List
                </Button>
              </Toolbar.Group>

              <div className="flex-1" />

              <Toolbar.Group>
                <Button variant="ghost" size="sm" iconOnly>
                  <Search className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" iconOnly>
                  <MoreHorizontal className="size-4" />
                </Button>
              </Toolbar.Group>
            </Toolbar>
            <div className="h-32 p-4 text-text2 text-sm">
              Editor content area...
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4">Floating Toolbar</h2>
          <div className="flex justify-center p-12 bg-background3 rounded-xl border border-dashed border-border">
            <Toolbar variant="floating" className="shadow-xl">
              <Toolbar.Group>
                <Button variant="ghost" size="sm" iconOnly tooltip="Bold">
                  <Bold className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" iconOnly tooltip="Italic">
                  <Italic className="size-4" />
                </Button>
              </Toolbar.Group>
              <Toolbar.Separator />
              <Toolbar.Group>
                <Button variant="ghost" size="sm" iconOnly tooltip="Link">
                  <Link className="size-4" />
                </Button>
              </Toolbar.Group>
            </Toolbar>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4">useMenuNavigation</h2>
          <MenuNavigationDemo />
        </section>
      </div>

    </div>
  )
}

export default ToolbarTest
