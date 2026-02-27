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
        const currentPath = [...path, opt.label as string]
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
