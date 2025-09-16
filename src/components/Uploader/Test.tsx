'use client'

import type { FileItem, UploaderRef } from './'
import { Button } from '@/components/Button'
import { Checkbox } from '@/components/Checkbox/Checkbox'
import { useNotifyParentReady } from '@/hooks'
import { Image, Settings, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Uploader } from '.'
import { ThemeToggle } from '../ThemeToggle'

export default function UploaderDemoPage() {
  /** 通知父窗口组件准备就绪（用于截图） */
  useNotifyParentReady()

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
    <div className="h-screen overflow-auto bg-slate-50 p-6 transition-colors dark:bg-slate-900">
      <ThemeToggle></ThemeToggle>
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-2xl text-slate-800 font-bold dark:text-slate-200">
          🚀 文件上传组件测试
        </h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          ✨ 这个页面展示了Uploader组件的各种功能和配置选项
        </p>

        {/* 控制面板 */ }
        <div className="mb-6 border border-slate-200 rounded-lg bg-white p-4 shadow-xs dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center">
            <Settings className="mr-2 text-slate-600 dark:text-slate-400" size={ 18 } />
            <h2 className="text-lg text-slate-800 font-medium dark:text-slate-200">⚙️ 控制面板</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center">
              <Checkbox
                color="#f40"
                checked={ settings.disabled }
                onChange={ e => setSettings(prev => ({ ...prev, disabled: e })) }
                id="disabled"
              />
              <label htmlFor="disabled" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                🔒 禁用上传功能
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                color="#f40"
                checked={ settings.distinct }
                onChange={ e => setSettings(prev => ({ ...prev, distinct: e })) }
                id="distinct"
              />
              <label htmlFor="distinct" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                🔍 单轮选择去重
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                color="#f40"
                checked={ settings.showAcceptedTypesText }
                onChange={ e => setSettings(prev => ({ ...prev, showAcceptedTypesText: e })) }
                id="showAcceptedTypesText"
              />
              <label htmlFor="showAcceptedTypesText" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                📝 显示支持的文件类型
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                color="#f40"
                checked={ settings.autoClear }
                onChange={ e => setSettings(prev => ({ ...prev, autoClear: e })) }
                id="autoClear"
              />
              <label htmlFor="autoClear" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                🧹 选择后自动清理
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                color="#f40"
                checked={ settings.useDragArea }
                onChange={ e => setSettings(prev => ({ ...prev, useDragArea: e })) }
                id="useDragArea"
              />
              <label htmlFor="useDragArea" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                🔄 使用外部拖拽区域
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                color="#f40"
                checked={ settings.dragAreaClickTrigger }
                onChange={ e => setSettings(prev => ({ ...prev, dragAreaClickTrigger: e })) }
                id="dragAreaClickTrigger"
                disabled={ !settings.useDragArea }
              />
              <label
                htmlFor="dragAreaClickTrigger"
                className={ `ml-2 text-sm ${!settings.useDragArea
                  ? 'text-slate-400 dark:text-slate-600'
                  : 'text-slate-700 dark:text-slate-300'}` }
              >
                👆 点击外部区域触发上传
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                color="#f40"
                checked={ settings.renderChildrenWithDragArea }
                onChange={ e => setSettings(prev => ({ ...prev, renderChildrenWithDragArea: e })) }
                id="renderChildrenWithDragArea"
                disabled={ !settings.useDragArea }
              />
              <label
                htmlFor="renderChildrenWithDragArea"
                className={ `ml-2 text-sm ${!settings.useDragArea
                  ? 'text-slate-400 dark:text-slate-600'
                  : 'text-slate-700 dark:text-slate-300'}` }
              >
                🖼️ 同时渲染内部上传区域
              </label>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-700 dark:text-slate-300">
                🔢 最大文件数量
              </label>
              <input
                type="number"
                value={ settings.maxCount }
                onChange={ e => setSettings(prev => ({ ...prev, maxCount: Number.parseInt(e.target.value) || 1 })) }
                min="1"
                className="w-full border border-slate-300 rounded-md bg-white px-3 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-700 dark:text-slate-300">
                📊 最大文件大小 (MB)
              </label>
              <input
                type="number"
                value={ settings.maxSize / (1024 * 1024) }
                onChange={ e => setSettings(prev => ({ ...prev, maxSize: (Number.parseInt(e.target.value) || 1) * 1024 * 1024 })) }
                min="1"
                className="w-full border border-slate-300 rounded-md bg-white px-3 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={ handleTriggerUpload } disabled={ settings.disabled }>
              <Upload size={ 16 } className="mr-1" />
              📤 选择文件
            </Button>
            <Button onClick={ handleClear } designStyle="outlined">
              <X size={ 16 } className="mr-1" />
              🗑️ 清空文件
            </Button>
          </div>
        </div>

        {/* 上传区域 */ }
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 左侧：上传组件 */ }
          <div>
            <h3 className="mb-3 text-lg text-slate-800 font-medium dark:text-slate-200">
              📁 上传组件
            </h3>

            <div className="border border-slate-200 rounded-lg bg-white p-4 shadow-xs dark:border-slate-700 dark:bg-slate-800">
              <div className="h-64">
                <Uploader
                  ref={ uploaderRef }
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
                    ? dragAreaRef
                    : undefined }
                  dragAreaClickTrigger={ settings.dragAreaClickTrigger }
                  renderChildrenWithDragArea={ settings.renderChildrenWithDragArea }
                  pasteEls={ [pasteAreaRef] }
                />
              </div>
            </div>

            {/* 文件列表 */ }
            <div className="mt-4 border border-slate-200 rounded-lg bg-white p-4 shadow-xs dark:border-slate-700 dark:bg-slate-800">
              <h3 className="mb-2 text-base text-slate-800 font-medium dark:text-slate-200">
                📋 已上传文件 (
                { files.length }
                )
              </h3>

              { files.length === 0
                ? (
                    <div className="py-6 text-center text-slate-500 dark:text-slate-400">
                      <Image className="mx-auto mb-2 opacity-30" size={ 32 } />
                      <p>📭 暂无文件</p>
                    </div>
                  )
                : (
                    <ul className="space-y-2">
                      { files.map((file, index) => (
                        <li key={ index } className="flex items-center justify-between rounded-md bg-slate-50 p-2 dark:bg-slate-700">
                          <div className="flex items-center">
                            <div className="mr-3 h-10 w-10 overflow-hidden rounded-sm bg-slate-200 dark:bg-slate-600">
                              <img src={ file.base64 } alt={ file.file.name } className="h-full w-full object-cover" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="truncate text-sm text-slate-700 font-medium dark:text-slate-300">
                                📄
                                { ' ' }
                                { file.file.name }
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
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
                            className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"
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
            <h3 className="mb-3 text-lg text-slate-800 font-medium dark:text-slate-200">
              🔄 外部拖拽区域
            </h3>
            <div
              ref={ dragAreaRef }
              className={ `
                relative h-64 bg-white dark:bg-slate-800 rounded-lg shadow-xs p-4 border-2 border-dashed
                ${settings.useDragArea
      ? 'border-blue-300 dark:border-blue-700'
      : 'border-slate-200 dark:border-slate-700 opacity-50'
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
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500'}` }
                  size={ 32 }
                />
                <p className={ `text-center ${settings.useDragArea
                  ? 'text-slate-700 dark:text-slate-300'
                  : 'text-slate-400 dark:text-slate-500'}` }>
                  { settings.useDragArea
                    ? `✨ 将文件拖放到此处${settings.dragAreaClickTrigger
                      ? '或点击选择文件'
                      : ''}`
                    : '⚠️ 外部拖拽区域未启用' }
                </p>
              </div>
            </div>

            {/* 粘贴区域 */ }
            <h3 className="mb-3 mt-6 text-lg text-slate-800 font-medium dark:text-slate-200">
              📋 粘贴区域
            </h3>
            <div className="border border-slate-200 rounded-lg bg-white p-4 shadow-xs dark:border-slate-700 dark:bg-slate-800">
              <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                📎 在下方文本框中粘贴图片 (Ctrl+V) 进行上传
              </p>
              <textarea
                ref={ pasteAreaRef }
                className="h-32 w-full resize-none border border-slate-300 rounded-md bg-white p-3 text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                placeholder="✨ 在此处粘贴图片..."
                disabled={ settings.disabled }
              ></textarea>
            </div>

            {/* 功能说明 */ }
            <div className="mt-6 border border-slate-200 rounded-lg bg-white p-4 shadow-xs dark:border-slate-700 dark:bg-slate-800">
              <h3 className="mb-3 text-lg text-slate-800 font-medium dark:text-slate-200">
                📚 功能说明
              </h3>
              <ul className="text-sm text-slate-600 space-y-2 dark:text-slate-400">
                <li className="flex">
                  <span className="mr-2 text-blue-500">📤</span>
                  <span>支持拖拽上传、点击上传、粘贴上传</span>
                </li>
                <li className="flex">
                  <span className="mr-2 text-blue-500">📊</span>
                  <span>可配置最大文件数量和大小限制</span>
                </li>
                <li className="flex">
                  <span className="mr-2 text-blue-500">🔄</span>
                  <span>支持将拖拽功能附加到外部元素</span>
                </li>
                <li className="flex">
                  <span className="mr-2 text-blue-500">📋</span>
                  <span>支持通过pasteEls自定义粘贴区域</span>
                </li>
                <li className="flex">
                  <span className="mr-2 text-blue-500">🖼️</span>
                  <span>支持文件预览和删除</span>
                </li>
                <li className="flex">
                  <span className="mr-2 text-blue-500">🎨</span>
                  <span>可自定义预览样式和渲染方式</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
