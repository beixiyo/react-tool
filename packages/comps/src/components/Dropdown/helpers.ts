import type { DropdownItem, DropdownProps, DropdownSection } from './types'

export function normalizeSections(items: DropdownProps['items']): DropdownSection[] {
  return Array.isArray(items)
    ? items
    : Object.entries(items).map(([name, items]) => ({ name, items }))
}

export function getDesiredExpandedSections(normalizedSections: DropdownSection[], defaultExpanded: string[], accordion: boolean): Record<string, boolean> {
  const desired: Record<string, boolean> = {}

  if (accordion) {
    const firstMatchingSection = normalizedSections.find(section =>
      defaultExpanded.includes(section.name),
    )?.name

    normalizedSections.forEach((section) => {
      desired[section.name] = section.name === firstMatchingSection
    })

    return desired
  }

  normalizedSections.forEach((section) => {
    desired[section.name] = defaultExpanded.includes(section.name)
  })

  return desired
}

export function getPreviewMeta(items: DropdownItem[], selectedId: DropdownProps['selectedId'], collapsedPreview: boolean, maxLayers: 1 | 2 | 3) {
  if (items.length === 0) {
    return {
      previewItem: null as DropdownItem | null,
      previewItems: [] as DropdownItem[],
      previewItemIds: new Set<string>(),
      previewOrderedItems: items,
    }
  }

  const previewItem = selectedId
    ? items.find(item => item.id === selectedId) ?? items[0]
    : items[0]

  const previewOrderedItems = (collapsedPreview && previewItem && items[0]?.id !== previewItem.id)
    ? [previewItem, ...items.filter(item => item.id !== previewItem.id)]
    : items

  const previewItems = previewOrderedItems.slice(0, Math.min(maxLayers, previewOrderedItems.length))
  const previewItemIds = new Set(previewItems.map(item => item.id))

  return {
    previewItem,
    previewItems,
    previewItemIds,
    previewOrderedItems,
  }
}

export function resolveSectionMaxHeight(section: DropdownSection, sectionMaxHeight: DropdownProps['sectionMaxHeight']): string | undefined {
  if (section.maxHeight !== undefined) {
    return typeof section.maxHeight === 'number'
      ? `${section.maxHeight}px`
      : section.maxHeight
  }

  if (!sectionMaxHeight) {
    return undefined
  }

  if (typeof sectionMaxHeight === 'string' || typeof sectionMaxHeight === 'number') {
    return typeof sectionMaxHeight === 'number'
      ? `${sectionMaxHeight}px`
      : sectionMaxHeight
  }

  const height = sectionMaxHeight[section.name]
  if (height !== undefined) {
    return typeof height === 'number'
      ? `${height}px`
      : height
  }

  return undefined
}

export function resolveCollapsedContent(section: DropdownSection, renderCollapsedContent: DropdownProps['renderCollapsedContent'] | undefined) {
  const content = section.collapsedPreviewContent ?? (renderCollapsedContent ? renderCollapsedContent(section) : null)
  if (!content)
    return []

  const normalized = Array.isArray(content)
    ? content
    : [content]

  return normalized.filter(item => item !== null && item !== undefined && item !== false)
}
