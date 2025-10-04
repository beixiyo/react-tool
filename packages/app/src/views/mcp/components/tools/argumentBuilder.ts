import type { SchemaField, ToolArgumentsState } from './types'
import { assignNestedValue } from './nestedUtils'

export function buildArguments(values: ToolArgumentsState, fields: SchemaField[]) {
  const args: Record<string, unknown> = {}
  const errors: Record<string, string> = {}

  fields.forEach((field) => {
    const value = values[field.key]

    if (field.required && (value === undefined || value === '' || value === null)) {
      errors[field.key] = '该字段为必填项'
      return
    }

    if (value !== undefined && value !== '') {
      assignNestedValue(args, field.key.split('.'), value)
    }
  })

  return {
    args,
    errors,
    generalError: Object.keys(errors).length > 0
      ? '参数验证失败，请检查必填项'
      : null,
  }
}

export function resetArgumentErrors(keys: string[], errors: Record<string, string>) {
  const next = { ...errors }
  keys.forEach((key) => {
    if (next[key]) {
      delete next[key]
    }
  })
  return next
}
