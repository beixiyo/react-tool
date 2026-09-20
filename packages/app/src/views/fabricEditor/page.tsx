// oxlint-disable no-unused-expressions
import { GithubSourceLink } from '@/components/GithubSourceLink'
import { addImg, addText, createUnReDoList, delSelected, drawBgImg, enableDraw, exportJson, handleTextSelection, listenTextSelection, loadJson } from '@/utils'
import { blobToBase64 } from '@jl-org/tool'
import type { UploaderRef } from 'comps'
import { Uploader } from 'comps'
import type { Canvas, Textbox } from 'fabric'
import { useCustomEffect, useLatestCallback } from 'hooks'
import { motion } from 'motion/react'
import type { EditorRef } from './components/Editor'
import { Editor } from './components/Editor'
import { Toolbar } from './components/Toolbar'
import { createPosterMask } from './tool'

function App() {
  const fabricRef = useRef<Canvas | null>(null)
  const editorRef = useRef<EditorRef>(null)
  const imgMode = useRef<'img' | 'bg'>('img')
  const lastTextRef = useRef<Textbox | null>(null)

  const unRedoRef = useRef(createUnReDoList<string>())
  const needRecord = useRef(true)

  const [currentColor, setCurrentColor] = useState('#000000')
  const [isDrawing, setIsDrawing] = useState(false)
  const uploaderRef = useRef<UploaderRef>(null)

  /***************************************************
   *                    Events
   ***************************************************/

  const handleImg = useLatestCallback(() => {
    imgMode.current = 'img'
    uploaderRef.current?.click()
  })

  const handleBgImg = useLatestCallback(() => {
    imgMode.current = 'bg'
    uploaderRef.current?.click()
  })

  const handleFileChange = useLatestCallback(async (files: File[]) => {
    if (!fabricRef.current || !files.length) return
    /**
     * 必须用 data URL：撤销 / 重做与导出走 fabric 的 `toJSON()`，图片 `src` 会被原样序列化，
     * blob URL 一旦 revoke 快照就再也加载不回来；不 revoke 则导出的 JSON 离开本页即失效
     */
    const src = await blobToBase64(files[0])
    if (!fabricRef.current) return

    await (imgMode.current === 'img'
      ? addImg(fabricRef.current, src, { center: true, autoFit: true })
      : drawBgImg(fabricRef.current, src, { center: true, autoFit: true, needClear: true }))
  })

  const handleAddText = useCallback(() => {
    if (!fabricRef.current) return

    lastTextRef.current = addText(fabricRef.current, {
      fill: currentColor,
      getLastEl: () => lastTextRef.current,
      ...editorRef.current?.getPoint(),
    })
  }, [currentColor])

  const handleToggleDraw = useCallback(() => {
    if (!fabricRef.current) return

    setIsDrawing((isDrawing) => {
      if (!fabricRef.current) return isDrawing

      const res = !isDrawing
      // oxlint-disable-next-line no-unused-expressions
      res
        ? fabricRef.current!.isDrawingMode = true
        : fabricRef.current!.isDrawingMode = false

      // oxlint-disable-next-line no-unused-expressions
      res && enableDraw(fabricRef.current, (brush) => brush.color = currentColor)

      return res
    })
  }, [currentColor])

  const handleDownload = useLatestCallback(() => {
    if (!fabricRef.current) return

    const dataUrl = fabricRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    })
    const link = document.createElement('a')
    link.download = 'canvas-image.png'
    link.href = dataUrl
    link.click()
  })

  const handleDelete = useLatestCallback(() => {
    if (!fabricRef.current) return
    delSelected(fabricRef.current)
  })

  const changeNeedRecord = useLatestCallback(() => {
    needRecord.current = false
    setTimeout(() => {
      needRecord.current = true
    }, 4)
  })

  const handleUndo = useLatestCallback(() => {
    if (!fabricRef.current) return

    changeNeedRecord()
    unRedoRef.current.undo((json) => {
      // oxlint-disable-next-line no-unused-expressions
      json
        ? loadJson(fabricRef.current!, json)
        : fabricRef.current!.clear()
    })
  })

  const handleRedo = useLatestCallback(() => {
    if (!fabricRef.current) return

    changeNeedRecord()
    unRedoRef.current.redo((json) => {
      // oxlint-disable-next-line no-unused-expressions
      json && loadJson(fabricRef.current!, json)
    })
  })

  /***************************************************
   *                    Watch
   ***************************************************/

  useEffect(
    () => {
      if (!fabricRef.current) return

      const canvas = fabricRef.current

      /**
       * 处理画笔颜色
       */
      if (canvas?.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = currentColor
      }

      /**
       * 记录历史
       */
      const record = () => needRecord.current && unRedoRef.current.add(exportJson(canvas))
      canvas.on('object:added', record)
      canvas.on('object:modified', record)

      /**
       * 处理文本选择的颜色
       */
      handleTextSelection(canvas, currentColor, record)
      const unbindTextSelection = listenTextSelection(canvas, currentColor, record)

      return () => {
        canvas.off('object:added', record)
        canvas.off('object:modified', record)
        unbindTextSelection()
      }
    },
    [currentColor],
  )

  useCustomEffect(
    async () => {
      const canvas = fabricRef.current
      if (!canvas) return

      const url = new URL('@/components/CutoutImg/assets/bed.png', import.meta.url).href
      const bgImgUrl = await createPosterMask(canvas, url)
      await drawBgImg(canvas, bgImgUrl, { autoFit: true, center: true, needClear: true })
    },
    [],
  )

  return (
    <motion.div
      initial={ { opacity: 0 } }
      animate={ { opacity: 1 } }
      className="h-screen flex gap-4 p-4 bg-background"
    >
      <Uploader
        ref={ uploaderRef }
        autoClear
        onChange={ handleFileChange }
        accept="image/*"
        className="hidden"
      />

      <Toolbar
        currentColor={ currentColor }
        setCurrentColor={ setCurrentColor }
        onImgUpload={ handleImg }
        onBgImgUpload={ handleBgImg }
        onAddText={ handleAddText }
        onToggleDraw={ handleToggleDraw }
        onDownload={ handleDownload }
        onDelete={ handleDelete }
        onRedo={ handleRedo }
        onUndo={ handleUndo }
        isDrawing={ isDrawing }
      />

      <Editor
        fabricRef={ fabricRef }
        ref={ editorRef }
        className="flex-1"
      />

      <GithubSourceLink />
    </motion.div>
  )
}

export default App
