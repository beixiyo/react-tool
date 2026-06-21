import type { CascaderOption } from '../types'
import { useMemo, useState } from 'react'

export interface UseCascaderSearchProps {
  options: CascaderOption[]
  searchable: boolean
}

export interface FlatOption {
  label: string
  value: string
  path: string[]
  raw: CascaderOption
}

export function useCascaderSearch({ options, searchable }: UseCascaderSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const flatOptions = useMemo(() => {
    if (!searchable)
      return []

    const result: FlatOption[] = []
    const traverse = (opts: CascaderOption[], path: string[]) => {
      opts.forEach((opt) => {
        const currentPath = [...path, getOptionSearchText(opt)]
        if (!opt.children || opt.children.length === 0) {
          result.push({
            label: currentPath.join(' / '),
            value: opt.value,
            path: currentPath,
            raw: opt,
          })
        }
        else {
          traverse(opt.children, currentPath)
        }
      })
    }
    traverse(options, [])
    return result
  }, [options, searchable])

  const filteredOptions = useMemo(() => {
    if (!searchQuery)
      return flatOptions
    const lowerQuery = searchQuery.toLowerCase()
    return flatOptions.filter(opt =>
      opt.label.toLowerCase().includes(lowerQuery),
    )
  }, [flatOptions, searchQuery])

  return {
    searchQuery,
    setSearchQuery,
    filteredOptions,
  }
}

/**
 * 提取选项用于搜索/路径展示的纯文本。
 * 优先 `searchLabel`，其次字符串/数字类型的 `label`，否则回退到 `value`，
 * 避免对 ReactNode 类型的 label 直接 toString 得到 '[object Object]' 或抛错
 */
function getOptionSearchText(opt: CascaderOption): string {
  if (typeof opt.searchLabel === 'string')
    return opt.searchLabel
  if (typeof opt.label === 'string')
    return opt.label
  if (typeof opt.label === 'number')
    return String(opt.label)
  return opt.value
}
