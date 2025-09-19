'use client'

import { Play } from 'lucide-react'
import { TextReveal } from './'

function App() {

  const [key, setKey] = useState(0)
  const sampleText = 'The quick brown fox jumps over the lazy dog. 🦊'

  return (
    <div className="min-h-screen from-gray-900 to-blue-800 bg-linear-to-br p-8 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold">Text Reveal Animation Demo</h1>

        <div className="space-y-12">
          {/* Basic Example */ }
          <div className="rounded-lg bg-gray-800/50 p-8">
            <h2 className="mb-4 text-xl font-semibold">Basic Example</h2>
            <TextReveal
              key={ `basic-${key}` }
              text={ sampleText }
              className="text-2xl"
            />
          </div>

          {/* Styled Example */ }
          <div className="rounded-lg bg-gray-800/50 p-8">
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
          <div className="rounded-lg bg-gray-800/50 p-8">
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
          className="fixed bottom-8 right-8 rounded-full bg-white p-4 text-gray-900 shadow-lg transition-colors hover:bg-gray-100"
        >
          <Play className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}

export default App
