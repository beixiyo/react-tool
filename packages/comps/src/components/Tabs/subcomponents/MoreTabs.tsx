import { useLatestCallback, useTypeahead } from 'hooks'
import { MoreHorizontal } from 'lucide-react'
import { motion } from 'motion/react'
import { memo, useRef, useState } from 'react'
import { cn, getBoundaryEnabledIndex, getNextEnabledIndex } from 'utils'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { useAriaT } from '../../../i18n'
import type { PopoverRef } from '../../Popover'
import { Popover } from '../../Popover'
import type { TabItemType } from '../types'

interface MoreTabsProps<T extends string> {
  triggerId?: string
  items: TabItemType<T>[]
  onChange?: (item: TabItemType<T>) => void
  active: boolean
  activeKey?: T
  headerId: string
  headerClass?: string
  activeClassName?: string
  inactiveClassName?: string
  colors?: string[]
}

/**
 * 溢出标签的下拉菜单
 *
 * 键盘：打开后焦点进入选中项（或第一个可用项）；上下方向键循环移动、Home / End、字母 typeahead，均跳过禁用项；
 * Escape 由 Popover 关闭，焦点归还触发按钮
 */
function InnerMoreTabs<T extends string>({
  triggerId,
  items,
  onChange,
  active,
  activeKey,
  headerId,
  headerClass,
  activeClassName,
  inactiveClassName,
  colors = ['rgb(var(--systemBlue) / 1)', 'rgb(var(--systemPurple) / 1)'],
}: MoreTabsProps<T>) {
  const t = useAriaT()
  const popoverRef = useRef<PopoverRef>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const focusFrameRef = useRef<number>(undefined)
  const [open, setOpen] = useState(false)

  const isDisabled = (index: number) => Boolean(items[index]?.disabled)
  const typeahead = useTypeahead({
    count: items.length,
    getLabel: (index) => items[index]?.label,
    isDisabled,
  })

  const getMenuItems = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])

  const focusItem = (index: number) => {
    getMenuItems()[index]?.focus()
  }

  const handleOpen = useLatestCallback(() => {
    setOpen(true)
    typeahead.reset()
    /** 内容在打开后才挂载，等一帧再移交焦点 */
    cancelAnimationFrame(focusFrameRef.current ?? 0)
    focusFrameRef.current = requestAnimationFrame(() => {
      const checkedIndex = items.findIndex((item) => item.value === activeKey && !item.disabled)
      focusItem(checkedIndex !== -1
        ? checkedIndex
        : getBoundaryEnabledIndex(items.length, 1, isDisabled))
    })
  })

  const handleClose = useLatestCallback(() => {
    setOpen(false)
    cancelAnimationFrame(focusFrameRef.current ?? 0)
    /** 焦点仍在菜单内或已随菜单卸载丢失时，归还给触发按钮；点击外部其它元素时不抢焦点 */
    const activeEl = document.activeElement
    if (!activeEl || activeEl === document.body || menuRef.current?.contains(activeEl)) {
      triggerRef.current?.focus()
    }
  })

  const handleChange = useLatestCallback((item: TabItemType<T>) => {
    if (item.disabled) return
    onChange?.(item)
    popoverRef.current?.close()
  })

  const handleMenuKeyDown = useLatestCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = getMenuItems().indexOf(event.target as HTMLElement)
    let nextIndex = -1

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        nextIndex = getNextEnabledIndex({
          count: items.length,
          current,
          direction: event.key === 'ArrowDown'
            ? 1
            : -1,
          loop: true,
          isDisabled,
        })
        break
      case 'Home':
        nextIndex = getBoundaryEnabledIndex(items.length, 1, isDisabled)
        break
      case 'End':
        nextIndex = getBoundaryEnabledIndex(items.length, -1, isDisabled)
        break
      case 'Tab':
        /** 菜单不参与 Tab 序列，Tab 视为离开菜单 */
        popoverRef.current?.close()
        return
      default:
        nextIndex = typeahead.handleKey(event, current)
        if (nextIndex === -1) return
    }

    event.preventDefault()
    if (nextIndex !== -1) focusItem(nextIndex)
  })

  const menu = (
    <div
      ref={ menuRef }
      role="menu"
      aria-label={ t('moreTabs') }
      className="flex flex-col gap-1"
      onKeyDown={ handleMenuKeyDown }
    >
      { items.map((item) => {
        const isActive = activeKey === item.value

        return (
          <button
            type="button"
            key={ item.value }
            tabIndex={ -1 }
            onClick={ () => handleChange(item) }
            role="menuitemradio"
            aria-checked={ isActive }
            aria-disabled={ item.disabled || undefined }
            { ...{ [DATA_ATTR.selected]: isActive } }
            className={ cn(
              'flex w-full min-h-9 shrink-0 cursor-pointer items-center gap-2 rounded-[10px] px-2 text-sm text-text outline-none',
              'transition-colors hover:bg-background3 focus-visible:bg-background3',
              isActive && 'bg-background2',
              item.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
            ) }
          >
            { item.icon }
            { item.label }
          </button>
        )
      }) }
    </div>
  )

  return (
    <Popover
      ref={ popoverRef }
      trigger="click"
      contentClassName="p-2"
      content={ menu }
      onOpen={ handleOpen }
      onClose={ handleClose }
    >
      <button
        ref={ triggerRef }
        id={ triggerId }
        type="button"
        aria-label={ t('moreTabs') }
        aria-haspopup="menu"
        aria-expanded={ open }
        { ...{ [DATA_ATTR.selected]: active } }
        className={ cn(
          'px-4 py-2 cursor-pointer transition-all duration-300 relative shrink-0',
          active
            ? cn('text-text', activeClassName)
            : cn('text-text2', inactiveClassName),
          headerClass,
        ) }
      >
        <div className="flex items-center gap-2">
          <MoreHorizontal size={ 16 } />
        </div>

        { active && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 w-full"
            layoutId={ headerId }
            style={ {
              background: colors.length > 1
                ? `linear-gradient(to right, ${colors.join(', ')})`
                : colors[0],
            } }
            transition={ {
              type: 'spring',
              stiffness: 500,
              damping: 30,
            } }
          />
        ) }
      </button>
    </Popover>
  )
}

InnerMoreTabs.displayName = 'MoreTabs'
export const MoreTabs = memo(InnerMoreTabs) as typeof InnerMoreTabs
