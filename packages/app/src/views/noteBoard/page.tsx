import type { FileItem } from 'comps'
import type { RefObject } from 'react'

import { PreviewImg } from 'comps'
import { useState } from 'react'
import { GithubSourceLink } from '@/components/GithubSourceLink'
import { Toolbar } from '@/components/Toolbar'
import {
  AddShapeSection,
  CanvasArea,
  ExportModal,
  FeatureSection,
  ShortcutButton,
  ShortcutModal,
} from './components'
import { MODE_OPTIONS } from './constants'
import {
  useImageExport,
  useNoteBoardShortcuts,
} from './hooks'
import { useNoteBoard } from './hooks/useNoteBoard'

function NoteBoard2Test() {
  const [showShortcutModal, setShowShortcutModal] = useState(false)

  /** 画板相关逻辑 */
  const {
    noteBoardRef,
    currentMode,
    config,
    viewportState,
    canvasContainerRef,
    handleModeChange,
    updateConfig,
    actions,
  } = useNoteBoard()

  /** 图片导出相关逻辑 */
  const {
    previewImages,
    showPreviewModal,
    viewMode,
    fullscreenImage,
    handleExport,
    handleExportAll,
    handleDownloadImage,
    handleClosePreview,
    handleFullscreenPreview,
    handleCloseFullscreen,
    handleToggleViewMode,
  } = useImageExport(noteBoardRef)

  /** 快捷键 */
  useNoteBoardShortcuts({
    onUndo: actions.undo,
    onRedo: actions.redo,
    onModeChange: handleModeChange,
    onExport: handleExport,
    onExportAll: handleExportAll,
    onResetSize: actions.resetSize,
    onClear: actions.clear,
  })

  /** 上传图片 */
  const handleImageUpload = (file: FileItem[]) => {
    if (file[0]?.base64) {
      actions.drawImg(file[0].base64)
    }
  }

  return (
    <div className="h-screen overflow-auto from-background2 via-background2 to-background2 bg-linear-to-br">
      {/* 背景装饰 */ }
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute h-80 w-80 rounded-full from-blue-400/20 to-purple-600/20 bg-linear-to-br blur-3xl -right-40 -top-40" />
        <div className="absolute h-80 w-80 rounded-full from-pink-400/20 to-orange-600/20 bg-linear-to-tr blur-3xl -bottom-40 -left-40" />
      </div>

      <div>

        <div className="relative text-center">
          <h1 className="from-blue-600 to-blue-600 bg-linear-to-r bg-clip-text text-2xl text-transparent font-bold">
            无限画布 (Infinite Canvas)
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-text2">
            世界坐标系和视口变换的高性能画布，支持无限平移、缩放和丰富的交互功能。
          </p>
        </div>

        {/* 工具栏容器 */ }
        <Toolbar
          modes={ MODE_OPTIONS }
          activeMode={ currentMode }
          onModeChange={ handleModeChange as any }
          brushSize={ config.lineWidth }
          onBrushSizeChange={ val => updateConfig('lineWidth', val) }
          onImageUpload={ handleImageUpload }
          onExport={ handleExport }
          onExportAll={ handleExportAll }
          onUndo={ actions.undo }
          onRedo={ actions.redo }
          onClear={ actions.clear }
          onResetSize={ actions.resetSize }
        />

        {/* 画布区域 */ }
        <CanvasArea
          canvasContainerRef={ canvasContainerRef as RefObject<HTMLDivElement> }
        />

        {/* addShape 方法测试区域 */ }
        <AddShapeSection noteBoardRef={ noteBoardRef } />

        {/* 快捷键提示按钮 */ }
        <ShortcutButton onClick={ () => setShowShortcutModal(true) } />

        {/* 功能说明卡片 */ }
        <div className="border border-border/50 rounded-xl bg-background2/80 p-6 shadow-lg backdrop-blur-xs">
          <h3 className="mb-4 text-lg text-text font-semibold">
            ✨ NoteBoard2 新功能特性
          </h3>
          <div className="grid grid-cols-1 gap-4 text-sm text-text2 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-text font-medium">🎯 核心升级</h4>
              <ul className="space-y-1">
                <li>• 使用 Canvas API 替代 CSS transform</li>
                <li>• 真正的世界坐标系统</li>
                <li>• 鼠标中心缩放</li>
                <li>• 无限平移和缩放</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-text font-medium">🔧 兼容性</h4>
              <ul className="space-y-1">
                <li>• 保持所有现有功能</li>
                <li>• 可切换无限画布模式</li>
                <li>• API 完全兼容</li>
                <li>• 性能显著提升</li>
              </ul>
            </div>
          </div>
        </div>

        <FeatureSection />
      </div>

      {/* 图像预览模态框 */ }
      <ExportModal
        isOpen={ showPreviewModal }
        onClose={ handleClosePreview }
        images={ previewImages }
        viewMode={ viewMode }
        onToggleViewMode={ handleToggleViewMode }
        onDownloadImage={ handleDownloadImage }
        onFullscreenPreview={ handleFullscreenPreview }
      />

      {/* 快捷键说明模态框 */ }
      <ShortcutModal
        isOpen={ showShortcutModal }
        onClose={ () => setShowShortcutModal(false) }
      />

      {/* 全屏图像预览 */ }
      { fullscreenImage && (
        <PreviewImg
          src={ fullscreenImage }
          onClose={ handleCloseFullscreen }
        />
      ) }

      <GithubSourceLink />
    </div>
  )
}

export default NoteBoard2Test
