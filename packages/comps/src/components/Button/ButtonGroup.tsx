import { memo, useRef, useEffect, useMemo } from 'react'
import { cn } from 'utils'
import type { ButtonGroupProps } from './types'
import { ButtonGroupContext } from './ButtonGroupContext'

/**
 * 按钮组组件，用于在多个选项之间切换（类似 Segmented Control）
 *
 * 通过嵌套 Button 组件使用，Button 需要提供 name 属性
 *
 * @example
 * <ButtonGroup active="grid" onChange={setValue}>
 *   <Button name="grid" leftIcon={<GridViewSVG />} />
 *   <Button name="list" leftIcon={<ListViewSVG />} />
 * </ButtonGroup>
 */
export const ButtonGroup = memo<ButtonGroupProps>((props) => {
  const {
    active,
    onChange,
    children,
    className,
    style,
  } = props

  const currentValue = active ?? ''

  const containerRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)

  // Context 值
  const contextValue = useMemo(() => ({
    active: currentValue,
    onChange: (val: string) => {
      if (val !== currentValue && onChange) {
        onChange(val)
      }
    },
  }), [currentValue, onChange])

  // 计算并更新选中项的滑动指示器位置
  useEffect(() => {
    if (!containerRef.current || !thumbRef.current) return

    const updateThumbPosition = () => {
      const container = containerRef.current
      const thumb = thumbRef.current
      if (!container || !thumb) return

      // 查找选中按钮
      const activeButton = container.querySelector(
        `button[data-button-name="${currentValue}"]`
      ) as HTMLElement | null

      if (activeButton) {
        const containerRect = container.getBoundingClientRect()
        const activeRect = activeButton.getBoundingClientRect()

        const left = activeRect.left - containerRect.left
        const width = activeRect.width

        thumb.style.transform = `translateX(${left}px)`
        thumb.style.width = `${width}px`
      }
    }

    // 立即执行一次
    updateThumbPosition()

    // 等待下一帧，确保布局完成后再计算（处理初始渲染）
    requestAnimationFrame(() => {
      requestAnimationFrame(updateThumbPosition)
    })
  }, [currentValue])

  return (
    <ButtonGroupContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={cn(
          'relative flex items-center rounded-[14px] border border-border bg-buttonTertiary w-fit',
          className
        )}
        style={style}
      >
        {/* 滑动指示器（选中项背景） */}
        <div
          ref={thumbRef}
          className="absolute top-0 left-0 h-full bg-buttonPrimary rounded-[14px] transition-all duration-200 ease-out pointer-events-none"
          style={{
            width: '0px',
          }}
        />

        {children}
      </div>
    </ButtonGroupContext.Provider>
  )
})

ButtonGroup.displayName = 'ButtonGroup'

