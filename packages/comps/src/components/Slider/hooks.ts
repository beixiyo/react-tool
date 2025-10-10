import { useCallback, useEffect, useState } from 'react'
import { clampValue, getKeyboardDelta, pixelToValue, valueToPixel } from './utils'

/**
 * 滑块值管理 Hook
 */
export function useSliderValue<T extends number | [number, number]>(value: T | undefined, min: number, max: number, step: number | null, dots: boolean, marks: Record<number, any> | undefined, range: boolean, onChange?: (value: T) => void) {
  const [internalValue, setInternalValue] = useState<T>(() => {
    if (value !== undefined)
      return value as T

    if (range)
      return [min, min] as T

    return min as T
  })

  const currentValue = value !== undefined
    ? value
    : internalValue

  const clampFn = useCallback((val: number) => {
    return clampValue(val, min, max, step, dots, marks)
  }, [min, max, step, dots, marks])

  const updateValue = useCallback((newValue: T) => {
    setInternalValue(newValue)
    onChange?.(newValue)
  }, [onChange])

  return {
    currentValue,
    updateValue,
    clampFn,
  }
}

/**
 * 拖拽状态管理 Hook
 */
export function useDragState() {
  const [isDragging, setIsDragging] = useState(false)
  const [dragIndex, setDragIndex] = useState<number>(0)

  const startDrag = useCallback((index: number = 0) => {
    setIsDragging(true)
    setDragIndex(index)
  }, [])

  const endDrag = useCallback(() => {
    setIsDragging(false)
    setDragIndex(0)
  }, [])

  return {
    isDragging,
    dragIndex,
    startDrag,
    endDrag,
  }
}

/**
 * 像素转换 Hook
 */
export function usePixelConversion(sliderRef: React.RefObject<HTMLDivElement>, min: number, max: number, vertical: boolean, reverse: boolean, clampFn: (val: number) => number) {
  const pixelToValueFn = useCallback((pixel: number) => {
    if (!sliderRef.current)
      return min

    const rect = sliderRef.current.getBoundingClientRect()
    return pixelToValue(pixel, rect, min, max, vertical, reverse, clampFn)
  }, [sliderRef, min, max, vertical, reverse, clampFn])

  const valueToPixelFn = useCallback((val: number) => {
    return valueToPixel(val, min, max, vertical, reverse)
  }, [min, max, vertical, reverse])

  return {
    pixelToValue: pixelToValueFn,
    valueToPixel: valueToPixelFn,
  }
}

/**
 * 拖拽事件处理 Hook
 */
export function useDragHandlers<T extends number | [number, number]>(isDragging: boolean, disabled: boolean, vertical: boolean, range: boolean, currentValue: T, dragIndex: number, pixelToValue: (pixel: number) => number, updateValue: (value: T) => void, endDrag: () => void, startDrag: (index: number) => void) {
  const handleStart = useCallback((event: React.MouseEvent | React.TouchEvent, index: number = 0) => {
    if (disabled)
      return

    event.preventDefault()
    startDrag(index)

    const clientX = 'touches' in event
      ? event.touches[0].clientX
      : event.clientX
    const clientY = 'touches' in event
      ? event.touches[0].clientY
      : event.clientY
    const newValue = pixelToValue(vertical
      ? clientY
      : clientX)

    if (range && Array.isArray(currentValue)) {
      const newRangeValue: [number, number] = [...currentValue] as [number, number]
      newRangeValue[index] = newValue
      /** 确保范围值的顺序正确 */
      if (newRangeValue[0] > newRangeValue[1]) {
        newRangeValue.reverse()
      }
      updateValue(newRangeValue as T)
    }
    else {
      updateValue(newValue as T)
    }
  }, [disabled, vertical, range, currentValue, pixelToValue, updateValue, startDrag])

  const handleMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDragging || disabled)
      return

    const clientX = 'touches' in event
      ? event.touches[0].clientX
      : event.clientX
    const clientY = 'touches' in event
      ? event.touches[0].clientY
      : event.clientY
    const newValue = pixelToValue(vertical
      ? clientY
      : clientX)

    if (range && Array.isArray(currentValue)) {
      const newRangeValue: [number, number] = [...currentValue] as [number, number]
      newRangeValue[dragIndex] = newValue
      /** 确保范围值的顺序正确 */
      if (newRangeValue[0] > newRangeValue[1]) {
        [newRangeValue[0], newRangeValue[1]] = [newRangeValue[1], newRangeValue[0]]
      }
      updateValue(newRangeValue as T)
    }
    else {
      updateValue(newValue as T)
    }
  }, [isDragging, disabled, vertical, range, currentValue, dragIndex, pixelToValue, updateValue])

  const handleEnd = useCallback((onChangeComplete?: (value: T) => void) => {
    if (isDragging) {
      endDrag()
      onChangeComplete?.(currentValue)
    }
  }, [isDragging, endDrag, currentValue])

  return {
    handleStart,
    handleMove,
    handleEnd,
  }
}

/**
 * 键盘事件处理 Hook
 */
export function useKeyboardHandler<T extends number | [number, number]>(keyboard: boolean, disabled: boolean, step: number | null, min: number, max: number, range: boolean, currentValue: T, clampFn: (val: number) => number, updateValue: (value: T) => void, onChangeComplete?: (value: T) => void) {
  const handleKeyDown = useCallback((event: React.KeyboardEvent, index: number = 0) => {
    if (!keyboard || disabled)
      return

    const delta = getKeyboardDelta(
      event.key,
      step || 1,
      min,
      max,
      currentValue,
      index,
    )

    if (delta === 0)
      return

    event.preventDefault()

    if (range && Array.isArray(currentValue)) {
      const newRangeValue: [number, number] = [...currentValue] as [number, number]
      newRangeValue[index] = clampFn(currentValue[index] + delta)
      /** 确保范围值的顺序正确 */
      if (newRangeValue[0] > newRangeValue[1]) {
        [newRangeValue[0], newRangeValue[1]] = [newRangeValue[1], newRangeValue[0]]
      }
      updateValue(newRangeValue as T)
      onChangeComplete?.(newRangeValue as T)
    }
    else if (typeof currentValue === 'number') {
      const newValue = clampFn(currentValue + delta)
      updateValue(newValue as T)
      onChangeComplete?.(newValue as T)
    }
  }, [keyboard, disabled, step, min, max, range, currentValue, clampFn, updateValue, onChangeComplete])

  return { handleKeyDown }
}

/**
 * 全局事件监听 Hook
 */
export function useGlobalEvents<T extends number | [number, number]>(isDragging: boolean, handleMove: (event: MouseEvent | TouchEvent) => void, handleEnd: (onChangeComplete?: (value: T) => void) => void, onChangeComplete?: (value: T) => void) {
  useEffect(() => {
    if (!isDragging)
      return

    const handleMouseMove = (e: MouseEvent) => handleMove(e)
    const handleMouseUp = () => handleEnd(onChangeComplete)
    const handleTouchMove = (e: TouchEvent) => handleMove(e)
    const handleTouchEnd = () => handleEnd(onChangeComplete)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, handleMove, handleEnd, onChangeComplete])
}
