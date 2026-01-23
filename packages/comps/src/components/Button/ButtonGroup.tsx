import type { ButtonGroupProps } from './types'
import { memo, useEffect, useMemo, useRef } from 'react'
import { cn } from 'utils'
import { getRoundedStyles } from '../../utils/roundedUtils'
import { ButtonGroupContext } from './ButtonGroupContext'
import { BUTTON_ATTR } from './constans'

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
    rounded = 'full',
    updateId,
  } = props

  const currentValue = active ?? ''

  const containerRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  /** 存储注册的按钮元素，key 为 name */
  const buttonsRef = useRef<Map<string, HTMLElement | null>>(new Map())

  /** 计算并更新选中项位置（可被外部注册调用） */
  const computeAndApplyThumb = () => {
    const container = containerRef.current
    const thumb = thumbRef.current
    if (!container || !thumb)
      return

    const registeredEl = buttonsRef.current.get(currentValue)
    const activeButton = registeredEl ?? container.querySelector(
      `button[${BUTTON_ATTR.name}="${currentValue}"]`,
    ) as HTMLElement | null

    if (activeButton) {
      const containerRect = container.getBoundingClientRect()
      const activeRect = activeButton.getBoundingClientRect()

      const left = activeRect.left - containerRect.left
      const width = activeRect.width

      thumb.style.transform = `translateX(${left}px)`
      thumb.style.width = `${width}px`
    }
    else {
      thumb.style.width = '0px'
    }
  }

  const contextValue = useMemo(() => ({
    active: currentValue,
    onChange: (val: string) => {
      if (val !== currentValue && onChange) {
        onChange(val)
      }
    },
    register: (name: string, el: HTMLElement | null) => {
      if (!name)
        return
      buttonsRef.current.set(name, el)
      if (name === currentValue) {
        requestAnimationFrame(() => {
          computeAndApplyThumb()
        })
      }
    },
    unregister: (name: string) => {
      if (!name)
        return
      buttonsRef.current.delete(name)
    },
  }), [currentValue, onChange])

  /** 计算并更新选中项的滑动指示器位置 */
  useEffect(() => {
    if (!containerRef.current || !thumbRef.current)
      return

    computeAndApplyThumb()
    requestAnimationFrame(() => {
      requestAnimationFrame(computeAndApplyThumb)
    })
  }, [currentValue, updateId])

  const { className: roundedClass, style: roundedStyle } = getRoundedStyles(rounded)

  return (
    <ButtonGroupContext value={ contextValue }>
      <div
        ref={ containerRef }
        className={ cn(
          'relative flex items-center border border-border bg-buttonTertiary w-fit',
          roundedClass,
          className,
        ) }
        style={ {
          ...style,
          ...roundedStyle,
        } }
      >
        {/* 滑动指示器（选中项背景） */ }
        <div
          ref={ thumbRef }
          className={ cn(
            'absolute top-0 left-0 h-full bg-buttonPrimary ease-out pointer-events-none',
            roundedClass,
          ) }
          style={ {
            width: '0px',
            transition: '.2s',
            ...roundedStyle,
          } }
        />

        { children }
      </div>
    </ButtonGroupContext>
  )
})

ButtonGroup.displayName = 'ButtonGroup'
