/** 统一底栏 action 的图标占位与实际渲染尺寸。 */

import type { ReactNode } from 'react'
import { memo } from 'react'
import { BOTTOM_BAR_ACTION_ICON_CLS } from './styles'

export const BottomBarActionIcon = memo<BottomBarActionIconProps>(({ icon }) => <span className={ BOTTOM_BAR_ACTION_ICON_CLS }>{ icon }</span>)

BottomBarActionIcon.displayName = 'BottomBarActionIcon'

type BottomBarActionIconProps = {
  icon: ReactNode
}
