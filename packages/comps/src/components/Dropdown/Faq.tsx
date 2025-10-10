import type { DropdownProps } from '.'
import { IS_MOBILE_DEVICE } from 'config'
import { memo } from 'react'
import { cn } from 'utils'
import { Dropdown } from '..'

export const Faq = memo<FaqProps>((
  {
    style,
    className,
    items,
  },
) => {
  return <div
    className={ cn(
      'FaqContainer',
      IS_MOBILE_DEVICE
        ? 'py-8'
        : 'py-16',
      className,
    ) }
    style={ style }
  >
    <h3 className={ cn(
      'text-center text-gray-800 dark:text-white font-medium',
      IS_MOBILE_DEVICE
        ? 'text-2xl mb-8 mt-8'
        : 'text-4xl mb-16 mt-16 md:text-5xl',
    ) }>
      FAQ
    </h3>

    <div className={ cn(
      'mx-auto max-w-7xl',
      IS_MOBILE_DEVICE
        ? 'px-4 py-4'
        : 'py-8',
    ) }>
      <Dropdown
        items={ items }
        className="space-y-4"
        sectionHeaderClassName={ cn(
          'dark:text-white text-gray-800',
          IS_MOBILE_DEVICE
            ? 'text-base'
            : 'text-lg',
        ) }
        itemTitleClassName="text-gray-600 dark:text-gray-400"
        itemDescClassName="text-gray-500 dark:text-gray-400"
        itemInactiveClassName="hover:bg-gray-100 dark:hover:bg-gray-900/90"
        itemClassName={ cn(
          'border-gray-200 dark:border-zinc-600/50 space-y-3 transition-colors duration-300 hover:border-gray-300 dark:hover:border-zinc-500/50 rounded-xl',
          IS_MOBILE_DEVICE
            ? 'py-2 px-3 text-sm'
            : 'py-3',
        ) }
      ></Dropdown>
    </div>
  </div>
})

Faq.displayName = 'Faq'

export type FaqProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  items: DropdownProps['items']
}
