'use client'

import type { ReactElement, ReactNode } from 'react'
import { Children, isValidElement } from 'react'

/**
 * 检查组件是否具有特定的标识属性或组件名
 */
export function isComponentType(child: ReactElement, identifiers: string[] | any[]): boolean {
  const childType = child.type as {
    displayName?: string
    name?: string
    [key: string]: any
  }

  /** 检查标识属性（如 __isChartMarkers） */
  for (const id of identifiers) {
    if (typeof id === 'string' && childType[id]) {
      return true
    }
    if (child.type === id) {
      return true
    }
  }

  /** 检查 displayName 或 name */
  const componentName
    = typeof child.type === 'function'
      ? childType.displayName || childType.name || ''
      : ''

  return identifiers.includes(componentName)
}

/**
 * 过滤并分类子组件
 */
export function categorizeChildren(
  children: ReactNode,
  categorizers: Record<string, (child: ReactElement) => boolean>,
): Record<string, ReactElement[]> {
  const results: Record<string, ReactElement[]> = {}

  /** 初始化结果对象 */
  Object.keys(categorizers).forEach((key) => {
    results[key] = []
  })
  results.others = []

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return
    }

    let matched = false
    for (const [key, check] of Object.entries(categorizers)) {
      if (check(child)) {
        results[key].push(child)
        matched = true
        break
      }
    }

    if (!matched) {
      results.others.push(child)
    }
  })

  return results
}
