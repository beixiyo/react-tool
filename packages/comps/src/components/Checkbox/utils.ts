import type { Size } from '../../types'

const CHECK_VERTEX = { x: 9.83, y: 18.83 }
const CHECK_LEFT = { x: 4.72, y: 13.72 }
const CHECK_RIGHT = { x: 19.72, y: 5.15 }
const CHECK_SHORT_LENGTH = Math.hypot(CHECK_VERTEX.x - CHECK_LEFT.x, CHECK_VERTEX.y - CHECK_LEFT.y)
const CIRCLE_CENTER = { x: 12, y: 12 }
const CIRCLE_RADIUS = 10
const CIRCLE_CHECK_GAP = 0.25

/**
 * 生成打勾的描边路径：顶点、长笔和两笔长度固定，仅旋转短笔
 * 设计稿坐标约为 81° 张角、54.1° 长笔仰角；角度精度以原始坐标为准
 * @param options.checkVertexAngle - 顶点张角（度），限制在 20～150；默认 81
 * @param options.circleStrokeWidth - 显示外圈时的笔画宽度；传入后让圆头完全位于外圈描边的内缘内
 * @returns 24 × 24 viewBox 内的路径
 */
export function buildCheckPath(options: { checkVertexAngle?: number; circleStrokeWidth?: number } = {}): string {
  const requestedAngle = options.checkVertexAngle ?? 81
  const angle = Number.isFinite(requestedAngle)
    ? Math.min(150, Math.max(20, requestedAngle))
    : 81

  // 原始坐标的短笔仰角为 45°；相对于设计稿的 81° 旋转短笔
  // 等价于短笔仰角 ≈ 180° − 长笔仰角(54.1°) − 顶点张角
  const shortAngle = (45 - (angle - 81)) * Math.PI / 180

  const left = {
    x: CHECK_VERTEX.x - CHECK_SHORT_LENGTH * Math.cos(shortAngle),
    y: CHECK_VERTEX.y - CHECK_SHORT_LENGTH * Math.sin(shortAngle),
  }
  const points = [left, CHECK_VERTEX, CHECK_RIGHT]
  // 圆头会超出中心线端点半个线宽；只在显示外圈时缩进整个勾线，保持原有角度与描边宽度
  const maxRadius = Math.max(...points.map((point) => Math.hypot(point.x - CIRCLE_CENTER.x, point.y - CIRCLE_CENTER.y)))

  // 圆圈向内占半个线宽，勾线圆头还占半个线宽；两者之间额外留出一点空隙
  const scale = options.circleStrokeWidth === undefined
    ? 1
    : Math.min(1, Math.max(0, CIRCLE_RADIUS - Math.max(0, options.circleStrokeWidth) - CIRCLE_CHECK_GAP) / maxRadius)

  const [start, vertex, end] = points.map((point) => ({
    x: +(CIRCLE_CENTER.x + (point.x - CIRCLE_CENTER.x) * scale).toFixed(2),
    y: +(CIRCLE_CENTER.y + (point.y - CIRCLE_CENTER.y) * scale).toFixed(2),
  }))

  return `M${start.x} ${start.y} L${vertex.x} ${vertex.y} L${end.x} ${end.y}`
}

/**
 * 将 Size 类型转换为数字
 * @param size - 大小值，可以是数字或 Size 类型（'sm' | 'md' | 'lg' | number）
 * @returns 对应的数字大小值
 */
export function getSizeValue(size: Size): number {
  if (typeof size === 'number') {
    return size
  }
  const sizeMap: Record<'sm' | 'md' | 'lg', number> = {
    sm: 18,
    md: 22,
    lg: 28,
  }
  return sizeMap[size]
}
