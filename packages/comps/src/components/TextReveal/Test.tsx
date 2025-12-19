'use client'

import { Play } from 'lucide-react'
import { useState } from 'react'
import { TextReveal } from '.'
import { ThemeToggle } from '../ThemeToggle'

function App() {
  const [key, setKey] = useState(0)
  const sampleText = 'The quick brown fox jumps over the lazy dog. 🦊'

  return (
    <div className="h-screen overflow-auto from-background to-blue-600 bg-gradient-to-br p-8 text-textPrimary">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold">Text Reveal Animation Demo</h1>
        <ThemeToggle className="mb-6" />

        <div className="space-y-12">
          {/* Basic Example */ }
          <div className="rounded-lg bg-backgroundSecondary/50 p-8 border border-border">
            <h2 className="mb-4 text-xl font-semibold">Basic Example</h2>
            <TextReveal
              key={ `basic-${key}` }
              text={ sampleText }
              className="text-2xl"
            />
          </div>

          {/* Styled Example */ }
          <div className="rounded-lg bg-backgroundSecondary/50 p-8 border border-border">
            <h2 className="mb-4 text-xl font-semibold">Styled Example</h2>
            <TextReveal
              key={ `styled-${key}` }
              text={ sampleText }
              charClassName="hover:scale-110"
              transitionDuration="1s"
              delay={ 80 }
            />
          </div>

          {/* Custom Timing Example */ }
          <div className="rounded-lg bg-backgroundSecondary/50 p-8 border border-border">
            <h2 className="mb-4 text-xl font-semibold">Custom Timing Example</h2>
            <TextReveal
              key={ `custom-${key}` }
              text={ sampleText }
              className="text-2xl"
              delay={ 100 }
              transitionDuration="1.2s"
              easing="cubic-bezier(0.68, -0.55, 0.265, 1.55)"
              initialDelay={ 500 }
            />
          </div>
        </div>

        {/* Replay Button */ }
        <button
          onClick={ () => setKey(prev => prev + 1) }
          className="fixed bottom-8 right-8 rounded-full bg-backgroundSecondary p-4 text-textPrimary shadow-lg transition-colors hover:bg-border border border-border"
        >
          <Play className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}

export default App
