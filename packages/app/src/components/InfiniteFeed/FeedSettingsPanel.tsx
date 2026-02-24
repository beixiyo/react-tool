import type { FeedSettingsPanelProps } from './types'
import { DrawerFramer } from 'comps'
import { Plus, X, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { memo, useState } from 'react'
import { DEFAULT_COLORS, DEFAULT_SETTINGS_PANEL_CONFIG } from './constants'

/**
 * 信息流设置面板组件
 * 提供速度控制和添加内容的功能
 */
export const FeedSettingsPanel = memo<FeedSettingsPanelProps>((props) => {
  const {
    isOpen,
    onClose,
    speed,
    onSpeedChange,
    onAddContent,
    config = {},
  } = props

  const panelConfig = { ...DEFAULT_SETTINGS_PANEL_CONFIG, ...config }

  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newAuthor, setNewAuthor] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTitle && newContent && newAuthor && onAddContent) {
      onAddContent({
        title: newTitle,
        content: newContent,
        author: newAuthor,
        color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
      })
      setNewTitle('')
      setNewContent('')
      setNewAuthor('')
    }
  }

  if (!panelConfig.enabled)
    return null

  return (
    <DrawerFramer
      open={ isOpen }
      onClose={ onClose }
      position={ panelConfig.position }
      closeButton={ false }
      className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200 dark:border-gray-800 shadow-2xl"
      style={ { maxWidth: panelConfig.maxWidth } }
    >
      <div className="h-full flex flex-col">
        {/* 头部 - 固定 */}
        <div className="shrink-0 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                设置面板
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                自定义您的信息流体验
              </p>
            </div>
            <motion.button
              onClick={ onClose }
              whileHover={ { scale: 1.1, rotate: 90 } }
              whileTap={ { scale: 0.9 } }
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* 内容区域 - 可滚动 */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* 速度控制 */}
          {panelConfig.showSpeedControl && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  滚动速度
                </label>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">当前速度</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {speed.toFixed(1)}
                    s
                  </span>
                </div>
                <input
                  type="range"
                  min={ panelConfig.speedRange.min }
                  max={ panelConfig.speedRange.max }
                  step={ panelConfig.speedRange.step }
                  value={ speed }
                  onChange={ e => onSpeedChange(Number.parseFloat(e.target.value)) }
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500 dark:accent-blue-400"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>⚡ 极快</span>
                  <span>🐢 慢速</span>
                </div>
              </div>
            </div>
          )}

          {/* 添加内容表单 */}
          {panelConfig.showAddContent && onAddContent && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-green-500" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  添加新内容
                </h3>
              </div>
              <form onSubmit={ handleSubmit } className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    标题
                  </label>
                  <input
                    type="text"
                    value={ newTitle }
                    onChange={ e => setNewTitle(e.target.value) }
                    placeholder="输入标题..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    作者
                  </label>
                  <input
                    type="text"
                    value={ newAuthor }
                    onChange={ e => setNewAuthor(e.target.value) }
                    placeholder="输入作者名..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    内容
                  </label>
                  <textarea
                    value={ newContent }
                    onChange={ e => setNewContent(e.target.value) }
                    placeholder="输入内容..."
                    rows={ 4 }
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none transition-all"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={ { scale: 1.02 } }
                  whileTap={ { scale: 0.98 } }
                  className="w-full py-3 px-4 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/30"
                >
                  <Plus className="w-5 h-5" />
                  添加到信息流
                </motion.button>
              </form>
            </div>
          )}
        </div>
      </div>
    </DrawerFramer>
  )
})

FeedSettingsPanel.displayName = 'FeedSettingsPanel'
