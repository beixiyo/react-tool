import { useLatestCallback } from 'hooks'
import { useEffect } from 'react'
import type { MessageItemData } from '../types'

/**
 * 单条堆叠消息的生命周期副作用：
 * 挂载时触发一次 onShow；每次原地更新取消旧计时，并按最新 duration 重新计时
 *
 * @param item 当前消息数据（仅新增或原地更新时生成新引用）
 * @param onClose 请求关闭的回调，接收消息 id
 */
export function useMessageTimer(
  item: MessageItemData,
  onClose: (id: number) => void,
) {
  const close = useLatestCallback(() => onClose(item.id))
  const onShow = useLatestCallback(() => item.onShow?.())

  useEffect(() => {
    onShow()
  }, [])

  useEffect(() => {
    if (item.duration > 0) {
      const timer = setTimeout(close, item.duration)
      return () => clearTimeout(timer)
    }
  }, [item])
}
