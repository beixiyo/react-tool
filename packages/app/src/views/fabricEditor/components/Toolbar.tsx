import {
  Download,
  Image as ImageIcon,
  Pencil,
  Redo2,
  Trash2,
  Type,
  Undo2,
} from 'lucide-react'
import { motion } from 'motion/react'

export const Toolbar = memo<ToolbarProps>(({
  currentColor,
  setCurrentColor,
  onImgUpload,
  onBgImgUpload,
  onAddText,
  onToggleDraw,
  onDownload,
  onDelete,
  onUndo,
  onRedo,
  isDrawing,
}) => {
  return (
    <motion.div
      initial={ { x: -100, opacity: 0 } }
      animate={ { x: 0, opacity: 1 } }
      transition={ { duration: 0.5 } }
      className="w-44 flex flex-col gap-4 rounded-lg bg-background p-4 shadow-lg border border-border"
    >
      <div className="space-y-4">
        <button
          onClick={ onImgUpload }
          className="w-full flex items-center gap-2 rounded-lg bg-backgroundSecondary px-4 py-2 text-textPrimary transition-colors hover:bg-border"
        >
          <ImageIcon size={ 20 } />
          <span>Upload</span>
        </button>

        <button
          onClick={ onBgImgUpload }
          className="w-full flex items-center gap-2 rounded-lg bg-backgroundSecondary px-4 py-2 text-textPrimary transition-colors hover:bg-border"
        >
          <ImageIcon size={ 20 } />
          <span>Background</span>
        </button>

        <button
          onClick={ onAddText }
          className="w-full flex items-center gap-2 rounded-lg bg-backgroundSecondary px-4 py-2 text-textPrimary transition-colors hover:bg-border"
        >
          <Type size={ 20 } />
          <span>Text</span>
        </button>

        <button
          onClick={ onToggleDraw }
          className={ `w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDrawing
            ? 'bg-blue-600 text-white'
            : 'bg-backgroundSecondary text-textPrimary hover:bg-border'
          }` }
        >
          <Pencil size={ 20 } />
          <span>Draw</span>
        </button>

        <button
          onClick={ onDownload }
          className="w-full flex items-center gap-2 rounded-lg bg-backgroundSecondary px-4 py-2 text-textPrimary transition-colors hover:bg-border"
        >
          <Download size={ 20 } />
          <span>Download</span>
        </button>

        <button
          onClick={ onDelete }
          className="w-full flex items-center gap-2 rounded-lg toning-red px-4 py-2 transition-colors hover:bg-red-200 dark:hover:bg-red-800"
        >
          <Trash2 size={ 20 } />
          <span>Delete</span>
        </button>

        <button
          onClick={ onUndo }
          className="w-full flex items-center gap-2 rounded-lg bg-backgroundSecondary px-4 py-2 text-textPrimary transition-colors hover:bg-border"
        >
          <Undo2 size={ 20 } />
          <span>Undo</span>
        </button>

        <button
          onClick={ onRedo }
          className="w-full flex items-center gap-2 rounded-lg bg-backgroundSecondary px-4 py-2 text-textPrimary transition-colors hover:bg-border"
        >
          <Redo2 size={ 20 } />
          <span>Redo</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm text-textPrimary font-bold">Color</label>
        <input
          type="color"
          value={ currentColor }
          onChange={ e => setCurrentColor(e.target.value) }
          className="w-8 h-8 rounded border border-border cursor-pointer"
        />
      </div>
    </motion.div>
  )
})

type ToolbarProps = {
  currentColor: string
  setCurrentColor: (color: string) => void
  onImgUpload: () => void
  onBgImgUpload: () => void
  onAddText: () => void
  onToggleDraw: () => void
  onDownload: () => void
  onDelete: () => void
  onUndo: () => void
  onRedo: () => void
  isDrawing: boolean
}
