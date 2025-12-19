import type { FeedDetailModalProps } from './types'
import { AnimatePresence, motion } from 'framer-motion'
import { memo } from 'react'
import { cn } from 'utils'
import { DEFAULT_DETAIL_MODAL_CONFIG } from './constants'

/**
 * 信息流详情弹窗组件
 * 展示选中卡片的完整信息
 */
export const FeedDetailModal = memo<FeedDetailModalProps>((props) => {
  const {
    item,
    isOpen,
    onClose,
    config = {},
    render,
  } = props

  const modalConfig = { ...DEFAULT_DETAIL_MODAL_CONFIG, ...config }

  if (!modalConfig.enabled)
    return null

  const handleBackdropClick = () => {
    onClose()
  }

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          initial={ { opacity: 0 } }
          animate={ { opacity: 1 } }
          exit={ { opacity: 0 } }
          transition={ { duration: 0.3 } }
          className={ cn(
            'fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center p-4',
            modalConfig.backdropClassName,
          ) }
          onClick={ handleBackdropClick }
        >
          <motion.div
            initial={ {
              scale: modalConfig.initialScale,
              rotateY: modalConfig.initialRotateY,
              opacity: 0,
            } }
            animate={ { scale: 1, rotateY: 0, opacity: 1 } }
            exit={ {
              scale: modalConfig.initialScale,
              rotateY: -modalConfig.initialRotateY,
              opacity: 0,
            } }
            transition={ {
              type: 'spring',
              stiffness: 200,
              damping: 25,
            } }
            className={ cn(
              'relative bg-backgroundSecondary dark:bg-backgroundSecondary border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-2xl w-full mx-4',
              modalConfig.contentClassName,
            ) }
            style={ {
              boxShadow: `0 20px 60px ${item.color}30`,
            } }
            onClick={ handleContentClick }
          >
            {/* 渐变背景 */}
            <div
              className="absolute inset-0 opacity-20 dark:opacity-10 rounded-3xl"
              style={ {
                background: `linear-gradient(135deg, ${item.color}20, ${item.color}60)`,
              } }
            />

            {render
              ? (
                  <div className="relative z-10">{render(item)}</div>
                )
              : (
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-2xl shrink-0"
                          style={ { backgroundColor: item.color } }
                        >
                          {item.author[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-xl sm:text-2xl font-bold text-textPrimary mb-1">
                            {item.title}
                          </h2>
                          <p className="text-sm sm:text-base text-textSecondary">
                            {item.author}
                            {' '}
                            ·
                            {item.timestamp}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={ onClose }
                        className="text-textSecondary hover:text-textPrimary transition-colors shrink-0"
                      >
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={ 2 }
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="max-w-none">
                      <p className="text-base sm:text-lg text-textPrimary opacity-90 leading-relaxed">
                        {item.content}
                      </p>

                      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
                        <p className="text-sm sm:text-base text-textSecondary leading-relaxed">
                          这是一个演示内容。在实际应用中，这里会显示完整的文章、评论或其他详细信息。
                          你可以添加更多的交互元素、图片、视频等内容来丰富用户体验。
                        </p>
                      </div>
                    </div>
                  </div>
                )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

FeedDetailModal.displayName = 'FeedDetailModal'
