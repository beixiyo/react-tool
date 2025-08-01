'use client'

import React, { memo, useMemo } from 'react'

/**
 * PixelStyle 组件用于在其子元素上覆盖一层像素化效果。
 * 效果的参数通过 props 控制。
 */
export const PixelStyle: React.FC<PixelStyleProps> = memo(({
  isPixelActive,
  gradient,
  pixelSize,
  blurDrop,
  children,
  pixelOverlayClassName = '',
  pixelOverlayStyle = {},
}) => {
  /** 根据传入的 props 计算像素层的动态样式 */
  const dynamicPixelStyle = useMemo<React.CSSProperties>(() => {
    if (isPixelActive) {
      return {
        backgroundImage: `radial-gradient(transparent ${gradient}px, #fff ${gradient}px)`,
        backgroundSize: `${pixelSize}px ${pixelSize}px`,
        backdropFilter: `blur(${blurDrop}px)`,
        /** 默认让覆盖层铺满父相对定位容器 */
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 50, // 确保在顶层
        pointerEvents: 'none', // 允许鼠标事件穿透到下层子元素
        ...pixelOverlayStyle, // 合并外部传入的内联样式
      }
    }
    return { display: 'none' } // 不激活时隐藏覆盖层
  }, [isPixelActive, gradient, pixelSize, blurDrop, pixelOverlayStyle])

  return (
    /** 子内容的容器，需要相对定位以使绝对定位的像素层正确工作 */
    <div className="relative h-full w-full">
      { children }
      <div
        className={ pixelOverlayClassName }
        style={ dynamicPixelStyle }
        aria-hidden="true" // 装饰性元素，对辅助技术隐藏
      />
    </div>
  )
})

PixelStyle.displayName = 'PixelStyle'

interface PixelStyleProps {
  /** 是否启用像素化效果 */
  isPixelActive: boolean
  /** 渐变程度 (px) */
  gradient: number
  /** 像素块大小 (px) */
  pixelSize: number
  /** 背景模糊程度 (px) */
  blurDrop: number
  /** 需要应用像素效果的内容 */
  children: React.ReactNode
  /** 自定义像素覆盖层的类名 */
  pixelOverlayClassName?: string
  /** 自定义像素覆盖层的内联样式 */
  pixelOverlayStyle?: React.CSSProperties
}
