'use client'

import { copyToClipboard } from '@jl-org/tool'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useEffect, useState } from 'react'
import { cn } from 'utils'
import { Message } from '../Message'
import { Modal } from '../Modal'

export const Guide = memo(({
  steps,
  onClose,
  isOpen,
  className,
  prevText = '上一步',
  nextText = '下一步',
  copySuccessText = '链接已复制',
  onLinkClick,
  imageHeight = 'h-72',
  resetOnOpen = true,
}: GuideProps) => {
  const [currentStep, setCurrentStep] = useState(0)

  /** 从关闭 → 打开时重置到第一步，避免上次的步骤残留 */
  useEffect(() => {
    if (isOpen && resetOnOpen) {
      setCurrentStep(0)
    }
  }, [isOpen, resetOnOpen])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      handleNext()
    }
    else if (e.key === 'ArrowLeft') {
      handlePrev()
    }
  }

  const handleLinkClick = (link: string) => {
    if (onLinkClick) {
      onLinkClick(link)
      return
    }
    copyToClipboard(link)
    Message.success(copySuccessText)
  }

  return (
    <Modal
      header={ null }
      footer={ null }
      isOpen={ isOpen }
      className={ cn(className) }
      onClose={ onClose }
    >
      {/* 用可聚焦容器承接键盘左右翻页 */ }
      <div role="group" tabIndex={ 0 } onKeyDown={ handleKeyDown } className="outline-none">
        {/* 步骤指示器 */ }
        <div
          className="mb-6 flex justify-center"
          role="tablist"
          aria-label="Guide steps"
        >
          { steps.map((_, index) => (
            <div
              key={ index }
              role="tab"
              aria-current={ index === currentStep }
              aria-label={ `Step ${index + 1}` }
              className={ cn(
                'w-2 h-2 mx-1 rounded-full transition-colors',
                index === currentStep
                  ? 'bg-blue-500'
                  : 'bg-gray-300',
              ) }
            />
          )) }
        </div>

        {/* 内容区域 */ }
        <AnimatePresence mode="wait">
          <motion.div
            key={ currentStep }
            initial={ { opacity: 0, x: 20 } }
            animate={ { opacity: 1, x: 0 } }
            exit={ { opacity: 0, x: -20 } }
            className="text-center"
          >
            <h3 className="mb-4 text-xl font-semibold">{ steps[currentStep].title }</h3>
            <p className="mb-6 text-gray-600">{ steps[currentStep].description }</p>

            {/* 链接区域 */ }
            { steps[currentStep].links && steps[currentStep].links.length > 0 && (
              <div className="mb-6 flex flex-wrap justify-center gap-2">
                { steps[currentStep].links.map((link, index) => (
                  <a
                    key={ index }
                    href={ link }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-100"
                    onClick={ () => handleLinkClick(link) }
                  >
                    { link }
                  </a>
                )) }
              </div>
            ) }

            {/* 图片区域 */ }
            <div className={ cn('relative mb-6', imageHeight) }>
              { steps[currentStep].image && <img
                src={ steps[currentStep].image }
                alt={ steps[currentStep].title }
                className="h-full w-full rounded-lg object-contain"
              /> }
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 导航按钮 */ }
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={ handlePrev }
            disabled={ currentStep === 0 }
            aria-label="Previous step"
            className={ cn(
              'flex items-center px-4 py-2 rounded-lg transition-colors',
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-500 hover:bg-blue-50',
            ) }
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            { prevText }
          </button>
          <button
            type="button"
            onClick={ handleNext }
            disabled={ currentStep === steps.length - 1 }
            aria-label="Next step"
            className={ cn(
              'flex items-center px-4 py-2 rounded-lg transition-colors',
              currentStep === steps.length - 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-500 hover:bg-blue-50',
            ) }
          >
            { nextText }
            <ChevronRight className="ml-1 h-5 w-5" />
          </button>
        </div>
      </div>
    </Modal>
  )
})

Guide.displayName = 'Guide'

export type Step = {
  title: string
  description: string
  links?: string[]
  image?: string
}

export type GuideProps = {
  steps: Step[]
  onClose?: () => void
  isOpen: boolean
  className?: string
  /**
   * 上一步按钮文案
   * @default '上一步'
   */
  prevText?: React.ReactNode
  /**
   * 下一步按钮文案
   * @default '下一步'
   */
  nextText?: React.ReactNode
  /**
   * 复制链接成功后的提示文案，仅在未传入 onLinkClick 时使用
   * @default '链接已复制'
   */
  copySuccessText?: string
  /**
   * 点击链接的回调。传入后将覆盖默认的「复制 + Toast」行为
   */
  onLinkClick?: (link: string) => void
  /**
   * 图片区域高度（Tailwind 类名）
   * @default 'h-72'
   */
  imageHeight?: string
  /**
   * 从关闭切换到打开时是否重置到第一步
   * @default true
   */
  resetOnOpen?: boolean
}
