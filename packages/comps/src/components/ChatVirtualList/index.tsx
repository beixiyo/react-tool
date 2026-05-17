/**
 * 自研生产级虚拟滚动聊天列表
 *
 * @see {@link https://www.npmjs.com/package/react-anchorlist | react-anchorlist} (v0.7.6) — 架构参照
 * @see {@link https://github.com/Luccas-carvalho/react-anchorlist | GitHub}
 * @see docs/react-anchorlist-architecture.md — 架构深度解析
 */
import type { ChatVirtualListHandle, ChatVirtualListProps } from './core/types'
import { forwardRef, memo, useImperativeHandle } from 'react'
import { cn } from 'utils'
import { LoadingIcon } from '../Loading/LoadingIcon'
import { useChatVirtualizer } from './hooks/useChatVirtualizer'
import { VirtualItemComponent } from './VirtualItemComponent'

function InnerChatVirtualList<T>(
  props: ChatVirtualListProps<T>,
  ref: React.ForwardedRef<ChatVirtualListHandle>,
) {
  const { data, itemContent, showLoading, className, style } = props

  const {
    scrollerRef,
    innerRef,
    virtualItems,
    totalSize,
    measureItem,
    handleScroll,
    isAutoScrollingRef,
  } = useChatVirtualizer(props)

  useImperativeHandle(ref, () => ({
    scrollToBottom: (behavior?: ScrollBehavior) => {
      const el = scrollerRef.current
      if (el) {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: behavior || 'auto',
        })
      }
      isAutoScrollingRef.current = true
    },
    setAutoScroll: (enabled: boolean) => {
      isAutoScrollingRef.current = enabled
    },
    isAutoScrolling: () => isAutoScrollingRef.current,
  }), [])

  return (
    <div
      ref={ scrollerRef }
      className={ cn(
        'ChatVirtualListContainer overflow-y-auto overflow-x-hidden',
        className,
      ) }
      style={ { overflowAnchor: 'none', ...style } }
      onScroll={ handleScroll }
    >
      <div
        ref={ innerRef }
        style={ {
          height: `${totalSize}px`,
          position: 'relative',
          width: '100%',
        } }
      >
        { showLoading && (
          <div className="sticky top-0 z-10 flex items-center justify-center py-3">
            <LoadingIcon size={ 24 } />
          </div>
        ) }

        { virtualItems.map(item => (
          <VirtualItemComponent
            key={ item.key }
            virtualItem={ item }
            measureItem={ measureItem }
          >
            { itemContent(item.index, data[item.index]) }
          </VirtualItemComponent>
        )) }
      </div>
    </div>
  )
}

export const ChatVirtualList = memo(forwardRef(InnerChatVirtualList)) as ChatVirtualListComponent

ChatVirtualList.displayName = 'ChatVirtualList'

export type { ChatScrollModifier, ChatVirtualListHandle, ChatVirtualListProps } from './core/types'

type ChatVirtualListComponent = {
  <T>(
    props: ChatVirtualListProps<T> & React.RefAttributes<ChatVirtualListHandle>,
  ): React.ReactNode
  displayName?: string
}
