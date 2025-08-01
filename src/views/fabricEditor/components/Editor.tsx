import { cn } from '@/utils'
import { Canvas } from 'fabric'
import { motion } from 'framer-motion'

const InnerEditor = forwardRef<EditorRef, CanvasProps>((
  {
    fabricRef,
    className,
  },
  ref,
) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointRef = useRef<Point>({ left: 0, top: 0 })

  useEffect(() => {
    if (!canvasRef.current)
      return

    const rect = getRect()!
    fabricRef.current = new Canvas(canvasRef.current, {
      width: rect.width,
      height: rect.height,
      backgroundColor: '#fff',
      /** 在拖拽时，保持元素层级 */
      preserveObjectStacking: true,
    })

    fabricRef.current.on('mouse:up', ({ e }) => {
      // @ts-ignore
      pointRef.current = { left: e.offsetX, top: e.offsetY }
    })

    return () => {
      fabricRef.current?.dispose()
    }
  }, [])

  function getRect(): DOMRect | null {
    return wrapperRef.current?.getBoundingClientRect() || null
  }

  function getPoint(): Point {
    return pointRef.current
  }

  useImperativeHandle(ref, () => ({
    getRect,
    getPoint,
  }))

  return (
    <motion.div
      initial={ { opacity: 0, scale: 0.9 } }
      animate={ { opacity: 1, scale: 1 } }
      transition={ { duration: 0.5 } }
      className={ cn(
        'rounded-lg shadow-lg flex justify-center items-center',
        className,
      ) }
      ref={ wrapperRef }
    >
      <canvas
        ref={ canvasRef }
        className="border border-primary border-solid"
      />
    </motion.div>
  )
})

export const Editor = memo(InnerEditor) as typeof InnerEditor

interface CanvasProps {
  fabricRef: React.MutableRefObject<Canvas | null>
  className?: string
}

export type EditorRef = {
  getRect: () => DOMRect | null
  getPoint: () => Point
}

type Point = {
  left: number
  top: number
}
