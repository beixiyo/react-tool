import React from 'react'
import { createComponent } from '@lit/react'
import { LBadge as LBadgeElement } from '../src/components/l-badge'

/**
 * React 包装的 Lit Badge 组件
 */
export const LBadge = createComponent({
  tagName: 'l-badge',
  displayName: 'LBadge',
  elementClass: LBadgeElement,
  react: React,
})
