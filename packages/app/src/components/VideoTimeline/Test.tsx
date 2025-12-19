'use client'

import type { VideoFrame } from './types'
import { VideoTimeline } from '.'

export default function App() {
  const [frames, setFrames] = useState<VideoFrame[]>(() => createMockFrames(0, 30))
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [currentFrame, setCurrentFrame] = useState<VideoFrame | null>(null)

  const loadMoreFrames = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const startIndex = frames.length
    const newFrames = createMockFrames(startIndex, 20)

    if (startIndex + newFrames.length >= 60) {
      setHasMore(false)
    }
    setFrames(prevFrames => [...prevFrames, ...newFrames])
  }, [frames.length])

  const handleFrameChange = useCallback((frame: VideoFrame) => {
    setCurrentFrame(frame)
  }, [])

  return (
    <div className="h-screen flex flex-col overflow-auto bg-background p-6">
      <header className="mb-6">
        <h1 className="text-2xl text-textPrimary font-semibold">Video Editor</h1>
        <p className="text-textSecondary">Drag to select multiple frames or use the slider to navigate</p>
      </header>

      <div className="mx-auto mb-6 w-2xl rounded-lg bg-backgroundSecondary p-4 shadow-md border border-border">
        <h2 className="mb-2 text-lg text-textPrimary font-medium">Preview</h2>
        <div className="aspect-video flex items-center justify-center overflow-hidden rounded-md bg-backgroundSecondary">
          { currentFrame
            ? (
                <img
                  src={ currentFrame.src }
                  alt={ `Frame at ${currentFrame.timestamp.toFixed(2)}s` }
                  className="h-full w-full object-contain"
                />
              )
            : (
                <p className="text-textDisabled">No frame selected</p>
              ) }
        </div>
      </div>

      <div className="grow rounded-lg bg-backgroundSecondary p-4 shadow-md border border-border">
        <h2 className="mb-2 text-lg text-textPrimary font-medium">Timeline</h2>
        <VideoTimeline
          loadData={ loadMoreFrames }
          hasMore={ hasMore }
          data={ frames }
          onFrameChange={ handleFrameChange }
          className="mt-4"
        />
      </div>
    </div>
  )
}

function createMockFrames(startIndex: number, count: number): VideoFrame[] {
  return Array.from({ length: count }, (_, i) => {
    const index = startIndex + i
    return {
      id: `frame-${index}`,
      src: `https://picsum.photos/id/${(index % 30) + 10}/200/120`,
      timestamp: index * 0.5,
      metadata: {
        quality: Math.random() > 0.5
          ? 'HD'
          : 'SD',
        scene: `Scene ${Math.floor(index / 20) + 1}`,
      },
    }
  })
}
