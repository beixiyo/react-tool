import type { ReactNode } from 'react'
import { memo } from 'react'
import { cn } from 'utils'
import { CloseBtn } from '../../CloseBtn'

/** Picker 共用清除按钮：保留稳定占位，仅在字段 hover 或键盘聚焦时显示 */
export const PickerClearButton = memo<PickerClearButtonProps>((props) => {
  const {
    className,
    clearIcon,
    onClear,
  } = props

  return (
    <CloseBtn
      mode="static"
      size={ 20 }
      iconSize={ 12 }
      strokeWidth={ 2 }
      aria-label="清除"
      className={ cn(
        'pointer-events-none shrink-0 rounded-md opacity-0 transition-all',
        'group-hover/picker:pointer-events-auto group-hover/picker:opacity-100',
        'group-focus-within/picker:pointer-events-auto group-focus-within/picker:opacity-100',
        'hover:bg-background3',
        className,
      ) }
      onClick={ onClear }
    >
      { clearIcon }
    </CloseBtn>
  )
})

PickerClearButton.displayName = 'PickerClearButton'

type PickerClearButtonProps = {
  className?: string
  clearIcon?: ReactNode
  onClear: (event: React.MouseEvent<HTMLButtonElement>) => void
}
