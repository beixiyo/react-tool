import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'
import { DATA_CASCADER_SELECTED } from '../constants'

/** 自动滚动到选中项 */
export function useCascaderScroll(
  isOpen: boolean,
  dropdownRef: RefObject<HTMLDivElement | null>,
  menuStack: any[],
) {
  const prevStackRef = useRef<any[]>([])

  useEffect(() => {
    if (!isOpen) {
      prevStackRef.current = []
      return
    }

    if (dropdownRef.current) {
      const scrollContainers = dropdownRef.current.querySelectorAll('.overflow-auto')
      scrollContainers.forEach((container, index) => {
        const currentOptions = menuStack[index]
        const prevOptions = prevStackRef.current[index]

        // 仅当该层级的选项发生变化（说明是新展开或切换了父级）时，才执行滚动
        if (currentOptions && currentOptions !== prevOptions) {
          const selectedOption = container.querySelector(`[${DATA_CASCADER_SELECTED}="true"]`)
          if (selectedOption) {
            selectedOption.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
          }
        }
      })
      prevStackRef.current = [...menuStack]
    }
  }, [isOpen, menuStack, dropdownRef])
}
