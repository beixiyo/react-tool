'use client'

import { Search } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'

export interface CascaderSearchProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  dropdownHeight: number
  filteredOptions: { label: string, value: string, path: string[] }[]
  internalValue?: string
  handleOptionClick: (value: string) => void
}

function InnerCascaderSearch(props: CascaderSearchProps) {
  const {
    searchQuery,
    setSearchQuery,
    dropdownHeight,
    filteredOptions,
    internalValue,
    handleOptionClick,
  } = props

  return (
    <div className={ cn(
      'flex flex-col border-r border-border min-w-[200px]',
      searchQuery ? 'w-full' : 'w-[200px]',
    ) }
    >
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 transform text-text2 -translate-y-1/2" />
          <input
            type="text"
            className="w-full border border-border rounded-md py-1 pl-9 pr-3 bg-background text-text placeholder:text-text2 focus:border-info focus:outline-hidden focus:ring-1 focus:ring-info/20 transition-all duration-200 text-sm"
            placeholder="Search..."
            value={ searchQuery }
            onChange={ e => setSearchQuery(e.target.value) }
            onClick={ e => e.stopPropagation() }
            onKeyDown={ e => e.stopPropagation() }
          />
        </div>
      </div>
      <div
        className="overflow-auto py-1"
        style={ { maxHeight: dropdownHeight } }
      >
        { filteredOptions.length > 0
          ? (
              filteredOptions.map(opt => (
                <div
                  key={ opt.value }
                  className={ cn(
                    'px-3 py-1.5 text-sm cursor-pointer hover:bg-background2 transition-colors',
                    internalValue === opt.value && 'text-info font-medium bg-info/5',
                  ) }
                  onClick={ () => handleOptionClick(opt.value) }
                >
                  { opt.label }
                </div>
              ))
            )
          : searchQuery && (
            <div className="px-3 py-4 text-center text-xs text-text2">
              No results found
            </div>
          ) }
      </div>
    </div>
  )
}

InnerCascaderSearch.displayName = 'CascaderSearch'

export const CascaderSearch = memo(InnerCascaderSearch)
