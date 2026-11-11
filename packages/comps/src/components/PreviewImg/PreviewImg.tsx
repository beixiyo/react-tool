'use client'

import { downloadByUrl } from '@jl-org/tool'
import { useLatestCallback, useWheelDirection } from 'hooks'
import { Copy, Download } from 'lucide-react'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { Z } from '../../constants/z-index'
import { useT } from '../../i18n'
import { CloseBtn } from '../CloseBtn'
import { ContextMenu, ContextMenuItem } from '../ContextMenu'
import type { ContextMenuRef } from '../ContextMenu'
import { ImgThumbnails } from '../ImgThumbnails'
import { Loading } from '../Loading'
import { Mask } from '../Mask'
import { Message } from '../Message'
import { SafePortal } from '../SafePortal'
import { usePreviewKeyboard } from './hooks/usePreviewKeyboard'
import { usePreviewLayout } from './hooks/usePreviewLayout'
import { PREVIEW_CLOSE_SIZE } from './layoutConstants'
import { ControlButtons } from './subcomponents/ControlButtons'
import { NavArrows } from './subcomponents/NavArrows'
import { PreviewImage } from './subcomponents/PreviewImage'
import type { ControlButtonName, PreviewImgCopyResult, PreviewImgOverlayCtx, PreviewImgProps, PreviewImgRef } from './types'
import { copyImageToClipboard } from './utils'

/** 复制反馈提示要盖在预览层之上 */
const COPY_TOAST_Z_INDEX = Z.preview + 1

const DEFAULT_TOOLBAR_ITEMS: readonly ControlButtonName[] = ['rotate', 'reset', 'copy', 'download']

/** 从图片地址里取文件名，取不到（如 base64、无扩展名的接口地址）则回退 */
function getFileName(src: string) {
  const path = src.split(/[?#]/)[0]
  const name = path.slice(path.lastIndexOf('/') + 1)

  return name || 'image'
}

/** 缩略图列表贴靠各边时的定位类名，边距与 SAFE_GAP 保持一致 */
const THUMBNAIL_PLACEMENT_CLASS = {
  top: 'top-4 left-1/2 -translate-x-1/2',
  bottom: 'bottom-4 left-1/2 -translate-x-1/2',
  left: 'left-4 top-1/2 -translate-y-1/2',
  right: 'right-4 top-1/2 -translate-y-1/2',
} as const

/** 预览缩略图的默认样式：40×40、圆角 12、选中项 1.5px 白色描边、容器无底色无边框 */
const DEFAULT_THUMBNAIL_PROPS = {
  thumbSize: 40,
  thumbClassName: 'rounded-xl',
  activeThumbClassName: 'border-[1.5px] border-white',
  inactiveThumbClassName: 'border-[1.5px] border-transparent hover:border-white/50',
  containerClassName: 'gap-3 bg-transparent backdrop-blur-none',
  hideBorder: true,
} as const

/**
 * 图片预览组件
 *
 * 支持单张或多张图片预览，多图时显示缩略图切换（位置由 `thumbnailPlacement` 决定）
 * 预览打开后支持 Ctrl/Cmd+C 复制当前图片到系统剪贴板（按平台区分主修饰键）
 *
 * @example
 * ```tsx
 * // 单张图片
 * <PreviewImg
 *   src="https://example.com/image.jpg"
 *   onClose={() => setOpen(false)}
 * />
 *
 * // 多张图片
 * <PreviewImg
 *   src={['img1.jpg', 'img2.jpg', 'img3.jpg']}
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */
export const PreviewImg = memo(forwardRef<PreviewImgRef, PreviewImgProps>(({
  style,
  className,
  src,
  onClose,
  onCloseRequested,
  onIndexChanged,
  initialIndex = 0,
  orientation = 'horizontal',
  thumbnailPlacement,
  thumbnailProps,
  renderThumbnails,
  toolbar,
  showThumbnails = true,
  showNavArrows = true,
  maskClosable = true,
  windowDragMode = 'no-drag',
  imageMaxWidth,
  zIndex,
  loading = false,
  onCopy,
  copyImage,
  onDownload,
  downloadImage,
  actionIcons,
  contextMenu,
  contextMenuProps,
  contextMenuItemProps,
}, ref) => {
  const t = useT('common')
  const contextMenuRef = useRef<ContextMenuRef>(null)
  const [contextMenuOpen, setContextMenuOpen] = useState(false)

  /** 统一处理为数组格式 */
  const images = useMemo(() => {
    return Array.isArray(src)
      ? src
      : [src]
  }, [src])

  /** 当前显示的图片索引 */
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  /** 只比较已提交显示状态；无效索引恢复先重建基线，避免把原 fallback 当翻页 */
  const committedIndex = useRef({ index: currentIndex, count: images.length })
  useEffect(() => {
    const previous = committedIndex.current
    const count = images.length
    committedIndex.current = { index: currentIndex, count }

    const previousValid = Number.isSafeInteger(previous.index)
      && previous.index >= 0
      && previous.index < previous.count
    const currentValid = Number.isSafeInteger(currentIndex)
      && currentIndex >= 0
      && currentIndex < count

    if (!previousValid || !currentValid || count <= 1 || previous.index === currentIndex) return
    try {
      onIndexChanged?.({ index: currentIndex, count })
    }
    catch { /* 观察失败不影响已经提交的显示状态 */ }
  }, [currentIndex, images.length, onIndexChanged])

  const { placement, thumbnailsOrientation, showThumbnailList, bindThumbnails, bindToolbar, thumbnailsStyle, insets } = usePreviewLayout({
    thumbnailPlacement,
    orientation,
    showThumbnails,
    showNavArrows,
    imageCount: images.length,
  })

  /** 当前显示的图片URL */
  const currentSrc = images[currentIndex] || images[0] || ''

  const closeContextMenu = useLatestCallback(() => {
    if (contextMenuOpen) contextMenuRef.current?.close()
  })

  /** 翻页或原地换源后，旧图片的操作菜单不再适用 */
  useEffect(() => {
    closeContextMenu()
  }, [currentIndex, currentSrc, closeContextMenu])

  /**
   * 当前图片是否已加载完成；切到另一张后重置，加载完成前在图片区域居中显示 loading
   * 同一下标原地换源（如美化图 / 原图切换）不重置：旧图保留到新图就绪，不闪骨架屏
   */
  const [imgLoaded, setImgLoaded] = useState(false)
  /** 最近一次加载完成的地址；与 currentSrc 不一致说明原地换源的新图仍在加载 */
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  useEffect(() => {
    setImgLoaded(false)
  }, [currentIndex])
  const handleImageLoad = useLatestCallback(() => {
    setImgLoaded(true)
    setLoadedSrc(currentSrc)
  })

  /** 原地换源加载中：旧图仍在显示，图片上叠加载遮罩给出反馈（切下标走骨架屏，不在此列） */
  const swapping = loading || (imgLoaded && loadedSrc !== currentSrc)

  /** 图片操作状态 */
  const [isDragging, setIsDragging] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  /** 当图片切换时，重置操作状态 */
  useEffect(() => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }, [currentIndex])

  /** 重置状态（自定义工具栏可以不带事件对象直接调用） */
  const handleReset = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }, [])

  /** 处理旋转 */
  const handleRotate = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    const newRotation = (rotation + 90) % 360
    setRotation(newRotation)
  }, [rotation])

  /** 直接交给浏览器下载，跨域链接是否保存及文件名由服务器响应决定 */
  const handleDownload = useLatestCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    if (!currentSrc) return

    const src = currentSrc
    try {
      if (downloadImage) {
        await downloadImage(src)
      }
      else {
        await downloadByUrl(src, getFileName(src))
      }
      try {
        onDownload?.({ src, success: true })
      }
      catch { /* 观察回调不影响操作 */ }
    }
    catch (error) {
      try {
        onDownload?.({
          src,
          success: false,
          error: error instanceof Error
            ? error
            : new Error(String(error)),
        })
      }
      catch { /* 观察回调不影响操作 */ }
    }
  })

  /**
   * 复制当前图片到系统剪贴板（Ctrl/Cmd+C）
   *
   * 取图失败、转码失败或剪贴板不可用都整理成结果交给反馈层，不向调用方抛错
   */
  const handleCopy = useLatestCallback(async () => {
    if (!currentSrc) return

    const src = currentSrc
    let result: PreviewImgCopyResult
    try {
      await (copyImage
        ? copyImage(src)
        : copyImageToClipboard(src))
      result = { src, success: true }
    }
    catch (e) {
      result = {
        src,
        success: false,
        error: e instanceof Error
          ? e
          : new Error(String(e)),
      }
    }

    /** 传了 onCopy 时反馈交给调用方，组件不再弹消息；回调异常隔离 */
    if (onCopy) {
      try {
        onCopy(result)
      }
      catch {
        /** 观察回调不接管复制反馈 */
      }
      return
    }

    const key = result.success
      ? 'action.copied'
      : 'action.copyFailed'
    Message.neutral({ content: t(key), zIndex: COPY_TOAST_Z_INDEX })
  })

  useImperativeHandle(ref, () => ({
    copyImage: handleCopy,
    downloadImage: handleDownload,
  }), [handleCopy, handleDownload])

  /** 处理图片切换 */
  const handleImageChange = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  /** 切换到上一张图片 */
  const handlePrevImage = useCallback(() => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }, [images.length])

  /** 切换到下一张图片 */
  const handleNextImage = useCallback(() => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }
  }, [images.length])

  /** 交给外部 TSX 的上下文：自定义工具栏 / 缩略图列表靠它与预览联动 */
  const overlayCtx = useMemo<PreviewImgOverlayCtx>(() => ({
    images,
    currentIndex,
    currentSrc,
    scale,
    rotation,
    select: handleImageChange,
    prev: handlePrevImage,
    next: handleNextImage,
    rotate: handleRotate,
    reset: handleReset,
    copy: handleCopy,
    download: handleDownload,
    close: onClose,
  }), [
    images,
    currentIndex,
    currentSrc,
    scale,
    rotation,
    handleImageChange,
    handlePrevImage,
    handleNextImage,
    handleRotate,
    handleReset,
    handleCopy,
    handleDownload,
    onClose,
  ])

  /** 默认展示全部内置按钮；配置按调用方顺序渲染 */
  const toolbarItems = toolbar?.items
    ? typeof toolbar.items === 'function'
      ? toolbar.items(overlayCtx)
      : toolbar.items
    : toolbar?.render
    ? []
    : DEFAULT_TOOLBAR_ITEMS
  const customToolbar = toolbar?.render?.(overlayCtx)
  const showToolbar = toolbar?.render
    ? customToolbar != null && customToolbar !== false
    : toolbarItems.length > 0

  /** 观察失败只丢通知；原onClose位于catch之外，保留调用方原有错误语义 */
  const requestClose = useLatestCallback((via: 'close_button' | 'escape' | 'backdrop') => {
    try {
      onCloseRequested?.({ via })
    }
    catch {
      /** 观察不能接管预览关闭 */
    }
    onClose()
  })

  usePreviewKeyboard({ zIndex, style, requestClose, handlePrevImage, handleNextImage, handleCopy })

  /** 阻止事件冒泡 */
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }, [])

  /**
   * 鼠标滚轮切换图片
   * - 向上滚轮：上一张
   * - 向下滚轮：下一张
   */
  const handleWheel = useWheelDirection({
    onScrollUp: () => {
      handlePrevImage()
    },
    onScrollDown: () => {
      handleNextImage()
    },
  }, {
    preventDefault: true,
    stopPropagation: true,
    threshold: 0,
  })

  const handleMaskClick = useLatestCallback((e: React.MouseEvent) => {
    /** 点击遮罩层时，统一阻止事件冒泡，避免关闭预览后触发底层点击事件 */
    stopPropagation(e)

    if (e.target !== e.currentTarget) return
    if (contextMenuOpen) {
      contextMenuRef.current?.close()
      return
    }
    if (maskClosable) requestClose('backdrop')
  })

  /** 阻止 body 滚动 */
  useEffect(() => {
    const lastOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = lastOverflow
    }
  }, [])

  useEffect(() => {
    if (contextMenu === null) setContextMenuOpen(false)
  }, [contextMenu])

  const handleContextMenu = useLatestCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    contextMenuRef.current?.open(event.nativeEvent)
    setContextMenuOpen(true)
  })

  const renderContextMenu = typeof contextMenu === 'function'
    ? contextMenu
    : undefined
  const contextMenuConfig = typeof contextMenu === 'object'
      && contextMenu !== null
      && 'items' in contextMenu
    ? contextMenu
    : undefined
  const contextMenuItems = contextMenuConfig?.items ?? []
  const showDefaultCopy = contextMenuConfig?.mode !== 'replace'

  const content = (
    <Mask
      className={ cn(
        'fixed',
        windowDragMode === 'no-drag' && '[-webkit-app-region:no-drag]',
        className,
      ) }
      style={ {
        ...style,
        zIndex: zIndex ?? style?.zIndex ?? Z.preview,
      } }
      onWheel={ handleWheel }
      onClick={ handleMaskClick }
      onContextMenu={ contextMenu === null
        ? undefined
        : handleContextMenu }
      onMouseDown={ stopPropagation }
      onMouseMove={ stopPropagation }
      onMouseUp={ stopPropagation }
      onMouseLeave={ stopPropagation }
      onMouseEnter={ stopPropagation }
      onMouseOver={ stopPropagation }
      onMouseOut={ stopPropagation }
    >
      { /* 主预览图 */ }
      <PreviewImage
        src={ currentSrc }
        slotKey={ currentIndex }
        loading={ swapping }
        isDragging={ isDragging }
        scale={ scale }
        rotation={ rotation }
        position={ position }
        onScaleChange={ setScale }
        onPositionChange={ setPosition }
        onDraggingChange={ setIsDragging }
        onMouseDown={ (event) => {
          if (event.button === 0 && contextMenuOpen) contextMenuRef.current?.close()
        } }
        onLoad={ handleImageLoad }
        insets={ insets }
        maxWidth={ imageMaxWidth }
      />

      { /* 图片加载中：骨架屏铺满图片可用区域（Loading skeleton 形态），加载完成后消失 */ }
      { !imgLoaded && (
        <Loading
          variant="skeleton"
          zIndex={ Z.modal }
          className="pointer-events-none p-16"
          style={ {
            /** Loading 的 Mask 会动画到半透明黑底，预览里只要骨架本体，显式透明 */
            backgroundColor: 'transparent',
            /** 与图片同款让位修正，骨架与图片同心 */
            marginTop: insets.top - insets.bottom,
            marginLeft: insets.left - insets.right,
          } }
          skeletonProps={ { className: 'rounded-2xl' } }
        />
      ) }

      { contextMenu !== null && (
        <ContextMenu
          { ...contextMenuProps }
          ref={ contextMenuRef }
          open={ contextMenuOpen }
          onOpenChange={ setContextMenuOpen }
          style={ {
            minWidth: 196,
            ...(contextMenuProps?.width == null
              ? { width: 'max-content' }
              : {}),
            ...contextMenuProps?.style,
            zIndex: (typeof zIndex === 'number'
              ? zIndex
              : typeof style?.zIndex === 'number'
              ? style.zIndex
              : Z.preview) + 1,
          } }
        >
          { renderContextMenu
            ? renderContextMenu(overlayCtx)
            : (
              <>
                { showDefaultCopy && (
                  <ContextMenuItem
                    { ...contextMenuItemProps }
                    icon={ actionIcons?.copy ?? contextMenuItemProps?.icon ?? <Copy size={ 20 } /> }
                    disabled={ !imgLoaded || swapping || contextMenuItemProps?.disabled }
                    onClick={ handleCopy }
                  >
                    { t('action.copyImage') }
                  </ContextMenuItem>
                ) }
                { showDefaultCopy && (
                  <ContextMenuItem
                    { ...contextMenuItemProps }
                    icon={ actionIcons?.download ?? <Download size={ 20 } /> }
                    disabled={ !imgLoaded || swapping || contextMenuItemProps?.disabled }
                    onClick={ () => handleDownload() }
                  >
                    { t('action.download') }
                  </ContextMenuItem>
                ) }
                { contextMenuItems.map((item, index) => (
                  <ContextMenuItem
                    { ...contextMenuItemProps }
                    key={ index }
                    icon={ item.icon ?? contextMenuItemProps?.icon }
                    disabled={ item.disabled ?? contextMenuItemProps?.disabled }
                    onClick={ () => item.onSelect(overlayCtx) }
                  >
                    { item.label }
                  </ContextMenuItem>
                )) }
              </>
            ) }
        </ContextMenu>
      ) }

      { /* 上一张 / 下一张箭头（多图时显示） */ }
      { showNavArrows && images.length > 1 && <NavArrows onPrev={ handlePrevImage } onNext={ handleNextImage } /> }

      { /* 缩略图列表（多图时显示） */ }
      { showThumbnailList && (
        <div
          ref={ bindThumbnails }
          className={ cn(
            'fixed z-modal pointer-events-auto',
            THUMBNAIL_PLACEMENT_CLASS[placement],
          ) }
          style={ thumbnailsStyle }
        >
          { renderThumbnails
            ? renderThumbnails(overlayCtx)
            : (
              <ImgThumbnails
                { ...DEFAULT_THUMBNAIL_PROPS }
                { ...thumbnailProps }
                images={ images }
                currentIndex={ currentIndex }
                onImageChange={ handleImageChange }
                orientation={ thumbnailsOrientation }
              />
            ) }
        </div>
      ) }

      { /* 底部工具栏由组件定位，内置与自定义按钮共用同一个容器 */ }
      { showToolbar && (
        <div
          ref={ bindToolbar }
          className="pointer-events-auto fixed bottom-4 left-1/2 z-modal -translate-x-1/2"
        >
          { toolbar?.render
            ? customToolbar
            : (
              <ControlButtons
                ctx={ overlayCtx }
                items={ toolbarItems }
                icons={ { ...actionIcons, ...toolbar?.icons } }
                tooltip={ toolbar?.tooltip }
                disabled={ !imgLoaded || swapping }
                tooltipZIndex={ (zIndex ?? (typeof style?.zIndex === 'number'
                  ? style.zIndex
                  : Z.preview)) + 1 }
                className={ toolbar?.className }
              />
            ) }
        </div>
      ) }

      <CloseBtn
        onClick={ () => requestClose('close_button') }
        mode="fixed"
        size={ PREVIEW_CLOSE_SIZE }
        iconSize={ 14 }
        strokeWidth={ 2.5 }
        variant="default"
        className="bg-text4 hover:bg-text3 z-modal rounded-xl text-white hover:text-white"
      />
    </Mask>
  )

  /** 使用 Portal 渲染到 body，避免 fixed 定位失效 */
  return <SafePortal>{ content }</SafePortal>
}))

PreviewImg.displayName = 'PreviewImg'

/** 自定义工具栏时复用内置按钮样式 */
