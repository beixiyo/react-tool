'use client'

import type { CascaderProps, CascaderRef } from './types'
import { useFloatingPosition } from 'hooks'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import { AnimateShow } from '../Animate'
import { useFormField } from '../Form/useFormField'
import { CascaderOption } from './CascaderOption'

const InnerCascader = forwardRef<CascaderRef, CascaderProps>(({
  options,
  value,
  defaultValue,
  onChange,
  onClickOutside,
  open: controlledOpen,
  onOpenChange,
  trigger,
  onTriggerClick,
  placement = 'bottom-start',
  offset = 4,
  dropdownHeight = 150,
  dropdownMinWidth = 160,
  className,
  dropdownClassName,
  optionClassName,
  disabled = false,
  name,
  error,
  errorMessage,
  dropdownProps,
}, ref) => {
  /** 判断是否为受控模式 */
  const isControlled = controlledOpen !== undefined

  /** 内部打开状态（非受控模式使用） */
  const [internalOpen, setInternalOpen] = useState(false)

  /** 实际使用的打开状态 */
  const isOpen = isControlled
    ? controlledOpen
    : internalOpen

  /** 菜单栈，用于管理多级菜单 */
  const [menuStack, setMenuStack] = useState<typeof options[]>([options])

  /** 触发器元素引用 */
  const triggerRef = useRef<HTMLDivElement>(null)
  /** 下拉面板引用 */
  const dropdownRef = useRef<HTMLDivElement>(null)
  /** 是否应该显示动画，位置计算完成后才为 true */
  const [shouldAnimate, setShouldAnimate] = useState(false)

  /** 使用 useFormField 处理表单集成 */
  const {
    actualValue,
    actualError,
    actualErrorMessage,
    handleChangeVal,
    handleBlur,
  } = useFormField<string>({
    name,
    value,
    defaultValue: '',
    error,
    errorMessage,
    onChange,
  })

  /** 内部值管理 */
  const [internalValue, setInternalValue] = useState<string>(() => {
    if (actualValue !== undefined) {
      return actualValue
    }
    if (defaultValue !== undefined) {
      return defaultValue
    }
    return ''
  })

  /** 查找选项标签 */
  const findLabel = useCallback((opts: typeof options, val: string): React.ReactNode => {
    for (const opt of opts) {
      if (opt.value === val)
        return opt.label
      if (opt.children) {
        const label = findLabel(opt.children, val)
        if (label)
          return label
      }
    }
    return ''
  }, [])

  /** 更新内部值当受控值变化时 */
  useEffect(() => {
    if (actualValue !== undefined) {
      setInternalValue(actualValue)
    }
  }, [actualValue])

  /** 更新 menuStack 当 options 变化时 */
  useEffect(() => {
    setMenuStack([options])
  }, [options])

  const {
    style,
    update: updatePosition,
  } = useFloatingPosition(triggerRef, dropdownRef, {
    enabled: isOpen,
    placement,
    offset,
    boundaryPadding: 8,
    flip: true,
    shift: true,
    autoUpdate: true,
    scrollCapture: true,
    strategy: 'fixed',
  })

  /** 当打开状态变化时，计算位置 */
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      /** 先重置动画状态和菜单栈 */
      setShouldAnimate(false)
      setMenuStack([options])
      /** 使用 requestAnimationFrame 确保 DOM 已更新 */
      requestAnimationFrame(() => {
        updatePosition()
        setShouldAnimate(true)
      })
    }
    else {
      /** 关闭时重置动画状态和菜单栈 */
      setShouldAnimate(false)
      setMenuStack([options])
    }
  }, [isOpen, updatePosition, options])

  /** 处理点击外部关闭 */
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      triggerRef.current && !triggerRef.current.contains(event.target as Node)
      && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
    ) {
      if (isControlled) {
        onOpenChange?.(false)
      }
      else {
        setInternalOpen(false)
      }
      onClickOutside?.()
      handleBlur()
    }
  }, [isControlled, onOpenChange, onClickOutside, handleBlur])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  /** 处理选项点击 */
  const handleOptionClick = useCallback((optionValue: string) => {
    if (disabled)
      return

    const findOption = (opts: typeof options): (typeof options[0] | undefined) => {
      for (const opt of opts) {
        if (opt.value === optionValue)
          return opt
        if (opt.children) {
          const found = findOption(opt.children)
          if (found)
            return found
        }
      }
    }
    const option = findOption(options)

    if (option && !option.children) {
      setInternalValue(optionValue)
      handleChangeVal(optionValue, {} as any)
      if (isControlled) {
        onOpenChange?.(false)
      }
      else {
        setInternalOpen(false)
      }
    }
  }, [disabled, handleChangeVal, options, isControlled, onOpenChange])

  /** 处理选项悬停 */
  const handleOptionHover = useCallback((option: typeof options[0], level: number) => {
    const newStack = menuStack.slice(0, level + 1)
    if (option.children) {
      newStack.push(option.children)
    }
    setMenuStack(newStack)
  }, [menuStack])

  /** 处理触发器点击 */
  const handleTriggerClick = useCallback(() => {
    if (disabled)
      return

    onTriggerClick?.()

    if (isControlled) {
      onOpenChange?.(!isOpen)
    }
    else {
      setInternalOpen(!isOpen)
    }
  }, [disabled, onTriggerClick, isControlled, onOpenChange, isOpen])

  /** 暴露 ref 方法 */
  useImperativeHandle(ref, () => ({
    open: () => {
      if (disabled || isOpen)
        return
      if (isControlled) {
        onOpenChange?.(true)
      }
      else {
        setInternalOpen(true)
      }
    },
    close: () => {
      if (isControlled) {
        onOpenChange?.(false)
      }
      else {
        setInternalOpen(false)
      }
    },
  }), [disabled, isOpen, isControlled, onOpenChange])

  /** 下拉面板内容 */
  const dropdownContent = isOpen && (
    <AnimateShow
      show={ shouldAnimate }
      ref={ dropdownRef }
      variants="scale"
      visibilityMode
      animateOnMount={ false }
      display="block"
      style={ {
        ...style,
        zIndex: 50,
      } }
    >
      <div
        className={ cn(
          'bg-background rounded-2xl shadow-lg flex text-textPrimary',
          dropdownClassName,
        ) }
        { ...dropdownProps }
      >
        { menuStack.map((menuOptions, level) => (
          <div
            key={ level }
            className="overflow-auto border-r border-border last:border-r-0"
            style={ { maxHeight: dropdownHeight } }
          >
            <div className="py-1" style={ { minWidth: `${dropdownMinWidth}px` } }>
              { menuOptions.map(option => (
                <CascaderOption
                  key={ option.value }
                  option={ option }
                  selected={ internalValue === option.value }
                  onClick={ handleOptionClick }
                  onMouseEnter={ () => handleOptionHover(option, level) }
                  className={ optionClassName }
                />
              )) }
            </div>
          </div>
        )) }
      </div>
    </AnimateShow>
  )

  return (
    <>
      { trigger && (
        <div
          ref={ triggerRef }
          className={ cn('inline-block', className) }
          onClick={ handleTriggerClick }
        >
          { trigger }
        </div>
      ) }
      { !trigger && (
        <div ref={ triggerRef } className={ cn('inline-block', className) } />
      ) }
      { createPortal(dropdownContent, document.body) }
      { actualError && actualErrorMessage && (
        <div className="mt-1 text-xs text-danger">
          { actualErrorMessage }
        </div>
      ) }
    </>
  )
})

InnerCascader.displayName = 'Cascader'

export const Cascader = memo(InnerCascader)
