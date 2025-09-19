import { useNotifyParentReady } from '@/hooks'
import { BgPaths } from '.'

export default function Test() {
  /** 通知父窗口组件准备就绪（用于截图） */
  useNotifyParentReady()

  return <BgPaths
    className="h-screen flex items-center justify-center"
  >
    <h1 className="text-7xl">Bg Paths</h1>
  </BgPaths>
}
