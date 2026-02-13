'use client'

import { Bold, Italic, Link, List, MoreHorizontal, Redo, Search, Undo } from 'lucide-react'
import { Button } from '../Button'
import { Toolbar } from './Toolbar'

export default function ToolbarTest() {
  return (
    <div className="space-y-8 p-8 bg-background2 min-h-screen">
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
        <div className="flex justify-center p-12 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-dashed border-border">
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
    </div>
  )
}
