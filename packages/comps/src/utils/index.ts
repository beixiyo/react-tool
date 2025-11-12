export function formatDuration(value: number) {
  const safeValue = Number.isNaN(value)
    ? 0
    : Math.max(0, Math.floor(value))
  const minutes = Math.floor(safeValue / 60)
  const seconds = safeValue % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
