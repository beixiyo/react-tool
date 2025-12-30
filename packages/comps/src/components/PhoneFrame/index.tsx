import type { ReactNode } from 'react'
import { clamp } from '@jl-org/tool'

/**
 * 手机外壳组件
 * @example
 * @see {@link http://localhost:9977/PhoneCarousel}
 */

export const PhoneFrame = memo<PhoneFrameProps>(({
  scale = 1,
  children,
  className = '',
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  /** 计算缩放后的尺寸 */
  const scaledWidth = 375 * scale
  const scaledHeight = 812 * scale
  const notchSize = 20 * scale
  const notchWidth = 100 * scale
  const borderRadius = 60 * scale
  const innerBorderRadius = 50 * scale
  const homeIndicatorWidth = 80 * scale
  const homeIndicatorHeight = 3 * scale
  const phoneBorderSize = clamp(1.5, 8, 8 * scale)

  return (
    <div className={ className }>
      {/* Phone Outer Frame */ }
      <div
        className="bg-black shadow-2xl"
        style={ {
          width: scaledWidth,
          height: scaledHeight,
          padding: phoneBorderSize,
          borderRadius,
        } }>
        {/* Phone Inner Frame */ }
        <div
          className="relative h-full w-full overflow-hidden bg-white dark:bg-gray-800"
          style={ {
            borderRadius: innerBorderRadius,
          } }>
          {/* Status Bar */ }
          { showStatusBar && (
            <div className="flex items-center justify-between px-6 pb-2 pt-3 text-sm text-black font-medium dark:text-white">
              <span>9:33</span>

              {/* 苹果刘海 - 水平居中 */ }
              <div
                className="absolute left-1/2 top-[12px] transform rounded-full bg-black -translate-x-1/2"
                style={ {
                  height: notchSize,
                  width: notchWidth,
                } }></div>

              <div className="flex items-center gap-1">
                <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.24 0 1 1 0 01-1.415-1.414 5 5 0 017.07 0 1 1 0 01-1.415 1.414zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>

                <div className="h-3 w-6 border border-black rounded-full p-px dark:border-white">
                  <div className="size-full rounded-full bg-black dark:bg-white"></div>
                </div>
              </div>
            </div>
          ) }

          {/* 内容区域 */ }
          { children }

          {/* Home Indicator */ }
          { showHomeIndicator && (
            <div
              className="absolute bottom-2 left-1/2 transform rounded-full bg-black -translate-x-1/2 dark:bg-white"
              style={ {
                height: homeIndicatorHeight,
                width: homeIndicatorWidth,
              } }></div>
          ) }
        </div>
      </div>
    </div>
  )
})

/**
 * 手机外壳组件属性
 */
export interface PhoneFrameProps {
  /**
   * 组件整体缩放比例
   * @default 1
   */
  scale?: number
  /**
   * 内部内容
   */
  children: ReactNode
  /**
   * 自定义样式
   */
  className?: string
  /**
   * 是否显示状态栏
   * @default true
   */
  showStatusBar?: boolean
  /**
   * 是否显示Home指示器
   * @default true
   */
  showHomeIndicator?: boolean
}
