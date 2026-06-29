import React from 'react'
import { createComponent, type Options } from '@lit/react'
import { LBadge as LBadgeElement } from '../src/components/l-badge'

const litReact = React as unknown as LitReact

/**
 * React 包装的 Lit Badge 组件
 */
export const LBadge = createComponent({
  tagName: 'l-badge',
  displayName: 'LBadge',
  elementClass: LBadgeElement,
  react: litReact,
})

type LitReact = Options<LBadgeElement>['react']
