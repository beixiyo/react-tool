import { Button } from 'comps'
import { ExternalLink, Smartphone } from 'lucide-react'
import { cn } from 'utils'
import { ANDROID_APP_ID, ANDROID_SCHEME, APPLE_APP_ID, APPLE_SCHEME } from './constants'
import { openApp, openAppStore } from './utils'

/**
 * App Demo 页面
 * 提供跳转到 Apple Store 和 Flowtica App 的功能
 */
export default function Page() {
  /**
   * 跳转到 Apple Store
   */
  const handleOpenAppStore = () => {
    openAppStore(APPLE_APP_ID)
  }

  /**
   * 跳转到 Flowtica App
   */
  const handleOpenApp = () => {
    openApp({
      iosScheme: APPLE_SCHEME,
      iosAppId: APPLE_APP_ID,
      androidScheme: ANDROID_SCHEME,
      androidAppId: ANDROID_APP_ID,
      androidStoreUrl: '',
    })
  }

  return (
    <div className={ cn(
      'min-h-screen p-8 transition-all duration-300',
      'bg-gray-50 dark:bg-gray-900',
      'text-gray-900 dark:text-gray-100',
    ) }>
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */ }
        <div className="text-center mb-12">
          <h1 className={ cn(
            'text-4xl md:text-5xl font-bold mb-4',
            'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
          ) }>
            Flowtica App Demo
          </h1>
          <p className={ cn(
            'text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto',
          ) }>
            体验 Flowtica AI 语音记录器，让 AI 成为你的生产力助手
          </p>
        </div>

        {/* 功能卡片 */ }
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* App Store 卡片 */ }
          <div className={ cn(
            'rounded-2xl p-8 transition-all duration-300',
            'bg-white dark:bg-gray-800',
            'shadow-lg hover:shadow-xl',
            'border border-gray-200 dark:border-gray-700',
            'hover:-translate-y-1',
          ) }>
            <div className="text-center">
              <div className={ cn(
                'w-16 h-16 mx-auto mb-6 rounded-full',
                'bg-blue-100 dark:bg-blue-900/30',
                'flex items-center justify-center',
              ) }>
                <ExternalLink className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>

              <h3 className="text-xl font-semibold mb-3">
                下载 Flowtica
              </h3>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                从应用商店下载
              </p>

              <Button
                variant="primary"
                size="lg"
                block
                onClick={ handleOpenAppStore }
                className="rounded-xl"
              >
                前往 App Store
              </Button>
            </div>
          </div>

          {/* Flowtica App 卡片 */ }
          <div className={ cn(
            'rounded-2xl p-8 transition-all duration-300',
            'bg-white dark:bg-gray-800',
            'shadow-lg hover:shadow-xl',
            'border border-gray-200 dark:border-gray-700',
            'hover:-translate-y-1',
          ) }>
            <div className="text-center">
              <div className={ cn(
                'w-16 h-16 mx-auto mb-6 rounded-full',
                'bg-purple-100 dark:bg-purple-900/30',
                'flex items-center justify-center',
              ) }>
                <Smartphone className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>

              <h3 className="text-xl font-semibold mb-3">
                打开 Flowtica App
              </h3>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                如果已安装 Flowtica，点击直接打开应用
              </p>

              <Button
                variant="primary"
                size="lg"
                block
                onClick={ handleOpenApp }
                className=""
              >
                打开 Flowtica
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
