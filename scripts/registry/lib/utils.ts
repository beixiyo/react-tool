import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { Children, Fragment, isValidElement } from 'react'
import { twMerge } from 'tailwind-merge'

/**
 * tailwindCSS 类合并
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 过滤配置
 */
interface FilterValidCompsOptions {
  /** 元素过滤器，返回 false 的元素被剔除 */
  elementFilter?: (child: React.ReactElement) => boolean
  /** 是否保留非元素节点（字符串、数字等） */
  keepNonElements?: boolean
  /** 非元素过滤器 */
  nonElementFilter?: (child: ReactNode) => boolean
  /** 是否拍平 Fragment 递归取子节点 */
  flattenFragments?: boolean
}

/**
 * 从 React 子节点中过滤出有效的组件元素
 *
 * @param children - 要过滤的React子节点
 * @param opts - 过滤配置
 * @returns 过滤后的有效 ReactElement 数组
 */
export function filterValidComps(
  children: ReactNode,
  opts: FilterValidCompsOptions = {},
): ReactNode[] {
  const {
    elementFilter,
    keepNonElements = false,
    nonElementFilter,
    flattenFragments = false,
  } = opts

  const result: ReactNode[] = []

  const walk = (nodes: ReactNode) => {
    Children.toArray(nodes).forEach((child) => {
      if (isValidElement(child)) {
        if (flattenFragments && child.type === Fragment) {
          walk((child.props as { children?: ReactNode }).children)
          return
        }
        if (elementFilter && !elementFilter(child)) {
          return
        }
        result.push(child)
        return
      }

      if (!keepNonElements) {
        return
      }

      if (nonElementFilter && !nonElementFilter(child)) {
        return
      }

      result.push(child)
    })
  }

  walk(children)
  return result
}
