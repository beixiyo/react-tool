import type { DropdownItem } from 'comps'
import { formatDate } from '@jl-org/tool'

export function groupChatsByDate(histories: DropdownItem[]): Record<string, DropdownItem[]> {
  const groups: Record<string, DropdownItem[]> = {
    'Today': [],
    'Yesterday': [],
    'Last 7 Days': [],
    'Last 30 Days': [],
    'Older': [],
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
      groups.Today.push(history)
    }
    else if (formatDate('yyyy-MM-dd', new Date(date)) === formatDate('yyyy-MM-dd', new Date(yesterday))) {
      groups.Yesterday.push(history)
    }
    else if (date >= lastWeek) {
      groups['Last 7 Days'].push(history)
    }
    else if (date >= lastMonth) {
      groups['Last 30 Days'].push(history)
    }
    else {
      groups.Older.push(history)
    }
  })

  return groups
}

/** 格式化文件大小 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024)
    return `${bytes} B`
  else if (bytes < 1048576)
    return `${(bytes / 1024).toFixed(1)} KB`
  else if (bytes < 1073741824)
    return `${(bytes / 1048576).toFixed(1)} MB`
  else return `${(bytes / 1073741824).toFixed(1)} GB`
}
