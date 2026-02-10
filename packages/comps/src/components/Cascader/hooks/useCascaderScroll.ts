import type { RefObject } from 'react'
import { useEffect } from 'react'
import { DATA_CASCADER_SELECTED } from '../constants'

/** 自动滚动到选中项 */
export function useCascaderScroll(
  isOpen: boolean,
  dropdownRef: RefObject<HTMLDivElement | null>,
  menuStack: any[],
) {
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const scrollContainers = dropdownRef.current.querySelectorAll('.overflow-auto')
      scrollContainers.forEach((container) => {
        const selectedOption = container.querySelector(`[${DATA_CASCADER_SELECTED}="true"]`)
        if (selectedOption) {
          selectedOption.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
      })
    }
  }, [isOpen, menuStack, dropdownRef])
}
