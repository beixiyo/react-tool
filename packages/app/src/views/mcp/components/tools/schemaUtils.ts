import type { JSONSchema, SchemaField, ToolArgumentsState } from './types'

export const OBJECT_TYPE = 'object'
export const ARRAY_TYPE = 'array'
export const STRING_TYPE = 'string'
export const NUMBER_TYPE = 'number'
export const INTEGER_TYPE = 'integer'
export const BOOLEAN_TYPE = 'boolean'

export function resolveSchemaType(schema: JSONSchema | undefined): string {
  if (!schema)
    return STRING_TYPE
  if (Array.isArray(schema.type)) {
    return schema.type[0] || STRING_TYPE
  }
  return schema.type || STRING_TYPE
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export function extractSchemaFields(schema: JSONSchema | undefined, parentKey?: string): SchemaField[] {
  if (!schema || resolveSchemaType(schema) !== OBJECT_TYPE)
    return []
  const properties = schema.properties || {}
  const requiredFields = schema.required || []

  return Object.entries(properties).reduce<SchemaField[]>((acc, [key, value]) => {
    const currentKey = parentKey
      ? `${parentKey}.${key}`
      : key
    const currentField: SchemaField = {
      key: currentKey,
      schema: value,
      required: requiredFields.includes(key),
    }

    const nestedFields = resolveSchemaType(value) === OBJECT_TYPE
      ? extractSchemaFields(value, currentKey)
      : []

    return [...acc, currentField, ...nestedFields]
  }, [])
}

export function deriveDefaultValue(schema: JSONSchema | undefined): unknown {
  if (!schema)
    return undefined
  if (schema.default !== undefined)
    return schema.default

  const type = resolveSchemaType(schema)

  switch (type) {
    case STRING_TYPE:
      return ''
    case NUMBER_TYPE:
    case INTEGER_TYPE:
      return 0
    case BOOLEAN_TYPE:
      return false
    case ARRAY_TYPE:
      return []
    case OBJECT_TYPE: {
      const initial: Record<string, unknown> = {}
      const properties = schema.properties || {}
      Object.entries(properties).forEach(([key, value]) => {
        const defaultValue = deriveDefaultValue(value)
        if (defaultValue !== undefined) {
          initial[key] = defaultValue
        }
      })
      return initial
    }
    default:
      return undefined
  }
}

export function getInitialArguments(fields: SchemaField[]): ToolArgumentsState {
  return fields.reduce<ToolArgumentsState>((acc, field) => {
    const defaultValue = deriveDefaultValue(field.schema)
    if (defaultValue !== undefined) {
      acc[field.key] = defaultValue
    }
    return acc
  }, {})
}

export function getDefaultValue(schema: JSONSchema | JSONSchema[] | undefined): unknown {
  if (!schema)
    return ''
  if (Array.isArray(schema)) {
    return getDefaultValue(schema[0])
  }
  return deriveDefaultValue(schema)
}
