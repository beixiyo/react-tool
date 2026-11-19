'use client'

import { useControllableState, useLatestCallback } from 'hooks'
import React, { memo, useId } from 'react'
import { cn } from 'utils'
import { DATA_ATTR } from '../../constants/dataAttributes'
import { useFormField } from '../Form'
import { switchSizeConfig, switchVariants, thumbVariants, trackVariants } from './styles'
import type { SwitchProps } from './types'

export const Switch = memo<SwitchProps>((props) => {
  const {
    checked,
    onChange,
    disabled = false,
    size = 'md',
    background = 'rgb(var(--brand) / 1)',
    checkedIcon,
    uncheckedIcon,
    name,
    containerClassName,
    error = false,
    errorMessage,
    icon,
    withGradient = false,
    label,
    labelClassName,
    defaultChecked = false,
    trackWidth,
    trackHeight,
    trackClassName,
    thumbWidth,
    thumbHeight,
    thumbInset,
    thumbClassName,
    ariaLabel,
    id,
    ...rest
  } = props

  const [checkedState, setCheckedState] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
  })

  /** 稳定 id，用于 label 关联与 errorMessage 的 aria-describedby */
  const generatedId = useId()
  const inputId = name ?? id ?? generatedId
  const errorId = `${inputId}-error`

  const {
    isInForm,
    actualValue: formChecked,
    actualError,
    actualErrorMessage,
    handleChangeVal,
    handleBlur,
  } = useFormField<boolean, React.ChangeEvent<HTMLInputElement>>({
    name,
    value: checked,
    error,
    errorMessage,
    onChange,
  })

  /** 表单内跟随表单字段值（未初始化时回落到组件自身状态），否则使用受控 / 非受控状态 */
  const realChecked = isInForm
    ? (formChecked ?? checkedState)
    : checkedState

  const resolvedSize = size ?? 'md'
  const sizePreset = switchSizeConfig[resolvedSize]

  const actualTrackWidth = trackWidth ?? sizePreset.trackWidth
  const actualTrackHeight = trackHeight ?? sizePreset.trackHeight
  const actualThumbWidth = thumbWidth ?? sizePreset.thumbWidth
  const actualThumbHeight = thumbHeight ?? sizePreset.thumbHeight

  const actualThumbInset = thumbInset ?? sizePreset.thumbInset
  const checkedThumbOffset = Math.max(
    actualTrackWidth - actualThumbWidth - actualThumbInset * 2,
    0,
  )
  const hasCustomSize = trackWidth !== undefined
    || trackHeight !== undefined
    || thumbWidth !== undefined
    || thumbHeight !== undefined
    || thumbInset !== undefined

  const trackStyle = {
    ...(realChecked && !withGradient
      ? { background }
      : undefined),
    ...(hasCustomSize
      ? {
        width: actualTrackWidth,
        height: actualTrackHeight,
      }
      : undefined),
  } satisfies React.CSSProperties

  const thumbStyle = {
    transform: realChecked
      ? `translateX(${checkedThumbOffset}px)`
      : 'translateX(0)',
    ...(hasCustomSize
      ? {
        top: actualThumbInset,
        left: actualThumbInset,
        width: actualThumbWidth,
        height: actualThumbHeight,
      }
      : undefined),
  } satisfies React.CSSProperties

  const handleChange = useLatestCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return

    const newChecked = event.target.checked
    setCheckedState(newChecked)
    if (isInForm) {
      handleChangeVal(newChecked, event)
    }
    else {
      onChange?.(newChecked, event)
    }
    handleBlur()
  })

  const stateDataProps = {
    [DATA_ATTR.state]: realChecked
      ? 'checked'
      : 'unchecked',
    [DATA_ATTR.disabled]: disabled,
    [DATA_ATTR.invalid]: Boolean(actualError),
  }

  return (
    <div
      className={ cn('flex flex-col', containerClassName) }
      { ...stateDataProps }
    >
      <div className="flex items-center">
        <label
          className={ cn(switchVariants({
            variant: disabled
              ? 'disabled'
              : 'default',
          })) }
        >
          <input
            { ...rest }
            id={ inputId }
            type="checkbox"
            role="switch"
            className="sr-only"
            checked={ realChecked }
            onChange={ handleChange }
            disabled={ disabled }
            name={ name }
            aria-label={ ariaLabel ?? rest['aria-label'] ?? (typeof label === 'string'
              ? label
              : undefined) }
            aria-checked={ realChecked }
            aria-invalid={ actualError || undefined }
            aria-describedby={ actualError && actualErrorMessage
              ? errorId
              : undefined }
            { ...stateDataProps }
          />
          <div
            { ...stateDataProps }
            className={ cn(
              trackVariants({
                size: resolvedSize,
                checked: realChecked,
                withGradient,
              }),
              trackClassName,
            ) }
            style={ Object.keys(trackStyle).length
              ? trackStyle
              : undefined }
          >
            <div
              className={ cn(
                thumbVariants({ size: resolvedSize, checked: realChecked }),
                thumbClassName,
              ) }
              style={ thumbStyle }
            >
              { icon && icon }
              { !icon && realChecked && checkedIcon }
              { !icon && !realChecked && uncheckedIcon }
            </div>
          </div>
        </label>
        { label && (
          <label
            htmlFor={ inputId }
            className={ cn(
              'ml-2 text-sm text-text2',
              disabled
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer',
              labelClassName,
            ) }
          >
            { label }
          </label>
        ) }
      </div>
      { actualError && actualErrorMessage && (
        <div id={ errorId } className="mt-1 text-sm text-systemRed">
          { actualErrorMessage }
        </div>
      ) }
    </div>
  )
})

Switch.displayName = 'Switch'
