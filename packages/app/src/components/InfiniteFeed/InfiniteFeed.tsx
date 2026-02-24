import type { FeedItem, InfiniteFeedProps } from './types'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { DEFAULT_COLORS, generateRandomFeedItem } from './constants'
import { FeedCard } from './FeedCard'
import { FeedDetailModal } from './FeedDetailModal'
import { FeedSettingsPanel } from './FeedSettingsPanel'
import { useFeedItems, useSelectedItem } from './hooks'

/**
 * 无限滚动信息流组件
 * 支持自动生成、自定义渲染、动画配置等功能
 */
export const InfiniteFeed = memo<InfiniteFeedProps>((props) => {
  const {
    initialItems = [],
    autoGenerateInterval = 1,
    generateItem = generateRandomFeedItem,
    maxDisplayCount = 10,
    maxRetainCount = 15,
    onCardClick,
    cardRenderConfig,
    animationConfig,
    detailModalConfig,
    settingsPanelConfig,
    renderCard,
    renderDetail,
    backgroundClassName,
    containerClassName,
    showSettingsButton = true,
    paused: controlledPaused,
    onPausedChange,
    speed: controlledSpeed,
    onSpeedChange,
  } = props

  /** 使用受控或非受控的暂停状态 */
  const [internalPaused, setInternalPaused] = useState(false)
  const isPaused = controlledPaused !== undefined
    ? controlledPaused
    : internalPaused
  const setPaused = (value: boolean) => {
    if (controlledPaused === undefined) {
      setInternalPaused(value)
    }
    onPausedChange?.(value)
  }

  /** 使用受控或非受控的速度 */
  const [internalSpeed, setInternalSpeed] = useState(autoGenerateInterval)
  const speed = controlledSpeed !== undefined
    ? controlledSpeed
    : internalSpeed
  const setSpeed = (value: number) => {
    if (controlledSpeed === undefined) {
      setInternalSpeed(value)
    }
    onSpeedChange?.(value)
  }

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  /** 初始化数据 */
  const initialData = initialItems.length > 0
    ? initialItems
    : Array.from({ length: 5 }, (_, i) => generateItem(i))

  const { items, addItem } = useFeedItems(
    initialData,
    generateItem,
    speed,
    maxRetainCount,
    isPaused,
  )

  const { selectedItem, selectItem, clearSelection } = useSelectedItem<FeedItem>(setPaused)

  const handleCardClick = (item: FeedItem) => {
    selectItem(item)
    onCardClick?.(item)
  }

  const handleAddContent = (newItem: Omit<FeedItem, 'id' | 'timestamp' | 'color'>) => {
    const color = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]
    addItem({
      ...newItem,
      color,
    })
  }

  return (
    <div className={ cn('relative min-h-screen w-full overflow-hidden bg-background', backgroundClassName) }>
      {/* 设置按钮 */}
      {showSettingsButton && settingsPanelConfig?.enabled !== false && (
        <motion.button
          whileHover={ { scale: 1.05 } }
          whileTap={ { scale: 0.95 } }
          onClick={ () => setIsSettingsOpen(true) }
          className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30 w-11 h-11 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center transition-all hover:bg-blue-700"
          style={ {
            boxShadow: '0 4px 12px var(--shadow)',
          } }
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={ 2 }
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </motion.button>
      )}

      {/* 背景渐变效果 */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 via-transparent to-info/20" />
      </div>

      {/* 信息流容器 */}
      <div className={ cn('relative h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8', containerClassName) }>
        <div className="w-full max-w-2xl space-y-3 sm:space-y-4">
          {/*
            AnimatePresence 跟踪数组变化，触发进入/退出动画
            配合 FeedCard 的 layout 属性实现自动 Y 轴滚动：

            工作原理：
            1. 新项添加到数组顶部 → 新卡片执行 initial 动画（从 y=100 滑入到 y=0）
            2. 原有项的索引位置改变 → layout 自动计算位置变化并补间动画
            3. 所有卡片向下移动 → 视觉上呈现"向上滚动"的效果
            4. 超出 maxRetainCount 的项被移除 → 执行 exit 动画

            关键点：
            - key={item.id} 让 framer-motion 能准确跟踪每个元素
            - FeedCard 的 layout 属性让位置变化自动补间
            - 无需手动计算每个卡片的 Y 坐标！
          */}
          <AnimatePresence>
            {items.map((item, index) => (
              <FeedCard
                key={ item.id }
                item={ item }
                index={ index }
                onClick={ handleCardClick }
                config={ cardRenderConfig }
                animationConfig={ animationConfig }
                render={ renderCard }
                maxDisplayCount={ maxDisplayCount }
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 详情弹窗 */}
      <FeedDetailModal
        item={ selectedItem }
        isOpen={ !!selectedItem }
        onClose={ clearSelection }
        config={ detailModalConfig }
        render={ renderDetail }
      />

      {/* 设置面板 */}
      <FeedSettingsPanel
        isOpen={ isSettingsOpen }
        onClose={ () => setIsSettingsOpen(false) }
        speed={ speed }
        onSpeedChange={ setSpeed }
        onAddContent={ handleAddContent }
        config={ settingsPanelConfig }
      />
    </div>
  )
})

InfiniteFeed.displayName = 'InfiniteFeed'
