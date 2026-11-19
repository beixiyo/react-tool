import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Form } from '../Form'
import { useFormField } from '../hooks/useFormField'
import type { FieldValidator } from '../types'

const event = {} as React.ChangeEvent<HTMLElement>

function createFormWrapper(options: {
  initialValues?: Record<string, any>
  validators?: Record<string, FieldValidator>
} = {}) {
  return ({ children }: { children: ReactNode }) => (
    <Form initialValues={ options.initialValues } validators={ options.validators }>
      { children }
    </Form>
  )
}

describe('useFormField 独立使用', () => {
  it('非受控：使用 defaultValue 初始化，变更时更新内部值并回调 onChange', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useFormField<string>({ defaultValue: 'a', onChange }))

    expect(result.current.isInForm).toBe(false)
    expect(result.current.isControlMode).toBe(false)
    expect(result.current.actualValue).toBe('a')

    act(() => result.current.handleChangeVal('b', event))
    expect(result.current.actualValue).toBe('b')
    expect(onChange).toHaveBeenCalledWith('b', event)
  })

  it('受控：只回调 onChange，显示值始终来自 value', () => {
    const onChange = vi.fn()
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useFormField<string>({ value, onChange }),
      { initialProps: { value: 'a' } },
    )

    act(() => result.current.handleChangeVal('b', event))
    expect(onChange).toHaveBeenCalledWith('b', event)
    expect(result.current.actualValue).toBe('a')

    rerender({ value: 'c' })
    expect(result.current.actualValue).toBe('c')
  })

  it('有 name 但没有 Form 时按独立字段处理，错误状态取自 props，blur 不报错', () => {
    const { result } = renderHook(() => useFormField<string>({ name: 'email', error: true, errorMessage: 'Invalid' }))

    expect(result.current.isInForm).toBe(false)
    expect(result.current.actualError).toBe(true)
    expect(result.current.actualErrorMessage).toBe('Invalid')
    expect(() => act(() => result.current.handleBlur())).not.toThrow()
  })
})

describe('useFormField 表单内', () => {
  it('读写表单值，并同时回调外部 onChange', () => {
    const onChange = vi.fn()
    const { result } = renderHook(
      () => useFormField<string>({ name: 'email', onChange }),
      { wrapper: createFormWrapper({ initialValues: { email: 'a@x.com' } }) },
    )

    expect(result.current.isInForm).toBe(true)
    expect(result.current.actualValue).toBe('a@x.com')

    act(() => result.current.handleChangeVal('b@x.com', event))
    expect(result.current.actualValue).toBe('b@x.com')
    expect(result.current.formContext?.getValues()).toEqual({ email: 'b@x.com' })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('表单内忽略组件自身的 error / errorMessage', () => {
    const { result } = renderHook(
      () => useFormField<string>({ name: 'email', error: true, errorMessage: 'Own error' }),
      { wrapper: createFormWrapper() },
    )

    expect(result.current.actualError).toBeFalsy()
    expect(result.current.actualErrorMessage).toBeUndefined()
  })

  it('变更时立即校验，但错误要等 touched 后才暴露', () => {
    const validator = vi.fn((value: string) =>
      value.includes('@')
        ? undefined
        : 'Invalid email'
    )
    const { result } = renderHook(
      () => useFormField<string>({ name: 'email' }),
      { wrapper: createFormWrapper({ initialValues: { email: '' }, validators: { email: validator } }) },
    )

    act(() => result.current.handleChangeVal('abc', event))
    expect(validator).toHaveBeenLastCalledWith('abc')
    expect(result.current.formContext?.getErrors()).toEqual({ email: 'Invalid email' })
    expect(result.current.actualError).toBeFalsy()
    expect(result.current.actualErrorMessage).toBeUndefined()

    act(() => result.current.handleBlur())
    expect(result.current.formContext?.state.touched.email).toBe(true)
    expect(result.current.actualError).toBe(true)
    expect(result.current.actualErrorMessage).toBe('Invalid email')

    act(() => result.current.handleChangeVal('a@x.com', event))
    expect(result.current.actualError).toBeFalsy()
    expect(result.current.actualErrorMessage).toBeUndefined()
  })

  it('blur 时用当前表单值校验并标记 touched', () => {
    const validator = vi.fn(() => 'Required')
    const { result } = renderHook(
      () => useFormField<string>({ name: 'email' }),
      { wrapper: createFormWrapper({ validators: { email: validator } }) },
    )

    expect(validator).not.toHaveBeenCalled()
    act(() => result.current.handleBlur())
    expect(validator).toHaveBeenCalledTimes(1)
    expect(result.current.actualError).toBe(true)
    expect(result.current.actualErrorMessage).toBe('Required')
  })
})
