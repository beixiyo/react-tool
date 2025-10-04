import { isPlainObject } from './schemaUtils'

export function assignNestedValue(target: Record<string, unknown>, path: string[], value: unknown) {
  if (path.length === 0)
    return

  const [current, ...rest] = path

  if (rest.length === 0) {
    target[current] = value
    return
  }

  if (!isPlainObject(target[current])) {
    target[current] = {}
  }

  assignNestedValue(target[current] as Record<string, unknown>, rest, value)
}

export function handleNestedChange({
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
