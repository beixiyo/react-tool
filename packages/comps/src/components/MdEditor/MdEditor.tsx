'use client'

import type { ReactNode } from 'react'
import { useResizeObserver } from 'hooks'
import { Edit3, Eye, Maximize2, Minimize2 } from 'lucide-react'
import { motion } from 'motion/react'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from 'utils'
import { Button } from '../Button'
import { MacTabDot } from '../MacTabDot'
import { MdToHtml } from './MdToHtml'

export const MdEditor = memo(forwardRef<MdEditorRef, MdEditorProps>(({
  content = '',
  onChange,
  layout = 'auto',
  defaultEditMode = false,
  className,
  mdClassName,
  headerHeight = 56,
  placeholder = '开始编写你的 Markdown...',
  showFullscreen = true,
  title = 'Markdown Editor',
  renderHeader,
}, ref) => {
  const [isEditMode, setIsEditMode] = useState(defaultEditMode)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentLayout, setCurrentLayout] = useState<LayoutMode>('auto')
  const [isEditorScrolling, setIsEditorScrolling] = useState(false)
  const [isPreviewScrolling, setIsPreviewScrolling] = useState(false)
  const [verticalPanelHeight, setVerticalPanelHeight] = useState<number>()

  const containerRef = useRef<HTMLDivElement>(null)
  const editorPanelRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewPanelRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const syncVerticalPanelHeight = useCallback((height?: number) => {
    setVerticalPanelHeight((prev) => {
      if (height === undefined)
        return undefined

      const roundedHeight = Math.round(height)
      if (prev === roundedHeight)
        return prev
      return roundedHeight
    })
  }, [])

  useResizeObserver([editorPanelRef], (entry) => {
    if (!isEditMode || currentLayout !== 'vertical')
      return

    syncVerticalPanelHeight(entry.contentRect.height)
  })

  useEffect(() => {
    if (!isEditMode || currentLayout !== 'vertical') {
      if (verticalPanelHeight !== undefined)
        syncVerticalPanelHeight(undefined)
      return
    }

    const editorPanel = editorPanelRef.current
    if (!editorPanel)
      return

    const { height } = editorPanel.getBoundingClientRect()
    syncVerticalPanelHeight(height)
  }, [syncVerticalPanelHeight, content, isEditMode, currentLayout, verticalPanelHeight])

  /** 监听容器尺寸变化，自动调整布局 */
  useResizeObserver(
    [containerRef],
    () => {
      if (layout !== 'auto') {
        setCurrentLayout(layout === 'horizontal'
          ? 'horizontal'
          : 'vertical')
        return
      }

      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current
        const aspectRatio = clientWidth / clientHeight
        setCurrentLayout(aspectRatio > 1.2
          ? 'horizontal'
          : 'vertical')
      }
    },
  )

  /** 处理编辑模式切换 */
  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => {
      if (!prev) {
        /** 切换到编辑模式时聚焦 */
        setTimeout(() => {
          textareaRef.current?.focus()
        }, 100)
      }
      return !prev
    })
  }, [])

  /** 处理全屏切换 */
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  /** 处理滚动同步 */
  const handleEditorScroll = useCallback(() => {
    if (isPreviewScrolling || !textareaRef.current || !previewRef.current)
      return

    setIsEditorScrolling(true)

    const editor = textareaRef.current
    const preview = previewRef.current

    const editorScrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight)
    const previewTargetScrollTop = editorScrollPercentage * (preview.scrollHeight - preview.clientHeight)

    preview.scrollTop = previewTargetScrollTop

    setTimeout(() => setIsEditorScrolling(false), 100)
  }, [isPreviewScrolling])

  const handlePreviewScroll = useCallback(() => {
    if (isEditorScrolling || !textareaRef.current || !previewRef.current)
      return

    setIsPreviewScrolling(true)

    const editor = textareaRef.current
    const preview = previewRef.current

    const previewScrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight)
    const editorTargetScrollTop = previewScrollPercentage * (editor.scrollHeight - editor.clientHeight)

    editor.scrollTop = editorTargetScrollTop

    setTimeout(() => setIsPreviewScrolling(false), 100)
  }, [isEditorScrolling])

  /** 添加滚动事件监听 */
  useEffect(() => {
    const editorElem = textareaRef.current
    const previewElem = previewRef.current

    if (editorElem && previewElem && isEditMode) {
      editorElem.addEventListener('scroll', handleEditorScroll)
      previewElem.addEventListener('scroll', handlePreviewScroll)

      return () => {
        editorElem.removeEventListener('scroll', handleEditorScroll)
        previewElem.removeEventListener('scroll', handlePreviewScroll)
      }
    }
  }, [isEditMode, handleEditorScroll, handlePreviewScroll])

  useImperativeHandle(ref, () => ({
    toggleEditMode,
    toggleFullscreen,
    isEditMode,
    isFullscreen,
  }))

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  }

  const panelVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
  }

  const contentStyle: React.CSSProperties = {
    height: `calc(100% - ${headerHeight}px)`,
  }

  const defaultHeader = (
    <div
      className="flex items-center justify-between border-b border-gray-200/60 from-slate-50 to-gray-50 bg-linear-to-r px-5 py-3 dark:border-gray-700/60 dark:from-gray-800 dark:to-gray-900"
      style={ {
        height: headerHeight,
      } }
    >
      <div className="flex items-center gap-3">
        <MacTabDot />
        <h2 className="text-gray-800 font-semibold dark:text-gray-200">{ title }</h2>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={ toggleEditMode }
          rounded="lg"
          size="sm"
          designStyle="neumorphic"
          leftIcon={
            isEditMode
              ? <Eye size={ 16 } />
              : <Edit3 size={ 16 } />
          }
          iconOnly
        >
          {/* { isEditMode
              ? '预览'
              : '编辑' } */}
        </Button>

        { showFullscreen && (
          <Button
            onClick={ toggleFullscreen }
            rounded="lg"
            size="sm"
            designStyle="neumorphic"
            iconOnly
          >
            { isFullscreen
              ? <Minimize2 size={ 18 } />
              : <Maximize2 size={ 18 } /> }
          </Button>
        ) }
      </div>
    </div>
  )

  const MD = <MdToHtml
    ref={ previewRef }
    content={ content }
    className={ cn(
      'markdown-body max-w-none p-4 flex-1 min-h-0 w-full',
      mdClassName,
    ) }
  />

  return (
    <motion.div
      ref={ containerRef }
      className={ cn(
        'rounded-2xl shadow-xl border border-border3',
        isFullscreen
          ? 'fixed inset-2 z-50'
          : 'h-full relative',
        className,
      ) }
      variants={ containerVariants }
      initial="hidden"
      animate="visible"
      layout
    >
      {/* 头部工具栏 */ }
      {
        renderHeader === undefined
          ? defaultHeader
          : renderHeader === null
            ? null
            : renderHeader({
                isEditMode,
                toggleEditMode,
                isFullscreen,
                toggleFullscreen,
                title,
                showFullscreen,
              })
      }

      {/* 内容区域 */ }
      { isEditMode
        ? <motion.div
            key="edit-mode"
            className={ cn(
              'flex h-full min-h-0 overflow-hidden',
              currentLayout === 'horizontal'
                ? 'flex-row'
                : 'flex-col',
            ) }
            variants={ panelVariants }
            initial="hidden"
            animate="visible"
            exit="exit"
            style={ contentStyle }
          >
            {/* 编辑区域 */ }
            <div
              ref={ editorPanelRef }
              className={ cn(
                'flex-1 flex min-h-0 flex-col overflow-hidden',
                currentLayout === 'horizontal'
                  ? 'border-r border-gray-200 dark:border-gray-700'
                  : '',
              ) }
              data-panel="editor"
              style={ currentLayout === 'vertical' && verticalPanelHeight !== undefined
                ? {
                    flexBasis: `${verticalPanelHeight}px`,
                    maxHeight: `${verticalPanelHeight}px`,
                  }
                : undefined }
            >
              <textarea
                ref={ textareaRef }
                value={ content }
                onChange={ e => onChange?.(e.target.value) }
                placeholder={ placeholder }
                className="w-full flex-1 resize-none border-none bg-transparent p-4 text-sm text-gray-800 leading-relaxed font-mono outline-hidden dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                style={ {
                  minHeight: currentLayout === 'vertical'
                    ? '200px'
                    : 'auto',
                } }
              />
            </div>

            {/* 分隔线 */ }
            { currentLayout === 'vertical' && (
              <div className="h-px bg-gray-200 shrink-0 dark:bg-gray-700" />
            ) }

            {/* 预览区域 */ }
            <div
              ref={ previewPanelRef }
              className="flex-1 flex min-h-0 flex-col overflow-hidden"
              data-panel="preview"
              style={ currentLayout === 'vertical' && verticalPanelHeight !== undefined
                ? {
                    flexBasis: `${verticalPanelHeight}px`,
                    maxHeight: `${verticalPanelHeight}px`,
                  }
                : undefined }
            >
              { MD }
            </div>

          </motion.div>

        : <motion.div
            key="preview-mode"
            className="h-full overflow-auto"
            variants={ panelVariants }
            initial="hidden"
            animate="visible"
            exit="exit"
            style={ contentStyle }
          >
            { MD }
          </motion.div> }
    </motion.div>
  )
}))

MdEditor.displayName = 'MdEditor'

export interface MdEditorRef {
  toggleEditMode: () => void
  toggleFullscreen: () => void
  isEditMode: boolean
  isFullscreen: boolean
}

export type LayoutMode = 'auto' | 'horizontal' | 'vertical'

export interface HeaderControls {
  isEditMode: boolean
  toggleEditMode: () => void
  isFullscreen: boolean
  toggleFullscreen: () => void
  title?: string
  showFullscreen?: boolean
}

export interface MdEditorProps {
  /**
   * 初始内容
   * @default ''
   */
  content?: string
  /**
   * 内容变化回调
   */
  onChange?: (value: string) => void
  /**
   * 布局模式
   * @default 'auto'
   */
  layout?: LayoutMode
  /**
   * 初始是否为编辑模式
   * @default false
   */
  defaultEditMode?: boolean
  /**
   * 容器类名
   */
  className?: string
  /**
   * 编辑器类名
   */
  mdClassName?: string
  /**
   * 头部高度
   * @default 56
   */
  headerHeight?: number
  /**
   * 编辑器占位符
   * @default '开始编写你的 Markdown...'
   */
  placeholder?: string
  /**
   * 是否显示全屏按钮
   * @default true
   */
  showFullscreen?: boolean
  /**
   * 标题
   * @default 'Markdown Editor'
   */
  title?: string
  /**
   * 允许自定义头部
   */
  renderHeader?: ((controls: HeaderControls) => ReactNode) | null
}
