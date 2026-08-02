import { useLatestRef } from 'hooks'
import { useEffect, useRef } from 'react'

/**
 * 在一次真实的打开事务结束后，按打开快照判断是否需要确认
 */
export function usePickerConfirmOnClose<T>({
  isOpen,
  value,
  onConfirm,
  isEqual,
}: UsePickerConfirmOnCloseOptions<T>): void {
  const initialValueRef = useRef(value)
  const wasOpenRef = useRef(false)
  const valueRef = useLatestRef(value)
  const onConfirmRef = useLatestRef(onConfirm)
  const isEqualRef = useLatestRef(isEqual)

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      initialValueRef.current = valueRef.current
    }
    else if (!isOpen && wasOpenRef.current) {
      const latestValue = valueRef.current
      if (onConfirmRef.current && !isEqualRef.current(initialValueRef.current, latestValue))
        onConfirmRef.current(latestValue)
    }

    wasOpenRef.current = isOpen
  }, [isOpen])
}

type UsePickerConfirmOnCloseOptions<T> = {
  isOpen: boolean
  value: T
  onConfirm?: (value: T) => void
  isEqual: (left: T, right: T) => boolean
}
