export function getStrokeColor(params: {
  disabled?: boolean
  dragActive?: boolean
  dragInvalid?: boolean
  isHover?: boolean
}) {
  const { disabled, dragActive, dragInvalid, isHover } = params

  if (disabled) {
    return 'rgb(var(--textDisabled) / 1)'
  }

  if (dragActive) {
    return dragInvalid
      ? 'rgb(var(--danger) / 1)'
      : 'rgb(var(--success) / 1)'
  }

  if (isHover) {
    return 'rgb(var(--success) / 1)'
  }

  return 'rgb(var(--border) / 1)'
}
