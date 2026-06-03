import type { PromptCategory, PromptTemplate } from '../types'
import { useT } from 'i18n/react'
import { useCallback, useEffect, useState } from 'react'
import { createDefaultPromptTemplates, STORAGE_KEYS } from '../constants'

/**
 * 提示词模板管理 Hook
 */
export function usePromptTemplates(customTemplates: PromptTemplate[] = []) {
  const t = useT()
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(true)

  /** 初始化模板数据 */
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        /** 从本地存储加载自定义模板 */
        const savedCustomTemplates = localStorage.getItem(STORAGE_KEYS.CUSTOM_TEMPLATES)
        const parsedCustomTemplates: PromptTemplate[] = savedCustomTemplates
          ? JSON.parse(savedCustomTemplates)
          : []

        /** 创建默认模板（使用当前语言的翻译） */
        const defaultTemplates = createDefaultPromptTemplates(t)

        /** 合并默认模板、传入的自定义模板和本地存储的自定义模板 */
        const allTemplates = [
          ...defaultTemplates,
          ...customTemplates,
          ...parsedCustomTemplates,
        ]

        /** 去重（基于 id） */
        const uniqueTemplates = allTemplates.reduce((acc, template) => {
          if (!acc.find(t => t.id === template.id)) {
            acc.push(template)
          }
          return acc
        }, [] as PromptTemplate[])

        setTemplates(uniqueTemplates)
      }
      catch (error) {
        console.error('Failed to load prompt templates:', error)
        const defaultTemplates = createDefaultPromptTemplates(t)
        setTemplates([...defaultTemplates, ...customTemplates])
      }
      finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [customTemplates, t])

  /** 添加自定义模板 */
  const addCustomTemplate = useCallback((template: Omit<PromptTemplate, 'id' | 'isCustom' | 'createdAt' | 'usageCount'>) => {
    const newTemplate: PromptTemplate = {
      ...template,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      isCustom: true,
      createdAt: Date.now(),
      usageCount: 0,
    }

    setTemplates((prev) => {
      const updated = [...prev, newTemplate]

      /** 保存自定义模板到本地存储 */
      try {
        const customTemplates = updated.filter(t => t.isCustom).map((template) => {
          /** 创建一个干净的对象，避免循环引用 */
          const cleanTemplate = {
            ...template,
            icon: undefined, // 不保存React元素到localStorage
          }
          return cleanTemplate
        })
        localStorage.setItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(customTemplates))
      }
      catch (error) {
        console.error('Failed to save custom templates:', error)
      }

      return updated
    })

    return newTemplate
  }, [])

  /** 更新模板 */
  const updateTemplate = useCallback((id: string, updates: Partial<PromptTemplate>) => {
    setTemplates((prev) => {
      const updated = prev.map(template =>
        template.id === id
          ? { ...template, ...updates }
          : template,
      )

      /** 如果是自定义模板，更新本地存储 */
      try {
        const customTemplates = updated.filter(t => t.isCustom).map((template) => {
          /** 创建一个干净的对象，避免循环引用 */
          const cleanTemplate = {
            ...template,
            icon: undefined, // 不保存React元素到localStorage
          }
          return cleanTemplate
        })
        localStorage.setItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(customTemplates))
      }
      catch (error) {
        console.error('Failed to save custom templates:', error)
      }

      return updated
    })
  }, [])

  /** 删除自定义模板 */
  const deleteCustomTemplate = useCallback((id: string) => {
    setTemplates((prev) => {
      const updated = prev.filter(template => template.id !== id)

      /** 更新本地存储 */
      try {
        const customTemplates = updated.filter(t => t.isCustom).map((template) => {
          /** 创建一个干净的对象，避免循环引用 */
          const cleanTemplate = {
            ...template,
            icon: undefined, // 不保存React元素到localStorage
          }
          return cleanTemplate
        })
        localStorage.setItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(customTemplates))
      }
      catch (error) {
        console.error('Failed to save custom templates:', error)
      }

      return updated
    })
  }, [])

  /** 增加使用次数 */
  const incrementUsage = useCallback((id: string) => {
    setTemplates((prev) => {
      const updated = prev.map(template =>
        template.id === id
          ? { ...template, usageCount: (template.usageCount || 0) + 1 }
          : template,
      )

      /** 如果是自定义模板，更新本地存储 */
      try {
        const customTemplates = updated.filter(t => t.isCustom).map((template) => {
          /** 创建一个干净的对象，避免循环引用 */
          const cleanTemplate = {
            ...template,
            icon: undefined, // 不保存React元素到localStorage
          }
          return cleanTemplate
        })
        localStorage.setItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(customTemplates))
      }
      catch (error) {
        console.error('Failed to save custom templates:', error)
      }

      return updated
    })
  }, [])

  /** 按分类筛选模板 */
  const getTemplatesByCategory = useCallback((category?: PromptCategory) => {
    if (!category)
      return templates
    return templates.filter(template => template.category === category)
  }, [templates])

  /** 搜索模板 */
  const searchTemplates = useCallback((query: string, category?: PromptCategory) => {
    const filteredTemplates = category
      ? getTemplatesByCategory(category)
      : templates

    if (!query.trim())
      return filteredTemplates

    const searchQuery = query.toLowerCase()
    return filteredTemplates.filter(template =>
      template.title.toLowerCase().includes(searchQuery)
      || template.description?.toLowerCase().includes(searchQuery)
      || template.content.toLowerCase().includes(searchQuery)
      || template.tags?.some(tag => tag.toLowerCase().includes(searchQuery)),
    )
  }, [templates, getTemplatesByCategory])

  /** 获取最常用的模板 */
  const getMostUsedTemplates = useCallback((limit = 5) => {
    return [...templates]
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, limit)
  }, [templates])

  /** 获取最近添加的自定义模板 */
  const getRecentCustomTemplates = useCallback((limit = 5) => {
    return templates
      .filter(t => t.isCustom)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, limit)
  }, [templates])

  return {
    templates,
    loading,
    addCustomTemplate,
    updateTemplate,
    deleteCustomTemplate,
    incrementUsage,
    getTemplatesByCategory,
    searchTemplates,
    getMostUsedTemplates,
    getRecentCustomTemplates,
  }
}
