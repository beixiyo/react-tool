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
      'text-center text-textPrimary font-bold tracking-tight',
      IS_MOBILE_DEVICE
        ? 'text-3xl mb-8 mt-8'
        : 'text-5xl mb-16 mt-16 md:text-6xl',
    ) }>
      FAQ
    </h3>

    <div className={ cn(
      'mx-auto max-w-3xl',
      IS_MOBILE_DEVICE
        ? 'px-4 py-4'
        : 'py-8',
    ) }>
      <Dropdown
        items={ items }
        className="space-y-6"
        sectionHeaderClassName={ cn(
          'text-textPrimary font-semibold hover:text-brand transition-colors',
          IS_MOBILE_DEVICE
            ? 'text-lg'
            : 'text-xl',
        ) }
        itemTitleClassName="text-textSecondary"
        itemDescClassName="text-textTertiary"
        itemInactiveClassName="hover:bg-backgroundSecondary/50"
        itemClassName={ cn(
          'border-border/50 space-y-4 transition-all duration-300 hover:border-border rounded-2xl bg-backgroundSecondary/20',
          IS_MOBILE_DEVICE
            ? 'py-4 px-5 text-sm'
            : 'py-6 px-8',
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
