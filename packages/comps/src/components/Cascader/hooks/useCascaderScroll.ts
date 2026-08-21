import { useScrollIntoView } from 'hooks'
import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'
import { DATA_CASCADER_MENU, DATA_CASCADER_SELECTED } from '../constants'

/** 自动滚动到选中项 */
export function useCascaderScroll(
  isOpen: boolean,
  dropdownRef: RefObject<HTMLDivElement | null>,
  menuStack: any[],
  enableScrollAnimation: boolean,
) {
  const prevStackRef = useRef<any[]>([])
  const { scrollIntoView } = useScrollIntoView({
    block: 'nearest',
    behavior: enableScrollAnimation
      ? 'smooth'
      : 'instant',
  })

  useEffect(() => {
    if (!isOpen) {
      prevStackRef.current = []
      return
    }

    if (dropdownRef.current) {
      const selectedOptions: Element[] = []
      const scrollContainers = dropdownRef.current.querySelectorAll(`[${DATA_CASCADER_MENU}="true"]`)
      scrollContainers.forEach((container, index) => {
        const currentOptions = menuStack[index]
        const prevOptions = prevStackRef.current[index]

        /** 仅当该层级的选项发生变化（说明是新展开或切换了父级）时，才执行滚动 */
        if (currentOptions && currentOptions !== prevOptions) {
          const selectedOption = container.querySelector(`[${DATA_CASCADER_SELECTED}="true"]`)
          if (selectedOption) selectedOptions.push(selectedOption)
        }
      })
      scrollIntoView(selectedOptions)
      prevStackRef.current = [...menuStack]
    }
  }, [isOpen, menuStack, dropdownRef, scrollIntoView])
}
