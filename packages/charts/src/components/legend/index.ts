'use client'

export { Legend } from './legend'
export {
  LegendItemProvider,
  LegendProvider,
  useLegend,
  useLegendItem,
} from './legend-context'
export { LegendItem } from './legend-item'
/** 与 Bklit 文档中的命名一致 */
export { LegendItem as LegendItemComponent } from './legend-item'
export { LegendLabel } from './legend-label'
export { LegendMarker } from './legend-marker'
export { LegendProgress } from './legend-progress'
export { LegendValue } from './legend-value'

export type {
  LegendContextValue,
  LegendItemContextValue,
  LegendItemData,
  LegendItemProps,
  LegendLabelProps,
  LegendMarkerProps,
  LegendProgressProps,
  LegendProps,
  LegendValueProps,
} from './types'
