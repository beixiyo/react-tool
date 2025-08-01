import { useNotifyParentReady } from '@/hooks'
import { GridBg } from '.'

export default function Test() {
  /** 通知父窗口组件准备就绪（用于截图） */
  useNotifyParentReady()

  return (
    <div className="relative h-screen w-screen">
      <div className="relative h-[50%] bg-blue/40">
        <GridBg theme="light" />
      </div>

      <div className="relative h-[50%] bg-blue/50">
        <GridBg />
      </div>
    </div>
  )
}
