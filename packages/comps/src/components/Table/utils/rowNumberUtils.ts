/**
 * 计算行号
 * @param index 行索引（从 0 开始）
 * @param pagination 分页状态（可选）
 * @returns 行号（从 1 开始）
 */
export function calculateRowNumber(
  index: number,
  pagination?: { pageIndex: number, pageSize: number },
): number {
  if (pagination) {
    return pagination.pageIndex * pagination.pageSize + index + 1
  }
  return index + 1
}
