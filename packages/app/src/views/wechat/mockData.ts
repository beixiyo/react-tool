import { uniqueId } from '@jl-org/tool'
import type { WeChatMessageItem } from './types'

/**
 * 模拟微信聊天数据
 */
export const mockMessages: WeChatMessageItem[] = [
  {
    type: 'image',
    id: uniqueId(),
    sender: 'self',
    // avatar: new URL('./me.jpg', import.meta.url).href,
    images: [
      {
        url: new URL('./1.jpg', import.meta.url).href,
      },
    ],
  },
  {
    type: 'text',
    id: uniqueId(),
    sender: 'self',
    content: 'Test data',
    // avatar: new URL('./me.jpg', import.meta.url).href
  },
  {
    type: 'timestamp',
    time: '21:18',
  },
  {
    type: 'text',
    id: uniqueId(),
    sender: 'other',
    // avatar: new URL('./he.jpg', import.meta.url).href,
    content: '结址'
  },

]

