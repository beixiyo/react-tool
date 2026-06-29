'use client'

import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'
import { Spacer } from './Spacer'

function SpacerTest() {
  return (
    <div className="min-h-screen bg-background p-8 text-text">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-bold">Flex Spacer (Horizontal Fill)</h2>
          <div className="flex items-center p-2 border border-border rounded-lg bg-background2">
            <div className="px-3 py-1 bg-brand text-white rounded-sm">Left</div>
            <Spacer orientation="horizontal" />
            <div className="px-3 py-1 bg-background4 text-text rounded-sm">Right</div>
          </div>
          <p className="text-xs text-text2">The spacer pushes "Right" to the end of the container.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold">Fixed Size Spacer</h2>
          <div className="flex items-center p-2 border border-border rounded-lg w-max">
            <div className="w-10 h-10 bg-systemBlue/20 rounded-sm" />
            <Spacer orientation="horizontal" size={ 40 } className="bg-border2/30" />
            <div className="w-10 h-10 bg-systemBlue/20 rounded-sm" />
            <Spacer orientation="horizontal" size="2rem" className="bg-border2/30" />
            <div className="w-10 h-10 bg-systemBlue/20 rounded-sm" />
          </div>
          <p className="text-xs text-text2">Visible background added to spacer for demonstration.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold">Vertical Stack with Spacer</h2>
          <div className="flex flex-col border border-border rounded-lg h-64 p-4">
            <div className="p-2 bg-background3 rounded-sm">Header</div>
            <Spacer orientation="vertical" size={ 20 } />
            <div className="p-2 bg-background3 rounded-sm">Sub-header</div>
            <Spacer orientation="vertical" size={ 10 } />
            <div className="p-2 bg-brand text-white rounded-sm">Footer (Pushed to bottom)</div>
          </div>
        </section>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default SpacerTest
