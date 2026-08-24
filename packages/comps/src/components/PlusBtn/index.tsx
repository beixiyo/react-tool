import { IconButton } from '../icons/IconButton'
import { Plus } from '../icons/Plus'

/**
 * 通用加号按钮组件
 */
export function PlusBtn(props: PlusBtnProps) {
  return <IconButton { ...props } icon={ Plus } aria-label={ props['aria-label'] ?? '添加' } />
}

export type PlusBtnProps = Omit<React.ComponentProps<typeof IconButton>, 'icon'>
