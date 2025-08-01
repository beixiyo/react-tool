import { useNotifyParentReady } from '@/hooks'
import { cn } from '@/utils'
import { ThemeToggle } from '../ThemeToggle'
import { CutoutImg } from './'

export default function Test() {
  /** 通知父窗口组件准备就绪（用于截图） */
  useNotifyParentReady()

  return <div
    className={ cn(
      'size-full flex flex-col justify-center items-center p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800',
    ) }
  >
    <ThemeToggle></ThemeToggle>

    <CutoutImg
      originImg={ new URL('./assets/bed.webp', import.meta.url).href }
      cutoutImg={ new URL('./assets/bed-cutout.webp', import.meta.url).href }
      onChangeMask={ mask => console.log('Mask changed') }
      onChangePreviewImg={ img => console.log('Preview image changed') }
      onLoading={ loading => console.log('Loading state:', loading) }
    />
  </div>
}
