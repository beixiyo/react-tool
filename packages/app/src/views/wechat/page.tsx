import { useState } from 'react'
import { cn } from 'utils'
import type { WeChatMessage, WeChatMessageItem } from './types'
import { mockMessages } from './mockData'

/**
 * 微信聊天页面组件
 */
export default function WeChatPage() {
  const [messages] = useState<WeChatMessageItem[]>(mockMessages)

  return <div className="flex h-screen flex-col bg-background justify-center items-center">
    <Page messages={ messages }
      className='w-72 h-screen'
    />
  </div>
}

function Page(props: PageProps) {
  const { messages, className, style } = props

  return (
    <div className={ cn('flex flex-col bg-[#EDEDED]', className) } style={ style }>
      <div className="flex h-14 items-center justify-between bg-white px-3">
        <div className="flex items-center">
          <button className="flex items-center justify-center -ml-1.5">
            <svg
              className="h-6 w-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={ 1.5 }
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className='rounded-full bg-[#D5D5D5] size-[18px] flex justify-center items-center'>
            <span className="text-[11px] font-semibold text-black">2</span>
          </div>
        </div>

        <h1 className="text-base text-black">冯</h1>

        <button className="flex items-center justify-center">
          <svg
            className="h-6 w-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={ 1 }
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </button>
      </div>

      {/* 消息列表 */ }
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="flex flex-col gap-3">
          { messages.map((item, index) => {
            if (item.type === 'timestamp') {
              return (
                <div
                  key={ `timestamp-${index}` }
                  className="flex justify-center py-2"
                >
                  <span className="text-xs text-[#999999]">{ item.time }</span>
                </div>
              )
            }

            const message = item as WeChatMessage
            const isSelf = message.sender === 'self'

            return (
              <div
                key={ message.id }
                className={ cn(
                  'flex items-start',
                  isSelf ? 'justify-end' : 'justify-start',
                ) }
              >
                { !isSelf && (
                  <div className="mr-2 flex-shrink-0">
                    { message.avatar
                      ? (
                        <img
                          src={ message.avatar }
                          alt="头像"
                          className="h-10 w-10 rounded-full"
                        />
                      )
                      : (
                        <div className="h-10 w-10 rounded-full bg-gray-300" />
                      ) }
                  </div>
                ) }

                <div
                  className={ cn(
                    'max-w-[60%] rounded-[4px]',
                    message.type === 'image'
                      ? 'overflow-hidden'
                      : 'px-3 py-2',
                    isSelf
                      ? 'bg-[#95EC69]'
                      : 'bg-white',
                  ) }
                >
                  { message.type === 'text' && (
                    <div className="break-words text-sm leading-relaxed text-black">
                      { message.content }
                    </div>
                  ) }

                  { message.type === 'image' && (
                    <div className="space-y-2">
                      { message.images?.map((img, imgIndex) => (
                        <img
                          key={ imgIndex }
                          src={ img.url }
                          alt={ img.caption || '图片' }
                          className="max-h-[400px] max-w-full"
                        />
                      )) }
                    </div>
                  ) }

                  { message.type === 'mixed' && (
                    <div className="space-y-2">
                      { message.content && (
                        <div className="break-words text-sm leading-relaxed text-black">
                          { message.content }
                        </div>
                      ) }
                      { message.images && message.images.length > 0 && (
                        <div className="space-y-2">
                          { message.images.map((img, imgIndex) => (
                            <img
                              key={ imgIndex }
                              src={ img.url }
                              alt={ img.caption || '图片' }
                              className="max-h-[400px] max-w-full"
                            />
                          )) }
                        </div>
                      ) }
                    </div>
                  ) }
                </div>

                { isSelf && (
                  <div className="ml-2 flex-shrink-0">
                    { message.avatar
                      ? (
                        <img
                          src={ message.avatar }
                          alt="头像"
                          className="h-10 w-10 rounded-full"
                        />
                      )
                      : (
                        <div className="h-10 w-10 rounded-full bg-gray-300" />
                      ) }
                  </div>
                ) }
              </div>
            )
          }) }
        </div>
      </div>
    </div>
  )
}

export type PageProps = {
  messages: WeChatMessageItem[]
}
  & React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>