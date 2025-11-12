import localforage from 'localforage'

/**
 * 录屏记录元信息
 */
export interface RecorderRecordMetadata {
  /** 唯一标识 */
  id: string
  /** 用户自定义名称 */
  name: string
  /** 录制时间戳 */
  createdAt: number
  /** 文件类型（MIME type） */
  mimeType: string
  /** 文件大小（字节） */
  size: number
  /** 录制类型：'video' | 'audio' */
  captureKind: 'video' | 'audio'
  /** 是否包含系统音频 */
  systemAudio: boolean
  /** 是否包含麦克风音频 */
  micAudio: boolean
  /** 录制时长（毫秒，如果可获取） */
  duration?: number
}

/**
 * 录屏记录（包含元信息和 blob）
 */
export interface RecorderRecord {
  metadata: RecorderRecordMetadata
  blob: Blob
}

const STORAGE_KEY_PREFIX = 'recorder_record_'
const METADATA_KEY_PREFIX = 'recorder_metadata_'
const METADATA_INDEX_KEY = 'recorder_metadata_index'

/**
 * 录屏数据存储服务
 */
export class RecorderStorage {
  private store: LocalForage

  constructor() {
    this.store = localforage.createInstance({
      name: 'RecorderStorage',
      storeName: 'records',
      description: '录屏数据存储',
    })
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 保存录屏记录
   */
  async saveRecord(
    blob: Blob,
    metadata: Omit<RecorderRecordMetadata, 'id' | 'createdAt' | 'size' | 'mimeType'>,
  ): Promise<string> {
    const id = this.generateId()
    const createdAt = Date.now()
    const size = blob.size
    const mimeType = blob.type || 'application/octet-stream'

    const fullMetadata: RecorderRecordMetadata = {
      id,
      createdAt,
      size,
      mimeType,
      ...metadata,
    }

    /** 保存 blob */
    await this.store.setItem(`${STORAGE_KEY_PREFIX}${id}`, blob)

    /** 保存元信息 */
    await this.store.setItem(`${METADATA_KEY_PREFIX}${id}`, fullMetadata)

    /** 更新索引 */
    const index = await this.getMetadataIndex()
    index.push(id)
    await this.store.setItem(METADATA_INDEX_KEY, index)

    return id
  }

  /**
   * 获取元信息索引
   */
  private async getMetadataIndex(): Promise<string[]> {
    const index = await this.store.getItem<string[]>(METADATA_INDEX_KEY)
    return index || []
  }

  /**
   * 获取所有录屏记录的元信息列表
   */
  async getAllMetadata(): Promise<RecorderRecordMetadata[]> {
    const index = await this.getMetadataIndex()
    const metadataList: RecorderRecordMetadata[] = []

    for (const id of index) {
      const metadata = await this.store.getItem<RecorderRecordMetadata>(
        `${METADATA_KEY_PREFIX}${id}`,
      )
      if (metadata) {
        metadataList.push(metadata)
      }
    }

    /** 按创建时间倒序排列 */
    return metadataList.sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * 根据 ID 获取录屏记录
   */
  async getRecord(id: string): Promise<RecorderRecord | null> {
    const metadata = await this.store.getItem<RecorderRecordMetadata>(
      `${METADATA_KEY_PREFIX}${id}`,
    )
    if (!metadata) {
      return null
    }

    const blob = await this.store.getItem<Blob>(`${STORAGE_KEY_PREFIX}${id}`)
    if (!blob) {
      return null
    }

    return {
      metadata,
      blob,
    }
  }

  /**
   * 根据 ID 获取 blob
   */
  async getBlob(id: string): Promise<Blob | null> {
    return await this.store.getItem<Blob>(`${STORAGE_KEY_PREFIX}${id}`)
  }

  /**
   * 根据 ID 获取元信息
   */
  async getMetadata(id: string): Promise<RecorderRecordMetadata | null> {
    return await this.store.getItem<RecorderRecordMetadata>(`${METADATA_KEY_PREFIX}${id}`)
  }

  /**
   * 删除录屏记录
   */
  async deleteRecord(id: string): Promise<void> {
    /** 删除 blob */
    await this.store.removeItem(`${STORAGE_KEY_PREFIX}${id}`)

    /** 删除元信息 */
    await this.store.removeItem(`${METADATA_KEY_PREFIX}${id}`)

    /** 更新索引 */
    const index = await this.getMetadataIndex()
    const newIndex = index.filter(itemId => itemId !== id)
    await this.store.setItem(METADATA_INDEX_KEY, newIndex)
  }

  /**
   * 更新录屏记录名称
   */
  async updateRecordName(id: string, name: string): Promise<void> {
    const metadata = await this.getMetadata(id)
    if (!metadata) {
      throw new Error(`Record with id ${id} not found`)
    }

    metadata.name = name
    await this.store.setItem(`${METADATA_KEY_PREFIX}${id}`, metadata)
  }

  /**
   * 清空所有录屏记录
   */
  async clearAll(): Promise<void> {
    const index = await this.getMetadataIndex()
    for (const id of index) {
      await this.store.removeItem(`${STORAGE_KEY_PREFIX}${id}`)
      await this.store.removeItem(`${METADATA_KEY_PREFIX}${id}`)
    }
    await this.store.removeItem(METADATA_INDEX_KEY)
  }

  /**
   * 获取存储使用量（估算）
   */
  async getStorageSize(): Promise<number> {
    const index = await this.getMetadataIndex()
    let totalSize = 0

    for (const id of index) {
      const metadata = await this.getMetadata(id)
      if (metadata) {
        totalSize += metadata.size
      }
    }

    return totalSize
  }
}

/** 导出单例 */
export const recorderStorage = new RecorderStorage()
