import { useNotifyParentReady } from '@/hooks'
import { Aurora } from '.'
import { DyBgc } from '../DyBgc'

export default function Test() {
  /** 通知父窗口组件准备就绪（用于截图） */
  useNotifyParentReady()

  return <div className="size-full flex gap-4">
    <Aurora className="flex-1" />
    <DyBgc className="flex-1" />
  </div>
}
