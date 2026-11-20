import { cn } from 'utils'
import { COMPONENT_DATA_ATTR } from '../../../constants/dataAttributes'
import { DEFAULT_FLOATING_ARROW_SIZE, FloatingArrow, resolveFloatingOffset } from '../../FloatingArrow'
import { TOOLTIP_OFFSET, TOOLTIP_SURFACE_CLASS } from '../../Tooltip/styles'
import type { SliderStyleConfig, TooltipConfig } from '../types'

const tooltipGap = resolveFloatingOffset({ offset: TOOLTIP_OFFSET, arrow: true })
const arrowCenter = `calc(50% - ${DEFAULT_FLOATING_ARROW_SIZE / 2}px)`

const tooltipPositions = {
  top: {
    className: 'left-1/2 -translate-x-1/2',
    style: { bottom: `calc(100% + ${tooltipGap}px)` },
    arrowStyle: { left: arrowCenter },
  },
  bottom: {
    className: 'left-1/2 -translate-x-1/2',
    style: { top: `calc(100% + ${tooltipGap}px)` },
    arrowStyle: { left: arrowCenter },
  },
  left: {
    className: 'top-1/2 -translate-y-1/2',
    style: { right: `calc(100% + ${tooltipGap}px)` },
    arrowStyle: { top: arrowCenter },
  },
  right: {
    className: 'top-1/2 -translate-y-1/2',
    style: { left: `calc(100% + ${tooltipGap}px)` },
    arrowStyle: { top: arrowCenter },
  },
}

/**
 * 渲染刻度标记
 */
export function renderMarks(
  marks: Record<number, any> | undefined,
  min: number,
  max: number,
  currentValue: number | [number, number],
  included: boolean,
  vertical: boolean,
  valueToPixel: (val: number) => number,
  finalStyleConfig: SliderStyleConfig,
) {
  if (!marks) return null

  return Object.entries(marks).map(([key, mark]) => {
    const value = Number(key)
    if (value < min || value > max) return null

    const position = valueToPixel(value)
    const isActive = Array.isArray(currentValue)
      ? value >= currentValue[0] && value <= currentValue[1]
      : value <= (currentValue as number)

    const markStyle = vertical
      ? { bottom: `${position}%` }
      : { left: `${position}%` }

    const label = mark && typeof mark === 'object' && 'label' in mark
      ? mark.label
      : mark
    const markCustomStyle = mark && typeof mark === 'object' && 'style' in mark
      ? mark.style
      : undefined

    return (
      <div
        key={ key }
        className={ cn(
          'absolute flex items-center justify-center',
          vertical
            ? 'right-0 translate-x-full'
            : 'top-full translate-y-1',
        ) }
        style={ { ...markStyle, ...markCustomStyle } }
      >
        <div
          className={ cn(
            'w-1 h-1 rounded-full border',
            isActive && included
              ? finalStyleConfig.marks?.activeDotColor
              : finalStyleConfig.marks?.dotColor,
            vertical
              ? 'mr-2'
              : 'mb-2',
          ) }
        />
        { label && (
          <span
            className={ cn(
              'text-xs whitespace-nowrap',
              finalStyleConfig.marks?.labelColor,
              vertical
                ? 'ml-1'
                : 'mt-1',
            ) }
          >
            { label }
          </span>
        ) }
      </div>
    )
  })
}

/**
 * 渲染滑块手柄
 */
export function renderHandle(
  val: number,
  index: number,
  vertical: boolean,
  keyboard: boolean,
  disabled: boolean,
  isDragging: boolean,
  dragIndex: number,
  pointerFocus: boolean,
  tooltip: boolean | TooltipConfig | undefined,
  reverse: boolean,
  min: number,
  max: number,
  valueToPixel: (val: number) => number,
  finalStyleConfig: SliderStyleConfig,
  handleStart: (event: React.MouseEvent | React.TouchEvent, index: number) => void,
  handleKeyDown: (event: React.KeyboardEvent, index: number) => void,
  ariaLabel?: string,
) {
  const position = valueToPixel(val)
  const tooltipConfig = typeof tooltip === 'object'
    ? tooltip
    : undefined
  const preferredSide = tooltipConfig?.position
  const side = preferredSide && preferredSide !== 'auto'
    ? preferredSide
    : vertical
    ? (reverse
      ? 'right'
      : 'left')
    : (reverse
      ? 'bottom'
      : 'top')
  const tooltipPosition = tooltipPositions[side]

  /** 修复小球定位，确保完美居中对齐到轨道 */
  const handleStyle = vertical
    ? {
      bottom: `${position}%`,
      left: '50%',
      transform: 'translate(-50%, 50%)',
    }
    : {
      left: `${position}%`,
      top: '50%',
      transform: 'translate(-50%, -50%)',
    }

  const handleElement = (
    <div
      key={ index }
      className={ cn(
        'absolute cursor-pointer group',
        finalStyleConfig.handle?.sizeClassName,
        finalStyleConfig.handle?.color,
        finalStyleConfig.handle?.border,
        finalStyleConfig.handle?.rounded,
        /** 只在非拖拽状态下启用过渡动画 */
        !(isDragging && dragIndex === index) && 'transition-all duration-150',
        finalStyleConfig.handle?.hover,
        pointerFocus
          ? 'outline-none'
          : finalStyleConfig.handle?.focus,
        disabled && 'cursor-not-allowed opacity-50 border-border',
        isDragging && dragIndex === index && 'scale-110 shadow-lg',
      ) }
      style={ handleStyle }
      tabIndex={ keyboard && !disabled
        ? 0
        : -1 }
      role="slider"
      aria-label={ ariaLabel }
      aria-valuemin={ min }
      aria-valuemax={ max }
      aria-valuenow={ val }
      aria-disabled={ disabled }
      aria-orientation={ vertical
        ? 'vertical'
        : 'horizontal' }
      { ...{ [COMPONENT_DATA_ATTR.slider.handle]: index } }
      onMouseDown={ (event) => {
        event.currentTarget.focus()
        handleStart(event, index)
      } }
      onTouchStart={ (event) => {
        event.currentTarget.focus()
        handleStart(event, index)
      } }
      onKeyDown={ (e) => handleKeyDown(e, index) }
    >
      { /* 数值提示留在滑块内，拖拽时不需要逐帧重新定位 */ }
      { tooltip && (
        <div
          aria-hidden
          className={ cn(
            'absolute z-10 pointer-events-none transition-opacity duration-150',
            TOOLTIP_SURFACE_CLASS,
            tooltipPosition.className,
            isDragging && dragIndex === index
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100',
          ) }
          style={ tooltipPosition.style }
        >
          { tooltipConfig?.formatter
            ? tooltipConfig.formatter(val)
            : val }
          <FloatingArrow placement={ side } centerOffset={ 0 } style={ tooltipPosition.arrowStyle } />
        </div>
      ) }
    </div>
  )

  return handleElement
}
