/**
 * 微信消息类型
 */
export type WeChatMessage = {
  /**
   * 消息 ID
   */
  id: string
  /**
   * 发送者类型
   */
  sender: 'self' | 'other'
  /**
   * 消息类型
   */
  type: 'text' | 'image' | 'mixed'
  /**
   * 文本内容（当 type 为 'text' 或 'mixed' 时使用）
   */
  content?: string
  /**
   * 图片列表（当 type 为 'image' 或 'mixed' 时使用）
   */
  images?: {
    /**
     * 图片 URL
     */
    url: string
    /**
     * 图片描述
     */
    caption?: string
  }[]
  /**
   * 头像 URL（可选，如果不传则显示默认灰色背景）
   */
  avatar?: string
}

/**
 * 时间戳项
 */
export type WeChatTimestamp = {
  /**
   * 类型标识
   */
  type: 'timestamp'
  /**
   * 时间显示文本（如 "21:18"）
   */
  time: string
}

/**
 * 微信消息列表项（消息或时间戳）
 */
export type WeChatMessageItem = WeChatMessage | WeChatTimestamp

