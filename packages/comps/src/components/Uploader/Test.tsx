'use client'

import type { RefObject } from 'react'
import type { FileItem, UploaderRef } from '.'
import { Image, Plus, Settings, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from 'utils'
import { Uploader } from '.'
import { Button } from '../Button'
import { Checkbox } from '../Checkbox/Checkbox'
import { ThemeToggle } from '../ThemeToggle'

export default function UploaderDemoPage() {
  /** 上传组件引用 */
  const uploaderRef = useRef<UploaderRef>(null)
  /** 外部拖拽区域引用 */
  const dragAreaRef = useRef<HTMLDivElement>(null)
  /** 粘贴区域引用 */
  const pasteAreaRef = useRef<HTMLTextAreaElement>(null)

  /** 状态管理 */
  const [files, setFiles] = useState<FileItem[]>([])
  const [previewImgs, setPreviewImgs] = useState<string[]>([])
  const [settings, setSettings] = useState({
    disabled: false,
    distinct: true,
    maxCount: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    showAcceptedTypesText: true,
    autoClear: false,
    useDragArea: false,
    dragAreaClickTrigger: false,
    renderChildrenWithDragArea: false,
    mode: 'default' as 'default' | 'card',
    useCustomUploadArea: false,
  })

  /** 文件变更处理 */
  const handleChange = (newFiles: FileItem[]) => {
    console.log('文件变更:', newFiles)
    setFiles(prev => [...prev, ...newFiles])
    setPreviewImgs(prev => [...prev, ...newFiles.map(f => f.base64)])
  }

  /** 文件移除处理 */
  const handleRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewImgs(prev => prev.filter((_, i) => i !== index))
  }

  /** 清空所有文件 */
  const handleClear = () => {
    setFiles([])
    setPreviewImgs([])
    uploaderRef.current?.clear()
  }

  /** 触发上传对话框 */
  const handleTriggerUpload = () => {
    uploaderRef.current?.click()
  }

  return (
    <div className="h-screen overflow-auto bg-backgroundSecondary p-6 transition-colors">
      <ThemeToggle></ThemeToggle>
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-2xl text-textPrimary font-bold">
          🚀 文件上传组件测试
        </h1>
        <p className="mb-6 text-textSecondary">
          ✨ 这个页面展示了Uploader组件的各种功能和配置选项
        </p>

        {/* 控制面板 */ }
        <div className="mb-6 border border-border rounded-lg bg-background p-4 shadow-xs">
          <div className="mb-4 flex items-center">
            <Settings className="mr-2 text-textSecondary" size={ 18 } />
            <h2 className="text-lg text-textPrimary font-medium">⚙️ 控制面板</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center">
              <Checkbox
                checked={ settings.disabled }
                onChange={ e => setSettings(prev => ({ ...prev, disabled: e })) }
                id="disabled"
              />
              <label htmlFor="disabled" className="ml-2 text-sm text-textPrimary">
                🔒 禁用上传功能
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                checked={ settings.distinct }
                onChange={ e => setSettings(prev => ({ ...prev, distinct: e })) }
                id="distinct"
              />
              <label htmlFor="distinct" className="ml-2 text-sm text-textPrimary">
                🔍 单轮选择去重
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                checked={ settings.showAcceptedTypesText }
                onChange={ e => setSettings(prev => ({ ...prev, showAcceptedTypesText: e })) }
                id="showAcceptedTypesText"
              />
              <label htmlFor="showAcceptedTypesText" className="ml-2 text-sm text-textPrimary">
                📝 显示支持的文件类型
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                checked={ settings.autoClear }
                onChange={ e => setSettings(prev => ({ ...prev, autoClear: e })) }
                id="autoClear"
              />
              <label htmlFor="autoClear" className="ml-2 text-sm text-textPrimary">
                🧹 选择后自动清理
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                checked={ settings.useDragArea }
                onChange={ e => setSettings(prev => ({ ...prev, useDragArea: e })) }
                id="useDragArea"
              />
              <label htmlFor="useDragArea" className="ml-2 text-sm text-textPrimary">
                🔄 使用外部拖拽区域
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                checked={ settings.dragAreaClickTrigger }
                onChange={ e => setSettings(prev => ({ ...prev, dragAreaClickTrigger: e })) }
                id="dragAreaClickTrigger"
                disabled={ !settings.useDragArea }
              />
              <label
                htmlFor="dragAreaClickTrigger"
                className={ `ml-2 text-sm ${!settings.useDragArea
                  ? 'text-textDisabled'
                  : 'text-textPrimary'}` }
              >
                👆 点击外部区域触发上传
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                checked={ settings.renderChildrenWithDragArea }
                onChange={ e => setSettings(prev => ({ ...prev, renderChildrenWithDragArea: e })) }
                id="renderChildrenWithDragArea"
                disabled={ !settings.useDragArea }
              />
              <label
                htmlFor="renderChildrenWithDragArea"
                className={ `ml-2 text-sm ${!settings.useDragArea
                  ? 'text-textDisabled'
                  : 'text-textPrimary'}` }
              >
                🖼️ 同时渲染内部上传区域
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                checked={ settings.mode === 'card' }
                onChange={ e => setSettings(prev => ({
                  ...prev,
                  mode: e
                    ? 'card'
                    : 'default',
                })) }
                id="mode"
              />
              <label htmlFor="mode" className="ml-2 text-sm text-textPrimary">
                🗂️ 经典表单模式 (Card Mode)
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                checked={ settings.useCustomUploadArea }
                onChange={ e => setSettings(prev => ({ ...prev, useCustomUploadArea: e })) }
                id="useCustomUploadArea"
              />
              <label htmlFor="useCustomUploadArea" className="ml-2 text-sm text-textPrimary">
                🎨 自定义上传区域 (renderUploadArea)
              </label>
            </div>

            <div>
              <label className="mb-1 block text-sm text-textPrimary">
                🔢 最大文件数量
              </label>
              <input
                type="number"
                value={ settings.maxCount }
                onChange={ e => setSettings(prev => ({ ...prev, maxCount: Number.parseInt(e.target.value) || 1 })) }
                min="1"
                className="w-full border border-border rounded-md bg-background px-3 py-2 text-textPrimary"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-textPrimary">
                📊 最大文件大小 (MB)
              </label>
              <input
                type="number"
                value={ settings.maxSize / (1024 * 1024) }
                onChange={ e => setSettings(prev => ({ ...prev, maxSize: (Number.parseInt(e.target.value) || 1) * 1024 * 1024 })) }
                min="1"
                className="w-full border border-border rounded-md bg-background px-3 py-2 text-textPrimary"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={ handleTriggerUpload } disabled={ settings.disabled }>
              <Upload size={ 16 } className="mr-1" />
              选择文件
            </Button>
            <Button onClick={ handleClear } variant="danger">
              <X size={ 16 } className="mr-1" />
              清空文件
            </Button>
          </div>
        </div>

        {/* 上传区域 */ }
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 左侧：上传组件 */ }
          <div>
            <h3 className="mb-3 text-lg text-textPrimary font-medium">
              📁 上传组件
            </h3>

            <div className="border border-border rounded-lg bg-background p-4 shadow-xs">
              <div className={ settings.mode === 'card'
                ? 'min-h-32'
                : 'h-64' }>
                <Uploader
                  ref={ uploaderRef }
                  mode={ settings.mode }
                  disabled={ settings.disabled }
                  distinct={ settings.distinct }
                  maxCount={ settings.maxCount }
                  maxSize={ settings.maxSize }
                  accept="image/*"
                  showAcceptedTypesText={ settings.showAcceptedTypesText }
                  autoClear={ settings.autoClear }
                  previewImgs={ previewImgs }
                  onChange={ handleChange }
                  onRemove={ handleRemove }
                  onExceedSize={ size => alert(`❌ 文件大小超过限制：${(size / 1024 / 1024).toFixed(2)}MB > ${(settings.maxSize / 1024 / 1024).toFixed(2)}MB`) }
                  onExceedCount={ () => alert(`❌ 文件数量超过限制：最多${settings.maxCount}个文件`) }
                  dragAreaEl={ settings.useDragArea
                    ? dragAreaRef as RefObject<HTMLElement>
                    : undefined }
                  dragAreaClickTrigger={ settings.dragAreaClickTrigger }
                  renderChildrenWithDragArea={ settings.renderChildrenWithDragArea }
                  pasteEls={ [pasteAreaRef] }
                  renderUploadArea={ settings.useCustomUploadArea
                    ? ({ getRootProps, renderPreviewList }) => {
                        const rootProps = getRootProps()
                        return (
                          <div
                            { ...rootProps }
                            onClick={ e => e.stopPropagation() }
                          >
                            {/* 预览列表区域 */ }
                            { settings.mode === 'card' && (
                              <div className="flex-1 min-h-0">
                                { renderPreviewList({
                                  previewConfig: {
                                    width: 56,
                                    height: 56,
                                    renderAddTrigger: ({ onClick, disabled: addDisabled, width, height }) => (
                                      <div
                                        onClick={ (e) => {
                                          e.stopPropagation()
                                          onClick()
                                        } }
                                        className={ cn(
                                          'rounded-lg flex items-center justify-center',
                                          'bg-backgroundTertiary transition-opacity',
                                          'cursor-pointer hover:opacity-70',
                                          addDisabled && 'opacity-50 cursor-not-allowed',
                                        ) }
                                        style={ { width, height } }
                                      >
                                        <Plus className="size-5 text-textSecondary" />
                                      </div>
                                    ),
                                  },
                                }) }
                              </div>
                            ) }
                          </div>
                        )
                      }
                    : undefined }
                />
              </div>
            </div>

            {/* 文件列表 */ }
            <div className="mt-4 border border-border rounded-lg bg-background p-4 shadow-xs">
              <h3 className="mb-2 text-base text-textPrimary font-medium">
                📋 已上传文件 (
                { files.length }
                )
              </h3>

              { files.length === 0
                ? (
                    <div className="py-6 text-center text-textSecondary">
                      <Image className="mx-auto mb-2 opacity-30" size={ 32 } />
                      <p>📭 暂无文件</p>
                    </div>
                  )
                : (
                    <ul className="space-y-2">
                      { files.map((file, index) => (
                        <li key={ index } className="flex items-center justify-between rounded-md bg-backgroundSecondary p-2">
                          <div className="flex items-center">
                            <div className="mr-3 h-10 w-10 overflow-hidden rounded-sm bg-backgroundTertiary">
                              <img src={ file.base64 } alt={ file.file.name } className="h-full w-full object-cover" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="truncate text-sm text-textPrimary font-medium">
                                📄
                                { ' ' }
                                { file.file.name }
                              </p>
                              <p className="text-xs text-textSecondary">
                                💾
                                { ' ' }
                                { (file.file.size / 1024).toFixed(2) }
                                { ' ' }
                                KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={ () => handleRemove(index) }
                            className="p-1 text-textSecondary hover:text-danger"
                            title="删除文件"
                          >
                            <X size={ 16 } />
                          </button>
                        </li>
                      )) }
                    </ul>
                  ) }
            </div>
          </div>

          {/* 右侧：外部拖拽区域和粘贴区域 */ }
          <div>
            {/* 外部拖拽区域 */ }
            <h3 className="mb-3 text-lg text-textPrimary font-medium">
              🔄 外部拖拽区域
            </h3>
            <div
              ref={ dragAreaRef }
              className={ `
                relative h-64 bg-background rounded-lg shadow-xs p-4 border-2 border-dashed
                ${settings.useDragArea
      ? 'border-brand/50'
      : 'border-border opacity-50'
    }
                transition-all duration-300
                ${settings.useDragArea && settings.dragAreaClickTrigger
      ? 'cursor-pointer'
      : ''}
              ` }
            >
              <div className="h-full flex flex-col items-center justify-center">
                <Upload
                  className={ `mb-2 ${settings.useDragArea
                    ? 'text-brand'
                    : 'text-textDisabled'}` }
                  size={ 32 }
                />
                <p className={ `text-center ${settings.useDragArea
                  ? 'text-textPrimary'
                  : 'text-textDisabled'}` }>
                  { settings.useDragArea
                    ? `✨ 将文件拖放到此处${settings.dragAreaClickTrigger
                      ? '或点击选择文件'
                      : ''}`
                    : '⚠️ 外部拖拽区域未启用' }
                </p>
              </div>
            </div>

            {/* 粘贴区域 */ }
            <h3 className="mb-3 mt-6 text-lg text-textPrimary font-medium">
              📋 粘贴区域
            </h3>
            <div className="border border-border rounded-lg bg-background p-4 shadow-xs">
              <p className="mb-2 text-sm text-textSecondary">
                📎 在下方文本框中粘贴图片 (Ctrl+V) 进行上传
              </p>
              <textarea
                ref={ pasteAreaRef }
                className="h-32 w-full resize-none border border-border rounded-md bg-background p-3 text-textPrimary"
                placeholder="✨ 在此处粘贴图片..."
                disabled={ settings.disabled }
              ></textarea>
            </div>

            {/* 功能说明 */ }
            <div className="mt-6 border border-border rounded-lg bg-background p-4 shadow-xs">
              <h3 className="mb-3 text-lg text-textPrimary font-medium">
                📚 功能说明
              </h3>
              <ul className="text-sm text-textSecondary space-y-2">
                <li className="flex">
                  <span className="mr-2 text-brand">📤</span>
                  <span>支持拖拽上传、点击上传、粘贴上传</span>
                </li>
                <li className="flex">
                  <span className="mr-2 text-brand">📊</span>
                  <span>可配置最大文件数量和大小限制</span>
                </li>
                <li className="flex">
                  <span className="mr-2 text-brand">🔄</span>
                  <span>支持将拖拽功能附加到外部元素</span>
                </li>
                <li className="flex">
                  <span className="mr-2 text-brand">📋</span>
                  <span>支持通过pasteEls自定义粘贴区域</span>
                </li>
                <li className="flex">
                  <span className="mr-2 text-brand">🖼️</span>
                  <span>支持文件预览和删除</span>
                </li>
                <li className="flex">
                  <span className="mr-2 text-brand">🎨</span>
                  <span>可自定义预览样式和渲染方式</span>
                </li>
                <li className="flex">
                  <span className="mr-2 text-brand">🧩</span>
                  <span>通过 renderUploadArea 完全自定义上传区域 JSX</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
