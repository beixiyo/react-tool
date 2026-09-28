'use client'

import React, { Children, cloneElement, isValidElement, memo, useCallback } from 'react'
import { cn } from 'utils'
import { useFormField } from '../../Form'
import type { RadioGroupProps, RadioProps } from '../types'

export const RadioGroup = memo<RadioGroupProps>(({
  children,
  className,
  style,
  value,
  name,
  onChange,
  direction = 'vertical',
  ...rest
}) => {
  /** 使用 useFormField hook 处理表单集成 */
  const {
    actualValue,
    handleChangeVal,
    handleBlur,
  } = useFormField<string, React.ChangeEvent<HTMLInputElement>>({
    name,
    value,
    onChange,
  })

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleChangeVal(e.target.value, e)
    handleBlur()
  }, [handleChangeVal, handleBlur])

  const directionClasses = {
    vertical: 'flex-col space-y-4',
    horizontal: 'flex-row space-x-6',
  }

  return (
    <div
      role="radiogroup"
      className={ cn('flex', directionClasses[direction], className) }
      style={ style }
      { ...rest }
    >
      { Children.map(children, (child) => {
        if (!isValidElement(child)) return child

        const radioProps = child.props as RadioProps
        const childOnChange = radioProps.onChange

        return cloneElement(child as React.ReactElement<RadioProps>, {
          name,
          checked: radioProps.value === actualValue,
          /** 当子组件未提供 onChange 时，使用父组件的 onChange */
          onChange: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => {
            handleChange(e)
            childOnChange?.(checked, e)
          },
        })
      }) }
    </div>
  )
})

RadioGroup.displayName = 'RadioGroup'
