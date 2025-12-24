import type { DropdownItem } from 'comps'
import { formatDate } from '@jl-org/tool'

/**
 * 日期分组键名常量
 * 这些键名需要在 i18n 资源中定义翻译
 */
export const DATE_GROUP_KEYS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last7Days',
  LAST_30_DAYS: 'last30Days',
  OLDER: 'older',
} as const

export function groupChatsByDate(histories: DropdownItem[]): Record<string, DropdownItem[]> {
  const groups: Record<string, DropdownItem[]> = {
    [DATE_GROUP_KEYS.TODAY]: [],
    [DATE_GROUP_KEYS.YESTERDAY]: [],
    [DATE_GROUP_KEYS.LAST_7_DAYS]: [],
    [DATE_GROUP_KEYS.LAST_30_DAYS]: [],
    [DATE_GROUP_KEYS.OLDER]: [],
  }

  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(now)
  lastWeek.setDate(lastWeek.getDate() - 7)
  const lastMonth = new Date(now)
  lastMonth.setDate(lastMonth.getDate() - 30)

  histories.forEach((history) => {
    const date = history.timestamp
    if (!date)
      return

    if (formatDate('yyyy-MM-dd', new Date(date)) === formatDate('yyyy-MM-dd', new Date(now))) {
      groups[DATE_GROUP_KEYS.TODAY].push(history)
    }
    else if (formatDate('yyyy-MM-dd', new Date(date)) === formatDate('yyyy-MM-dd', new Date(yesterday))) {
      groups[DATE_GROUP_KEYS.YESTERDAY].push(history)
    }
    else if (date >= lastWeek) {
      groups[DATE_GROUP_KEYS.LAST_7_DAYS].push(history)
    }
    else if (date >= lastMonth) {
      groups[DATE_GROUP_KEYS.LAST_30_DAYS].push(history)
    }
    else {
      groups[DATE_GROUP_KEYS.OLDER].push(history)
    }
  })

  return groups
}

/** 格式化文件大小 */
export function formatFileSize(bytes?: number): string {
  if (!bytes)
    return ''
  if (bytes < 1024)
    return `${bytes} B`
  else if (bytes < 1048576)
    return `${(bytes / 1024).toFixed(1)} KB`
  else if (bytes < 1073741824)
    return `${(bytes / 1048576).toFixed(1)} MB`
  else return `${(bytes / 1073741824).toFixed(1)} GB`
}
