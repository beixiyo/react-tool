import type { AdvancedSettings } from './calculator'
import { useEffect, useState } from 'react'
import { DEFAULT_ADVANCED_SETTINGS } from './calculator'

/**
 * 一个自定义 React Hook，用于管理高级配置。
 * 它会自动从 localStorage 加载配置，并在配置变更时自动保存。
 * @version 2.1 - resetSettings 现在会显式地从 localStorage 中删除键，确保彻底重置。
 * @returns {object} 包含 settings, setSettings, 和 resetSettings 的对象。
 */
export function useAdvancedSettings() {
  const [settings, setSettings] = useState<AdvancedSettings>(() => {
    try {
      const savedSettingsJSON = localStorage.getItem('rollingCalculatorAdvancedSettings')
      if (savedSettingsJSON) {
        const savedSettings = JSON.parse(savedSettingsJSON)
        if (savedSettings && savedSettings.LOW && Array.isArray(savedSettings.LOW.reinvestmentSequences)) {
          return savedSettings
        }
      }
      return DEFAULT_ADVANCED_SETTINGS
    }
    catch (error) {
      console.error('Failed to parse settings from localStorage', error)
      return DEFAULT_ADVANCED_SETTINGS
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('rollingCalculatorAdvancedSettings', JSON.stringify(settings))
    }
    catch (error) {
      console.error('Failed to save settings to localStorage', error)
    }
  }, [settings])

  const resetSettings = () => {
    // [关键改动] 1. 显式地从 localStorage 中删除键
    localStorage.removeItem('rollingCalculatorAdvancedSettings')

    // 2. 将组件状态设置为编译时定义的默认值
    setSettings(DEFAULT_ADVANCED_SETTINGS)
  }

  return { settings, setSettings, resetSettings }
}
