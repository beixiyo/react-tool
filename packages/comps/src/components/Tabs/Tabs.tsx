'use client'

/**
 * Tabs 组件入口
 */
import { useControllableState, useLatestCallback } from 'hooks'
import { memo, useId, useMemo } from 'react'
import { cn, getBoundaryEnabledIndex, getNextEnabledIndex } from 'utils'
import { MoreTabs } from './subcomponents/MoreTabs'
import { TabHeader } from './subcomponents/TabHeader'
import { TabsContent } from './subcomponents/TabsContent'
import type { TabItemType, TabsProps } from './types'

function InnerTabs<T extends string>(
  {
    style,
    className,
    header,
    headerClass,
    headerWrapClass,
    headerStyle,
    itemClass,
    contentClassName,
    activeClassName,
    inactiveClassName,
    colors,
    headerAfter,
    tabHeight = 56,
    items,
    activeKey,
    defaultActiveKey,
    onChange,
    mode,
    duration = 0.4,
    dataId,
    maxVisibleTabs,
  }: TabsProps<T>,
) {
  const headerId = useId()
  const resolvedMode = mode ?? 'suspense'

  const [innerActiveKey, setInnerActiveKey] = useControllableState<T | undefined>({
    value: activeKey,
    defaultValue: defaultActiveKey,
  })

  const currentKey = innerActiveKey

  const isActive = (item: TabItemType<T>) => item.value === currentKey

  const handleChange = useLatestCallback((item: TabItemType<T>) => {
    if (item.disabled) return
    setInnerActiveKey(item.value)
    onChange?.(item)
  })

  const visibleItems = maxVisibleTabs && items.length > maxVisibleTabs
    ? items.slice(0, maxVisibleTabs)
    : items

  const dropdownItems = maxVisibleTabs && items.length > maxVisibleTabs
    ? items.slice(maxVisibleTabs)
    : []

  const activeItemInDropdown = dropdownItems.some((item) => isActive(item))
  const isVisibleDisabled = (index: number) => Boolean(visibleItems[index]?.disabled)

  /** roving tabindex：激活项可聚焦；激活项不在可见区或被禁用时退回第一个可用 tab */
  const activeVisibleIndex = visibleItems.findIndex((item) => isActive(item) && !item.disabled)
  const focusableIndex = activeVisibleIndex !== -1
    ? activeVisibleIndex
    : getBoundaryEnabledIndex(visibleItems.length, 1, isVisibleDisabled)

  const visibleCount = visibleItems.length
  const moreTriggerId = `${headerId}-more`
  const contentItems = useMemo(
    () =>
      items.map((item, index) => ({
        value: item.value,
        children: item.children,
        /** 溢出项没有渲染成 tab，面板改由「更多」按钮命名，避免 aria-labelledby 悬空 */
        tabId: index < visibleCount
          ? `${headerId}-tab-${index}`
          : moreTriggerId,
        panelId: `${headerId}-panel-${index}`,
      })),
    [headerId, items, visibleCount, moreTriggerId],
  )

  const handleTabKeyDown = useLatestCallback((event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = visibleItems.length
    let nextIndex: number

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowLeft':
        nextIndex = getNextEnabledIndex({
          count,
          current: index,
          direction: event.key === 'ArrowRight'
            ? 1
            : -1,
          loop: true,
          isDisabled: isVisibleDisabled,
        })
        break
      case 'Home':
        nextIndex = getBoundaryEnabledIndex(count, 1, isVisibleDisabled)
        break
      case 'End':
        nextIndex = getBoundaryEnabledIndex(count, -1, isVisibleDisabled)
        break
      default:
        return
    }

    event.preventDefault()
    const nextItem = visibleItems[nextIndex]
    if (!nextItem) return

    handleChange(nextItem)
    event.currentTarget.ownerDocument
      .getElementById(`${headerId}-tab-${nextIndex}`)
      ?.focus()
  })

  const Header = header || (
    <div
      className={ cn('flex w-full items-center border-b border-border', headerWrapClass) }
      style={ {
        height: tabHeight,
        ...headerStyle,
      } }
    >
      { /* tablist 只拥有 tab；「更多」按钮与 headerAfter 作为兄弟节点放在外层 */ }
      <div role="tablist" className="flex items-center">
        { visibleItems.map((item, index) => (
          <TabHeader
            headerId={ headerId }
            key={ item.value }
            onClick={ () => handleChange(item) }
            item={ item }
            active={ isActive(item) }
            id={ `${headerId}-tab-${index}` }
            role="tab"
            aria-selected={ isActive(item) }
            aria-controls={ `${headerId}-panel-${index}` }
            aria-disabled={ item.disabled || undefined }
            tabIndex={ index === focusableIndex
              ? 0
              : -1 }
            onKeyDown={ (event) => handleTabKeyDown(event, index) }
            className={ headerClass }
            dataId={ dataId }
            activeClassName={ activeClassName }
            inactiveClassName={ inactiveClassName }
            colors={ colors }
          />
        )) }
      </div>

      { dropdownItems.length > 0 && (
        <MoreTabs<T>
          triggerId={ moreTriggerId }
          items={ dropdownItems }
          onChange={ handleChange }
          active={ activeItemInDropdown }
          activeKey={ currentKey }
          headerId={ headerId }
          headerClass={ headerClass }
          activeClassName={ activeClassName }
          inactiveClassName={ inactiveClassName }
          colors={ colors }
        />
      ) }

      { headerAfter }
    </div>
  )

  return (
    <div
      className={ cn(
        'w-full flex flex-col',
        className,
      ) }
      style={ style }
    >
      { Header }

      <TabsContent
        items={ contentItems }
        activeValue={ currentKey }
        mode={ resolvedMode }
        duration={ duration }
        className={ cn('w-full min-h-0', contentClassName) }
        style={ {
          height: `calc(100% - ${tabHeight}px)`,
        } }
        itemClassName={ cn('w-full grow', itemClass) }
      />
    </div>
  )
}

const MemoTabs = memo(InnerTabs)
MemoTabs.displayName = 'Tabs'

/** 标签页组件，`Tabs.TabsContent` 为配套的内容面板 */
export const Tabs = Object.assign(MemoTabs, { TabsContent })
