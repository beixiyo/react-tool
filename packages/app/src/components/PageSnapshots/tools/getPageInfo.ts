import type { ComponentInfo } from './getPageSnaps'
import { COMPONENT_CATEGORIES } from '../category'
import {
  COMPONENT_CATEGORY_MAP,
  COMPONENT_DESCRIPTIONS,
  COMPONENT_NAME_MAP,
  PAGE_CATEGORY_MAP,
  PAGE_DESCRIPTIONS,
} from './pageDescriptions'

/**
 * 页面信息接口
 */
export interface PageInfo {
  /** 页面路径 */
  path: string
  /** 页面名称/标题 */
  name: string
  /** 页面描述 */
  description?: string
  /** 页面类型 */
  type: 'view' | 'component'
  /** 页面分类 */
  category?: string
}

/**
 * 自动扫描并获取所有测试页面信息
 */
export async function getAllPageInfo(): Promise<PageInfo[]> {
  const pages: PageInfo[] = []

  /** 获取所有 views 页面 */
  const viewModules = import.meta.glob('/src/views/**/index.tsx')
  for (const path in viewModules) {
    const routePath = path
      .replace('/src/views', '')
      .replace('/index.tsx', '')
      .replace(/\/+/g, '/') || '/'

    /** 跳过根路径，因为它会重定向 */
    if (routePath === '/')
      continue

    const name = getPageNameFromPath(routePath, 'view')
    pages.push({
      path: routePath,
      name,
      type: 'view',
      category: getPageCategory(routePath),
      description: getPageDescription(routePath, 'view'),
    })
  }

  /** 获取所有 components 测试页面 */
  const componentModules = import.meta.glob('/src/components/**/Test.tsx')
  for (const path in componentModules) {
    const routePath = path
      .replace('/src/components', '')
      .replace('/Test.tsx', '')
      .replace(/\/+/g, '/') || '/'

    const name = getPageNameFromPath(routePath, 'component')
    pages.push({
      path: routePath,
      name,
      type: 'component',
      category: getComponentCategory(routePath),
      description: getPageDescription(routePath, 'component'),
    })
  }

  return pages.sort((a, b) => {
    /** 先按类型排序，views 在后 */
    if (a.type !== b.type) {
      return a.type === 'component'
        ? -1
        : 1
    }
    /** 再按名称排序 */
    return a.path.localeCompare(b.path)
  })
}

/**
 * 将页面信息转换为截图组件信息
 */
export function pageInfoToComponentInfo(pageInfo: PageInfo): ComponentInfo {
  return {
    path: pageInfo.path,
    name: pageInfo.name,
    delay: 300, // 默认延迟300ms等待页面渲染完成
  }
}

/**
 * 批量将页面信息转换为截图组件信息
 */
export function pageInfosToComponentInfos(pageInfos: PageInfo[]): ComponentInfo[] {
  return pageInfos.map(pageInfoToComponentInfo)
}

/**
 * 从路径中提取页面名称
 */
function getPageNameFromPath(path: string, type: 'view' | 'component'): string {
  /** 移除开头的斜杠 */
  const cleanPath = path.replace(/^\/+/, '')

  if (!cleanPath) {
    return type === 'view'
      ? '首页'
      : '组件'
  }

  /** 分割路径并取最后一部分作为名称 */
  const parts = cleanPath.split('/')
  const lastName = parts[parts.length - 1]

  /** 转换为更友好的显示名称 */
  return formatDisplayName(lastName)
}

/**
 * 格式化显示名称
 */
function formatDisplayName(name: string): string {
  /** 处理驼峰命名 */
  const formatted = name
    /** 在大写字母前添加空格 */
    .replace(/([A-Z])/g, ' $1')
    /** 移除开头的空格 */
    .trim()
    /** 首字母大写 */
    .replace(/^./, str => str.toUpperCase())

  return COMPONENT_NAME_MAP[name] || formatted
}

/**
 * 获取页面分类
 */
function getPageCategory(path: string): string {
  const cleanPath = path.replace(/^\/+/, '')

  if (!cleanPath)
    return '首页'

  /** 根据路径第一级目录确定分类 */
  const firstLevel = cleanPath.split('/')[0]

  /** 检查是否匹配已知分类 */
  for (const [key, category] of Object.entries(PAGE_CATEGORY_MAP)) {
    if (firstLevel.toLowerCase().includes(key)) {
      return category
    }
  }

  return '其他'
}

/**
 * 获取组件分类
 */
function getComponentCategory(path: string): string {
  const cleanPath = path.replace(/^\/+/, '')
  const componentName = cleanPath.split('/').pop()?.toLowerCase() || ''

  const categoryValue = COMPONENT_CATEGORIES[componentName]
  if (categoryValue) {
    return COMPONENT_CATEGORY_MAP[categoryValue] || '其他组件'
  }

  return '其他组件'
}

/**
 * 获取页面描述
 */
function getPageDescription(path: string, type: 'view' | 'component'): string {
  const cleanPath = path.replace(/^\/+/, '')
  const name = getPageNameFromPath(path, type)

  if (type === 'view') {
    return PAGE_DESCRIPTIONS[cleanPath] || `${name} 页面展示`
  }
  else {
    const componentName = cleanPath.split('/').pop() || ''
    return COMPONENT_DESCRIPTIONS[componentName] || `${name} 组件演示`
  }
}
