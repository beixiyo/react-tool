export type JSONSchema = {
  type?: string | string[]
  title?: string
  description?: string
  default?: unknown
  enum?: unknown[]
  properties?: Record<string, JSONSchema>
  required?: string[]
  items?: JSONSchema | JSONSchema[]
  examples?: unknown[]
}

export type ToolArgumentsState = Record<string, unknown>

export type SchemaField = {
  key: string
  schema: JSONSchema
  required: boolean
}
