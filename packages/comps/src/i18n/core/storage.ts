/**
 * 存储适配器接口
 * 允许外部自定义存储实现（如 LocalStorage、SessionStorage、IndexedDB 等）
 */
export interface StorageAdapter {
  /**
   * 获取存储值
   * @param key 存储键
   * @returns 存储值，不存在返回 null
   */
  get: (key: string) => string | null

  /**
   * 设置存储值
   * @param key 存储键
   * @param value 存储值
   */
  set: (key: string, value: string) => void

  /**
   * 删除存储值
   * @param key 存储键
   */
  remove: (key: string) => void
}

/**
 * LocalStorage 存储适配器（默认实现）
 */
export class LocalStorageAdapter implements StorageAdapter {
  /**
   * 检查 LocalStorage 是否可用
   */
  private isAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false
      }
      /** 尝试读写操作 */
      const testKey = '__i18n_storage_test__'
      window.localStorage.setItem(testKey, 'test')
      window.localStorage.removeItem(testKey)
      return true
    }
    catch {
      return false
    }
  }

  get(key: string): string | null {
    if (!this.isAvailable()) {
      return null
    }

    try {
      return window.localStorage.getItem(key)
    }
    catch (error) {
      console.warn(`Failed to get storage key "${key}":`, error)
      return null
    }
  }

  set(key: string, value: string): void {
    if (!this.isAvailable()) {
      console.warn('LocalStorage is not available')
      return
    }

    try {
      window.localStorage.setItem(key, value)
    }
    catch (error) {
      console.warn(`Failed to set storage key "${key}":`, error)
    }
  }

  remove(key: string): void {
    if (!this.isAvailable()) {
      return
    }

    try {
      window.localStorage.removeItem(key)
    }
    catch (error) {
      console.warn(`Failed to remove storage key "${key}":`, error)
    }
  }
}

/**
 * 存储配置接口
 */
export interface StorageConfig {
  /**
   * 是否启用持久化存储（默认 true）
   */
  enabled?: boolean

  /**
   * 存储键名（默认 'i18n:language'）
   */
  key?: string

  /**
   * 自定义存储适配器（默认 LocalStorageAdapter）
   */
  adapter?: StorageAdapter
}

/**
 * 默认存储配置
 */
export const DEFAULT_STORAGE_CONFIG: Required<StorageConfig> = {
  enabled: true,
  key: 'i18n:language',
  adapter: new LocalStorageAdapter(),
}
