import { useUpdateEffect, useWorker } from 'hooks'
import NoiseWorker from '@/worker/noiseWorker?worker'

export default function NoiseDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isRenderingRef = useRef(false) // Ref to track rendering status
  const renderQueuedRef = useRef(false) // Ref to queue renders

  const {
    postMessage,
    onMessage,
    onError,
    terminate,
    unbindEvent,
    isReady,
  } = useWorker(NoiseWorker, { autoTerminate: false })

  // --- State for Noise Parameters ---
  const [dimension, setDimension] = useState<'1D' | '2D' | '3D'>('3D')
  const [scale, setScale] = useState(80)
  const [octaves, setOctaves] = useState(4)
  const [persistence, setPersistence] = useState(0.5)
  const [lacunarity, setLacunarity] = useState(2.0)
  const [zOffset, setZOffset] = useState(0)
  const [currentSeed, setCurrentSeed] = useState(() => Math.floor(Math.random() * 100000))
  const [seedInput, setSeedInput] = useState(String(currentSeed))

  // --- State for View / Interaction ---
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 500 }) // Default size

  const requestNoiseGeneration = (currentSeed?: number) => {
    if (isRenderingRef.current) {
      renderQueuedRef.current = true // Queue the request
      return
    }

    isRenderingRef.current = true // Mark as rendering

    const params: NoiseGenerationParams = {
      width: canvasSize.width,
      height: canvasSize.height,
      scale,
      octaves,
      persistence,
      lacunarity,
      offsetX: viewOffset.x,
      offsetY: viewOffset.y,
      offsetZ: zOffset,
      dimension, // Pass current dimension
      // Send seed only if explicitly forced (e.g., initial load or Apply Seed button)
      ...(currentSeed !== undefined && { seed: currentSeed }),
    }

    postMessage(params)
  }

  // --- Effect for Worker Setup & Cleanup ---
  useEffect(() => {
    if (!isReady) {
      return
    }

    const handleWorkerMessage = (event: MessageEvent) => {
      const canvas = canvasRef.current
      if (!canvas) {
        console.warn('Canvas not found for rendering.')
        return
      }

      const { pixelData, width: workerWidth, height: workerHeight, error: workerError } = event.data

      if (workerError) {
        console.error('Worker Error:', workerError)

        // Reset rendering flag even on error
        isRenderingRef.current = false
        if (renderQueuedRef.current) {
          renderQueuedRef.current = false
          requestNoiseGeneration()
        }
        return
      }

      // Check if we received valid data and dimensions
      if (
        pixelData instanceof ArrayBuffer
        && typeof workerWidth === 'number'
        && typeof workerHeight === 'number'
      ) {
        const ctx = canvas.getContext('2d')!

        // *** Crucial Check: Ensure the received data matches the *current* canvas size ***
        // If the canvas was resized *while* this worker was running, the dimensions might mismatch again.
        // In this case, it's safest to just discard the stale data.
        if (canvas.width !== workerWidth || canvas.height !== workerHeight) {
          console.warn(`Discarding stale worker data: Received ${workerWidth}x${workerHeight}, Canvas is now ${canvas.width}x${canvas.height}`)

          isRenderingRef.current = false // Reset rendering flag
          // If a render was queued, let it run (it will use the latest size)
          if (renderQueuedRef.current) {
            renderQueuedRef.current = false
            requestNoiseGeneration() // Request generation for the *new* current size
          }
          return // Ignore this stale data packet
        }

        // --- If dimensions match, proceed ---
        try {
          const dataArray = new Uint8ClampedArray(pixelData)

          if (dataArray.length !== workerWidth * workerHeight * 4) {
            console.error(`CRITICAL ERROR: Data length ${dataArray.length} STILL does not match expected ${workerWidth * workerHeight * 4}`)
          }
          else {
            // *** Use the dimensions received FROM THE WORKER ***
            const imageData = new ImageData(dataArray, workerWidth, workerHeight)
            ctx.putImageData(imageData, 0, 0)
          }
        }
        catch (error) {
          console.error('Error putting image data:', error)
          // Provide context if possible
          if (error instanceof DOMException && error.name === 'IndexSizeError') {
            console.error(`ImageData construction failed: Data length=${pixelData.byteLength}, Expected=${workerWidth * workerHeight * 4}, Width=${workerWidth}, Height=${workerHeight}`)
          }
        }
      }
      else {
        console.warn('Received unexpected or incomplete message from worker:', event.data)
      }

      // --- Reset rendering flag and handle queue (outside the if block to ensure it always runs) ---
      isRenderingRef.current = false // Mark rendering complete (or failed but processed)
      if (renderQueuedRef.current) {
        renderQueuedRef.current = false
        requestNoiseGeneration()
      }
    }

    const handleWorkerError = (error: ErrorEvent) => {
      console.error('Worker error event:', error.message, error)
      isRenderingRef.current = false
    }

    onMessage(handleWorkerMessage)
    onError(handleWorkerError)

    return unbindEvent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestNoiseGeneration, isReady])

  // --- Trigger Rerender when Canvas Size Changes ---
  useUpdateEffect(() => {
    if (isReady) {
      requestNoiseGeneration() // Redraw with new size
    }
  }, [canvasSize, isReady])

  // --- Effect to Redraw when Parameters Change ---
  useUpdateEffect(() => {
    requestNoiseGeneration()
  }, [scale, octaves, persistence, lacunarity, viewOffset, zOffset, dimension])

  // --- Event Handlers for Canvas Interaction ---
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true
    lastMousePosRef.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.style.cursor = 'grabbing'
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current)
      return

    const dx = e.clientX - lastMousePosRef.current.x
    const dy = e.clientY - lastMousePosRef.current.y

    setViewOffset(prev => ({
      x: prev.x - dx,
      y: prev.y - dy,
    }))

    lastMousePosRef.current = { x: e.clientX, y: e.clientY }
    // Redrawing is handled by the useEffect watching viewOffset
  }

  const handleMouseUpOrLeave = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      e.currentTarget.style.cursor = 'grab'
    }
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // World coordinates under mouse before zoom
    const worldXBefore = (viewOffset.x + mouseX) // No division by scale needed if offset is pixel-based
    const worldYBefore = (viewOffset.y + mouseY)

    const zoomIntensity = 0.1
    // Adjust scale based on scroll direction
    const zoomFactor = e.deltaY < 0
      ? 1 + zoomIntensity
      : 1 / (1 + zoomIntensity)
    const newScale = Math.max(5, Math.min(1000, scale * zoomFactor)) // Clamp scale

    // Calculate new offset to keep world point under mouse
    // Offset needs adjustment based on how much the view 'scaled' around the mouse point
    const newOffsetX = worldXBefore - (mouseX * (newScale / scale))
    const newOffsetY = worldYBefore - (mouseY * (newScale / scale))

    setScale(newScale) // Update scale state
    setViewOffset({ x: newOffsetX, y: newOffsetY }) // Update offset state

    // Redrawing is handled by the useEffect watching scale and viewOffset
  }

  // --- Handler for Apply Seed Button ---
  const handleApplySeed = () => {
    const newSeed = Number.parseInt(seedInput, 10)
    if (!Number.isNaN(newSeed)) {
      console.log(`Applying new seed: ${newSeed}`)
      setCurrentSeed(newSeed)
      requestNoiseGeneration(newSeed) // Force worker to use new seed
    }
    else {
      console.error('Invalid seed value. Please enter a number.')
    }
  }

  return (
    <div className="mx-auto min-h-screen flex gap-4 bg-gray-50 p-4 lg:flex-row">
      {/* Canvas Area */ }
      <div className="flex shrink-0 flex-col items-center">
        <canvas
          ref={ canvasRef }
          width={ canvasSize.width }
          height={ canvasSize.height }
          className="cursor-grab border border-gray-400 bg-white shadow-lg"
          onMouseDown={ handleMouseDown }
          onMouseMove={ handleMouseMove }
          onMouseUp={ handleMouseUpOrLeave }
          onMouseLeave={ handleMouseUpOrLeave }
          onWheel={ handleWheel }
        />
        <p className="mt-2 text-xs text-gray-500">Drag to pan, Scroll to zoom</p>
      </div>

      {/* Controls Area */ }
      <div className="grow border border-gray-200 rounded-lg bg-white p-4 shadow-xs">
        <h2 className="mb-4 border-b pb-2 text-xl font-semibold">Controls</h2>

        {/* Dimension Selection */ }
        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-700 font-medium">Noise Dimension:</label>
          <div className="flex gap-4">
            { (['1D', '2D', '3D'] as const).map(dim => (
              <label key={ dim } className="inline-flex items-center">
                <input
                  type="radio"
                  name="dimension"
                  value={ dim }
                  checked={ dimension === dim }
                  onChange={ () => setDimension(dim) }
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2 text-sm text-gray-800">{ dim }</span>
              </label>
            )) }
          </div>
          <p className="mt-1 text-xs text-gray-500">
            { dimension === '1D' && 'Visualizes 1D noise across the X-axis.' }
            { dimension === '2D' && 'Standard 2D noise map.' }
            { dimension === '3D' && 'Visualizes a 2D slice of 3D noise (use Z Offset).' }
          </p>
        </div>

        {/* Sliders */ }
        <SliderInput
          label="Scale"
          id="scale"
          min={ 5 }
          max={ 500 }
          step={ 1 }
          value={ scale }
          onChange={ setScale }
          displayFormat={ v => v.toFixed(0) }
        />
        <SliderInput
          label="Octaves"
          id="octaves"
          min={ 1 }
          max={ 10 }
          step={ 1 }
          value={ octaves }
          onChange={ setOctaves }
        />
        <SliderInput
          label="Persistence"
          id="persistence"
          min={ 0.1 }
          max={ 1.0 }
          step={ 0.01 }
          value={ persistence }
          onChange={ setPersistence }
          displayFormat={ v => v.toFixed(2) }
        />
        <SliderInput
          label="Lacunarity"
          id="lacunarity"
          min={ 1.1 }
          max={ 4.0 }
          step={ 0.1 }
          value={ lacunarity }
          onChange={ setLacunarity }
          displayFormat={ v => v.toFixed(1) }
        />
        <SliderInput
          label="Z Offset"
          id="zOffset"
          min={ -10 }
          max={ 10 }
          step={ 0.05 }
          value={ zOffset }
          onChange={ setZOffset }
          displayFormat={ v => v.toFixed(2) }
        // Disable Z offset if not in 3D mode
        // disabled={dimension !== '3D'} // Input range doesn't have disabled in HTML spec easily
        />
        { dimension !== '3D' && <p className="mb-2 text-xs text-gray-400 -mt-2">Z Offset only affects 3D noise.</p> }

        {/* Seed Control */ }
        <div className="mt-4 border-t pt-4">
          <label htmlFor="seedInput" className="mb-1 block text-sm text-gray-700 font-medium">
            Seed:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              id="seedInput"
              value={ seedInput }
              onChange={ e => setSeedInput(e.target.value) }
              className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-2xs focus:border-indigo-500 sm:text-sm focus:ring-indigo-500"
            />
            <button
              onClick={ handleApplySeed }
              className="whitespace-nowrap rounded-md bg-indigo-600 px-4 py-2 text-sm text-white font-medium shadow-2xs hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Apply Seed
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Current rendering seed:
            { currentSeed }
          </p>
        </div>

        {/* Debug Info (Optional) */ }
        <div className="mt-4 border-t pt-4 text-xs text-gray-500">
          <p>
            Offset X:
            { viewOffset.x.toFixed(2) }
          </p>
          <p>
            Offset Y:
            { viewOffset.y.toFixed(2) }
          </p>
          <p>
            Canvas:
            { canvasSize.width }
            x
            { canvasSize.height }
          </p>
          <p>
            Rendering:
            { isRenderingRef.current
              ? 'Yes'
              : 'No' }
          </p>
        </div>
      </div>
    </div>
  )
}

const SliderInput: React.FC<{
  label: string
  id: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  displayFormat?: (value: number) => string
}> = ({ label, id, min, max, step, value, onChange, displayFormat }) => (
  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
    <label htmlFor={ id } className="w-full shrink-0 text-sm text-gray-700 font-medium sm:w-32">
      { label }
      :
    </label>
    <input
      type="range"
      id={ id }
      min={ min }
      max={ max }
      step={ step }
      value={ value }
      onChange={ e => onChange(Number.parseFloat(e.target.value)) }
      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
    />
    <span className="w-16 text-right text-sm text-gray-600 font-mono dark:text-gray-400">
      { displayFormat
        ? displayFormat(value)
        : value }
    </span>
  </div>
)

export interface NoiseGenerationParams {
  width: number
  height: number
  scale: number
  octaves: number
  persistence: number
  lacunarity: number
  offsetX: number
  offsetY: number
  offsetZ: number
  dimension: '1D' | '2D' | '3D' // Add dimension control
  seed?: number // Sent only when explicitly changed
}
