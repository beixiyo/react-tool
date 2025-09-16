import type { FFmpeg } from '@ffmpeg/ffmpeg'
import type { FilterType } from '../types'
import { Button } from '@/components/Button'
import { Dropdown } from '@/components/Dropdown'

import { LoadingIcon } from '@/components/Loading/LoadingIcon'
import { Modal } from '@/components/Modal/Modal'

import { cn } from '@/utils/tool'
import { memo } from 'react'
import { filterIcons, filterNames } from '../constants'
import { useFFmpegFilter } from '../hooks/useFFmpegFilter'

const VideoFilter = memo<VideoFilterProps>((props) => {
  const {
    videoFile,
    className,
    isProcessing,
  } = props

  const {
    selectedFilter,
    handleFilterChange,
    handleProcess,
    showDrawer,
    setShowDrawer,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    saturation,
    setSaturation,
    gamma,
    setGamma,
    blurType,
    setBlurType,
    blurRadius,
    setBlurRadius,
    blurSigma,
    setBlurSigma,
    rotateAngle,
    setRotateAngle,
    watermarkText,
    setWatermarkText,
    fontSize,
    setFontSize,
    fontColor,
    setFontColor,
    textPosition,
    setTextPosition,
  } = useFFmpegFilter(props)

  const renderFilterParams = () => {
    switch (selectedFilter) {
      case 'eq':
        return (
          <Dropdown
            items={ {
              色彩调整: [
                {
                  id: 'color-adjustment',
                  customContent: (
                    <div className="p-2 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                          <span>亮度</span>
                          <span>{ brightness }</span>
                        </div>
                        <input
                          type="range"
                          min="-1"
                          max="1"
                          step="0.1"
                          value={ brightness }
                          onChange={ e => setBrightness(Number(e.target.value)) }
                          className="w-full accent-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                          <span>对比度</span>
                          <span>{ contrast }</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={ contrast }
                          onChange={ e => setContrast(Number(e.target.value)) }
                          className="w-full accent-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                          <span>饱和度</span>
                          <span>{ saturation }</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="3"
                          step="0.1"
                          value={ saturation }
                          onChange={ e => setSaturation(Number(e.target.value)) }
                          className="w-full accent-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                          <span>伽马值</span>
                          <span>{ gamma }</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="10"
                          step="0.1"
                          value={ gamma }
                          onChange={ e => setGamma(Number(e.target.value)) }
                          className="w-full accent-blue-500"
                        />
                      </div>
                    </div>
                  ),
                },
              ],
            } }
            defaultExpanded={ ['色彩调整'] }
            className="border-none bg-transparent"
            itemClassName="mb-2 rounded-lg border-none bg-gray-800"
          />
        )

      case 'blur-sm':
        return (
          <Dropdown
            items={ {
              模糊设置: [
                {
                  id: 'blur-settings',
                  customContent: (
                    <div className="p-2 space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm text-gray-700 dark:text-gray-300">模糊类型</label>
                        <select
                          value={ blurType }
                          onChange={ e => setBlurType(e.target.value as 'boxblur' | 'gblur') }
                          className="w-full border-gray-300 rounded-lg bg-white p-2 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        >
                          <option value="gblur">高斯模糊</option>
                          <option value="boxblur">方框模糊</option>
                        </select>
                      </div>
                      { blurType === 'boxblur'
                        ? (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                <span>模糊半径</span>
                                <span>{ blurRadius }</span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="20"
                                value={ blurRadius }
                                onChange={ e => setBlurRadius(Number(e.target.value)) }
                                className="w-full accent-blue-500"
                              />
                            </div>
                          )
                        : (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                <span>模糊强度</span>
                                <span>{ blurSigma }</span>
                              </div>
                              <input
                                type="range"
                                min="0.5"
                                max="5"
                                step="0.1"
                                value={ blurSigma }
                                onChange={ e => setBlurSigma(Number(e.target.value)) }
                                className="w-full accent-blue-500"
                              />
                            </div>
                          ) }
                    </div>
                  ),
                },
              ],
            } }
            defaultExpanded={ ['模糊设置'] }
            className="border-none bg-transparent"
            itemClassName="mb-2 rounded-lg border-none bg-gray-800"
          />
        )

      case 'rotate':
        return (
          <Dropdown
            items={ {
              旋转设置: [
                {
                  id: 'rotate-settings',
                  customContent: (
                    <div className="p-2 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                          <span>旋转角度</span>
                          <span>
                            { rotateAngle }
                            °
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={ rotateAngle }
                          onChange={ e => setRotateAngle(Number(e.target.value)) }
                          className="w-full accent-blue-500"
                        />
                      </div>
                    </div>
                  ),
                },
              ],
            } }
            defaultExpanded={ ['旋转设置'] }
            className="border-none bg-transparent"
            itemClassName="mb-2 rounded-lg border-none bg-gray-800"
          />
        )

      case 'text':
        return (
          <Dropdown
            items={ {
              文字设置: [
                {
                  id: 'text-settings',
                  customContent: (
                    <div className="p-2 space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm text-gray-700 dark:text-gray-300">水印文字</label>
                        <input
                          type="text"
                          value={ watermarkText }
                          onChange={ e => setWatermarkText(e.target.value) }
                          placeholder="请输入水印文字"
                          className="w-full border-gray-300 rounded-lg bg-white p-2 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                          <span>字体大小</span>
                          <span>
                            { fontSize }
                            px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="12"
                          max="72"
                          value={ fontSize }
                          onChange={ e => setFontSize(Number(e.target.value)) }
                          className="w-full accent-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm text-gray-700 dark:text-gray-300">字体颜色</label>
                        <input
                          type="color"
                          value={ fontColor }
                          onChange={ e => setFontColor(e.target.value) }
                          className="h-10 w-full cursor-pointer rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm text-gray-700 dark:text-gray-300">文字位置</label>
                        <select
                          value={ textPosition }
                          onChange={ e => setTextPosition(e.target.value as 'center' | 'top' | 'bottom') }
                          className="w-full border-gray-300 rounded-lg bg-white p-2 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        >
                          <option value="center">居中</option>
                          <option value="top">顶部</option>
                          <option value="bottom">底部</option>
                        </select>
                      </div>
                    </div>
                  ),
                },
              ],
            } }
            defaultExpanded={ ['文字设置'] }
            className="border-none bg-transparent"
            itemClassName="mb-2 rounded-lg border-none bg-gray-800"
          />
        )

      default:
        return null
    }
  }

  return (
    <div className={ cn('relative', className) }>
      {/* 滤镜选择区域 */ }
      <div className="flex flex-wrap gap-2">
        { (Object.keys(filterIcons) as FilterType[]).map((type) => {
          const Icon = filterIcons[type]
          const isSelected = selectedFilter === type
          return (
            <Button
              key={ type }
              onClick={ () => handleFilterChange(type) }
              designStyle="neumorphic"
              variant={ isSelected
                ? 'primary'
                : 'info' }
              leftIcon={ <Icon className="size-4" /> }
              className="h-26 w-12 flex flex-col items-center justify-center gap-2"
              iconClassName="m-0"
            >
              <span className="text-xs">{ filterNames[type] }</span>
            </Button>
          )
        }) }
      </div>

      {/* 参数设置抽屉 */ }
      <Modal
        isOpen={ showDrawer }
        onClose={ () => setShowDrawer(false) }
        titleText={ filterNames[selectedFilter] }
        footer={ null }
        width={ 600 }
        className="filter-modal"
      >
        <div className="h-full flex flex-col justify-between bg-transparent">
          <div className="flex-1 overflow-y-auto">{ renderFilterParams() }</div>
          <div className="p-4">
            <button
              type="button"
              onClick={ () => handleProcess(selectedFilter) }
              disabled={ !videoFile || isProcessing }
              className={ cn(
                'w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2',
                videoFile && !isProcessing
                  ? 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed',
              ) }
            >
              { isProcessing && <LoadingIcon /> }
              { isProcessing
                ? '处理中...'
                : '应用滤镜' }
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
})

VideoFilter.displayName = 'VideoFilter'

export default VideoFilter

export interface VideoFilterProps {
  className?: string
  isProcessing?: boolean
  ffmpeg: FFmpeg | null
  videoFile: File | null

  onProcessing: (isProcessing: boolean) => void
  onProgress?: (progress: number) => void
  onProcessComplete: (result: Blob) => void
  setOperationType: (type: string) => void

  onOperationError?: (err: string) => void
  onOperationMsg?: (msg: string) => void
}
