import type { TimeFunc } from '@jl-org/cvs'
import { ScrollTrigger } from '@jl-org/tool'
import { memo, useEffect, useRef, useState } from 'react'
import { cn } from 'utils'

/** 动画卡片组件 */
export const AnimatedCard = memo<{
  title: string
  ease?: TimeFunc
  className?: string
  startPos?: number
  endPos?: number
}>(({
  title,
  ease = 'linear',
  className,
  startPos = 300,
  endPos = 500,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const opacityRef = useRef<HTMLDivElement>(null)
  const scaleRef = useRef<HTMLDivElement>(null)
  const rotateRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!cardRef.current)
      return

    /** 创建滚动触发器 */
    const trigger = new ScrollTrigger({
      trigger: cardRef.current,
      start: ['top', 'center', `-=${startPos}`],
      end: ['top', 'center', `+=${endPos}`],
      ease,
      markers: process.env.NODE_ENV === 'development',
      /** 启用scrub以确保动画严格跟随滚动位置 */
      scrub: true,
      onUpdate: (self) => {
        /** 只更新进度显示和进度条 */
        setProgress(self.progress)

        if (progressRef.current) {
          progressRef.current.style.width = `${self.progress * 100}%`
        }
      },
      /** 使用targets和props配置自动处理动画 */
      targets: [opacityRef.current!, scaleRef.current!, rotateRef.current!],
      props: [
        /** 起始值 */
        {
          opacity: 0,
          scale: 0.5,
          rotate: 0,
        },
        /** 结束值 */
        {
          opacity: 1,
          scale: 1,
          rotate: 360,
        },
      ],
    })

    /** 清理函数 */
    return () => {
      trigger.destroy()
    }
  }, [ease, startPos, endPos])

  return (
    <div
      ref={ cardRef }
      className={ cn(
        'flex flex-col items-center p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 w-full max-w-md mx-auto',
        className,
      ) }
    >
      <h3 className="mb-4 text-xl text-gray-900 font-semibold dark:text-white">
        { title }
      </h3>

      {/* 进度显示 */ }
      <div className="mb-6 h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          ref={ progressRef }
          className="h-full rounded-full bg-blue-500 transition-all duration-100"
          style={ { width: '0%' } }
        />
      </div>

      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        当前进度:
        { ' ' }
        { (progress * 100).toFixed(1) }
        %
      </p>

      <div className="grid grid-cols-3 w-full gap-4">
        {/* 透明度动画 */ }
        <div className="flex flex-col items-center gap-2">
          <div
            ref={ opacityRef }
            className="h-16 w-16 rounded-lg bg-purple-500"
            style={ { opacity: 0 } }
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">透明度</span>
        </div>

        {/* 缩放动画 */ }
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-16 flex items-center justify-center">
            <div
              ref={ scaleRef }
              className="h-16 w-16 rounded-lg bg-green-500"
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">缩放</span>
        </div>

        {/* 旋转动画 */ }
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-16 flex items-center justify-center">
            <div
              ref={ rotateRef }
              className="h-16 w-16 rounded-lg bg-amber-500"
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">旋转</span>
        </div>
      </div>
    </div>
  )
})
AnimatedCard.displayName = 'AnimatedCard'
