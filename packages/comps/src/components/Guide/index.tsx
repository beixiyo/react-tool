'use client'

import { copyToClipboard } from '@jl-org/tool'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { Message } from '../Message'
import { Modal } from '../Modal'

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
}
export const Guide = memo(({ steps, onClose, isOpen, className }: GuideProps) => {
  const [currentStep, setCurrentStep] = useState(0)

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

  return (
    <Modal
      header={ null }
      footer={ null }
      isOpen={ isOpen }
      className={ cn(className) }
      onClose={ onClose }
    >
      {/* 步骤指示器 */ }
      <div className="mb-6 flex justify-center">
        { steps.map((_, index) => (
          <div
            key={ index }
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
                  onClick={ () => {
                    copyToClipboard(link)
                    Message.success('链接已复制')
                  } }
                >
                  { link }
                </a>
              )) }
            </div>
          ) }

          {/* 图片区域 */ }
          <div className="relative mb-6 h-72">
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
          onClick={ handlePrev }
          disabled={ currentStep === 0 }
          className={ cn(
            'flex items-center px-4 py-2 rounded-lg transition-colors',
            currentStep === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-500 hover:bg-blue-50',
          ) }
        >
          <ChevronLeft className="mr-1 h-5 w-5" />
          上一步
        </button>
        <button
          onClick={ handleNext }
          disabled={ currentStep === steps.length - 1 }
          className={ cn(
            'flex items-center px-4 py-2 rounded-lg transition-colors',
            currentStep === steps.length - 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-500 hover:bg-blue-50',
          ) }
        >
          下一步
          <ChevronRight className="ml-1 h-5 w-5" />
        </button>
      </div>
    </Modal>
  )
})

Guide.displayName = 'ChromeExtensionGuide'
