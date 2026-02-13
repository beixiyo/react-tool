import type { FeedCardProps } from './types'
import { motion } from 'motion/react'
import { memo } from 'react'
import { cn } from 'utils'
import { DEFAULT_ANIMATION_CONFIG, DEFAULT_CARD_RENDER_CONFIG } from './constants'

/**
 * 信息流卡片组件
 * 支持自定义渲染、动画配置和交互行为
 */
export const FeedCard = memo<FeedCardProps>((props) => {
  const {
    item,
    index,
    onClick,
    config = {},
    animationConfig = {},
    render,
    maxDisplayCount = 10,
  } = props

  const cardConfig = { ...DEFAULT_CARD_RENDER_CONFIG, ...config }
  const animConfig = { ...DEFAULT_ANIMATION_CONFIG, ...animationConfig }

  const handleClick = () => {
    onClick?.(item)
  }

  /** 自定义渲染内容 */
  const cardContent = render
    ? render(item, index)
    : (
        <motion.div
          whileHover={ {
            scale: cardConfig.hoverScale,
            transition: { duration: 0.2 },
          } }
          whileTap={ { scale: cardConfig.tapScale } }
          className={ cn(
            'relative bg-background2 dark:bg-background2 border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden',
            cardConfig.className,
          ) }
          style={ {
            boxShadow: `0 8px 32px ${item.color}20`,
          } }
        >
          {/* 卡片渐变背景 */}
          <div
            className="absolute inset-0 opacity-10 dark:opacity-5"
            style={ {
              background: `linear-gradient(135deg, ${item.color}00, ${item.color}40)`,
            } }
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {cardConfig.showAvatar && (
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base shrink-0"
                    style={ { backgroundColor: item.color } }
                  >
                    {item.author[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-text truncate text-sm sm:text-base">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-text2">{item.author}</p>
                </div>
              </div>
              {cardConfig.showTimestamp && (
                <span className="text-xs text-text2 shrink-0">{item.timestamp}</span>
              )}
            </div>
            <p
              className={ cn(
                'text-sm sm:text-base text-text opacity-90 leading-relaxed',
                cardConfig.contentMaxLines === 1 && 'truncate',
                cardConfig.contentMaxLines === 2 && 'line-clamp-2',
                cardConfig.contentMaxLines === 3 && 'line-clamp-3',
                cardConfig.contentMaxLines === 4 && 'line-clamp-4',
              ) }
            >
              {item.content}
            </p>
          </div>
        </motion.div>
      )

  return (
    <motion.div
      /**
       * 【layout 魔法】当卡片在 DOM 中的位置改变时，自动计算并补间动画到新位置
       * 这就是为什么数组更新后，所有卡片会自动向下移动（呈现向上滚动的效果）！
       */
      layout
      /** 【入场动画初始状态】新卡片从下方滑入 */
      initial={ {
        opacity: 0,
        y: animConfig.initialY, // 从下方 100px 处开始
        scale: animConfig.initialScale, // 初始缩小到 0.8
        rotateX: animConfig.initialRotateX, // 带 3D 翻转效果
      } }
      /** 【动画目标状态】滑动到正常位置 */
      animate={ {
        opacity: index < maxDisplayCount
          ? 1
          : 0, // 超出显示数量的卡片透明
        y: 0, // Y 轴归位到正常位置（实现向上滚动效果）
        scale: 1, // 恢复正常大小
        rotateX: 0, // 旋转归零
      } }
      /** 【退出动画】旧卡片向上滑出 */
      exit={ {
        opacity: 0,
        y: animConfig.exitY, // 向上移动 -100px 并消失
        scale: animConfig.exitScale, // 缩小到 0.8
        transition: {
          duration: animConfig.exitDuration, // 0.5 秒完成退出
          ease: [0.43, 0.13, 0.23, 0.96], // 自定义缓动曲线
        },
      } }
      /** 【弹簧动画配置】让滚动更自然 */
      transition={ {
        type: 'spring', // 使用弹簧物理模型
        stiffness: animConfig.stiffness, // 刚度 100
        damping: animConfig.damping, // 阻尼 20
        mass: animConfig.mass, // 质量 1
      } }
      className="relative cursor-pointer"
      onClick={ handleClick }
    >
      {cardContent}
    </motion.div>
  )
})

FeedCard.displayName = 'FeedCard'
