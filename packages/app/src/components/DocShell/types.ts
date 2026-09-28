/**
 * DocShell 类型定义
 *
 * 组件文档壳（comps 演示页的顶栏 + API/源码面板）的公共类型
 */
import type { ReactNode } from 'react'

/**
 * 面板展示内容类型
 * - props: API 属性表
 * - code: 组件源码
 */
export type DocPanelKind = 'props' | 'code'

/** DocShell 属性 */
export type DocShellProps = {
  /** 组件名（来自路由 path，即组件目录名） */
  name: string
  /** 演示内容（自动路由挂载的 Test.tsx） */
  children?: ReactNode
}

/** DocPanel 属性 */
export type DocPanelProps = {
  /** 当前展示的面板类型；null 表示关闭 */
  kind: DocPanelKind | null
  /** 组件目录名（用于 GitHub 链接与源码定位） */
  dirName: string
  /** 关闭面板回调 */
  onClose: () => void
}
