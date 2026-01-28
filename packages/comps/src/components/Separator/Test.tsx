'use client'

import { Separator } from './Separator'

export default function SeparatorTest() {
  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      <section className="space-y-4">
        <h2 className="text-lg font-bold">Horizontal Separator</h2>
        <div className="p-4 border border-border rounded-lg space-y-2">
          <p className="text-sm">Above the line</p>
          <Separator orientation="horizontal" />
          <p className="text-sm">Below the line</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Vertical Separator</h2>
        <div className="flex items-center h-10 p-4 border border-border rounded-lg space-x-4">
          <span className="text-sm">Item 1</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Item 2</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Item 3</span>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Custom Styled</h2>
        <div className="p-4 border border-border rounded-lg space-y-4">
          <Separator orientation="horizontal" className="bg-brand h-0.5" />
          <div className="flex items-center justify-around h-20">
             <Separator orientation="vertical" className="bg-systemOrange w-1 h-full rounded-full" />
             <Separator orientation="vertical" className="bg-systemGreen w-1 h-1/2 rounded-full" />
             <Separator orientation="vertical" className="bg-systemBlue w-1 h-full rounded-full" />
          </div>
        </div>
      </section>
    </div>
  )
}
