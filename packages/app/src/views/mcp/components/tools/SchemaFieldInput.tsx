import type { SchemaField } from './types'
import { Input, Textarea } from 'comps'
import { FieldWrapper } from './FieldWrapper'
import { getDefaultValue, isPlainObject, resolveSchemaType } from './schemaUtils'

interface SchemaFieldInputProps {
  field: SchemaField
  value: unknown
  errors: Record<string, string>
  onChange: (value: unknown) => void
}

interface ArrayFieldInputProps {
  field: SchemaField
  value: unknown
  errors: Record<string, string>
  onChange: (value: unknown) => void
}

export function SchemaFieldInput({ field, value, errors, onChange }: SchemaFieldInputProps) {
  const label = field.schema.title || field.key
  const description = field.schema.description
  const isRequired = field.required
  const inputType = resolveSchemaType(field.schema)
  const fieldError = errors[field.key]

  if (inputType === 'object') {
    const childProperties = field.schema.properties || {}
    const requiredChildren = field.schema.required || []
    const objectValue = isPlainObject(value)
      ? value as Record<string, unknown>
      : {}

    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-backgroundSecondary p-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-textPrimary">
            {label}
            {isRequired && <span className="ml-1 text-danger">*</span>}
          </span>
          {description && (
            <span className="text-xs text-textSecondary">
              {description}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(childProperties).map(([childKey, childSchema]) => {
            const childField: SchemaField = {
              key: `${field.key}.${childKey}`,
              schema: childSchema,
              required: requiredChildren.includes(childKey),
            }
            return (
              <SchemaFieldInput
                key={ childField.key }
                field={ childField }
                value={ objectValue[childKey] }
                errors={ errors }
                onChange={ newValue => handleNestedChange({
                  parentValue: objectValue,
                  childKey,
                  parentOnChange: onChange,
                  newValue,
                }) }
              />
            )
          })}
        </div>
        {fieldError && (
          <span className="text-xs text-danger">{fieldError}</span>
        )}
      </div>
    )
  }

  if (inputType === 'array') {
    return (
      <ArrayFieldInput
        field={ field }
        value={ value }
        errors={ errors }
        onChange={ onChange }
      />
    )
  }

  if (field.schema.enum && field.schema.enum.length > 0) {
    return (
      <FieldWrapper
        label={ label }
        description={ description }
        required={ isRequired }
        error={ fieldError }
      >
        <select
          value={ String(value ?? '') }
          onChange={ event => onChange(event.target.value) }
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-textPrimary placeholder-textDisabled transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="" disabled>
            请选择
            {' '}
            {label}
          </option>
          {field.schema.enum.map(option => (
            <option key={ String(option) } value={ String(option) }>
              {String(option)}
            </option>
          ))}
        </select>
      </FieldWrapper>
    )
  }

  switch (inputType) {
    case 'integer':
    case 'number':
      return (
        <FieldWrapper
          label={ label }
          description={ description }
          required={ isRequired }
          error={ fieldError }
        >
          <Input
            type="number"
            value={ value === undefined || value === null
              ? ''
              : String(value) }
            onChange={ val => onChange(parseNumber(val)) }
            containerClassName="w-full"
            className="w-full"
          />
        </FieldWrapper>
      )

    case 'boolean':
      return (
        <FieldWrapper
          label={ label }
          description={ description }
          required={ isRequired }
          error={ fieldError }
        >
          <select
            value={ String(Boolean(value)) }
            onChange={ event => onChange(event.target.value === 'true') }
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-textPrimary placeholder-textDisabled transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="true">是</option>
            <option value="false">否</option>
          </select>
        </FieldWrapper>
      )

    case 'string':
      return (
        <FieldWrapper
          label={ label }
          description={ description }
          required={ isRequired }
          error={ fieldError }
        >
          <Textarea
            value={ value === undefined || value === null
              ? ''
              : String(value) }
            onChange={ val => onChange(val) }
            rows={ 4 }
            className="min-h-[96px]"
          />
        </FieldWrapper>
      )

    default:
      return (
        <FieldWrapper
          label={ label }
          description={ description }
          required={ isRequired }
          error={ fieldError }
        >
          <Input
            value={ value === undefined || value === null
              ? ''
              : String(value) }
            onChange={ val => onChange(val) }
            containerClassName="w-full"
            className="w-full"
          />
        </FieldWrapper>
      )
  }
}

function ArrayFieldInput({ field, value, errors, onChange }: ArrayFieldInputProps) {
  const arrayValue = Array.isArray(value)
    ? value
    : []

  const handleItemChange = (index: number, newValue: unknown) => {
    const next = [...arrayValue]
    next[index] = newValue
    onChange(next)
  }

  const handleAddItem = () => {
    const next = [...arrayValue, getDefaultValue(field.schema.items)]
    onChange(next)
  }

  const handleRemoveItem = (index: number) => {
    const next = arrayValue.filter((_, idx) => idx !== index)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      {arrayValue.map((item, index) => (
        <div
          key={ `${field.key}-${index}` }
          className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3"
        >
          <SchemaFieldInput
            field={ {
              key: `${field.key}[${index}]`,
              schema: Array.isArray(field.schema.items)
                ? field.schema.items[index] || {}
                : field.schema.items || {},
              required: false,
            } }
            value={ item }
            errors={ errors }
            onChange={ newValue => handleItemChange(index, newValue) }
          />
          <button
            onClick={ () => handleRemoveItem(index) }
            className="self-start rounded border border-border px-2 py-1 text-xs text-textSecondary transition-colors hover:border-danger hover:text-danger"
          >
            移除
          </button>
        </div>
      ))}

      <button
        onClick={ handleAddItem }
        className="self-start rounded border border-dashed border-border px-3 py-1 text-xs text-textSecondary transition-colors hover:border-blue-500 hover:text-blue-600"
      >
        添加项
      </button>
    </div>
  )
}

function parseNumber(val: string): number | string {
  if (val === '')
    return ''
  const next = Number(val)
  return Number.isNaN(next)
    ? ''
    : next
}

function handleNestedChange({
  parentValue,
  childKey,
  parentOnChange,
  newValue,
}: {
  parentValue: Record<string, unknown>
  childKey: string
  parentOnChange: (value: unknown) => void
  newValue: unknown
}) {
  parentOnChange({
    ...parentValue,
    [childKey]: newValue,
  })
}
