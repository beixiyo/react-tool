import { Outlet, RouterProvider } from '@jl-org/react-router'
import type { Language } from 'comps'
import type { FallbackProps } from 'react-error-boundary'

import { allResources, I18nProvider, KeepAliveProvider } from 'comps'
import { useTheme } from 'hooks'
import { AnimatePresence } from 'motion/react'
import { lazy, memo, Suspense, useEffect, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import appI18n, { getCurrentLanguage, I18N_STORAGE_KEY } from './locales'
import { router } from './router'

const DevAgentation = import.meta.env.DEV
  ? lazy(() => import('agentation').then((m) => ({ default: m.Agentation })))
  : () => null

function App() {
  useTheme({ sync: true })

  /** 与 app 包 i18next 同步：监听语言切换并传给 comps，实现组件库语言联动 */
  const [appLanguage, setAppLanguage] = useState<Language>(() => (appI18n.language ?? getCurrentLanguage()) as Language)
  useEffect(() => {
    const handler = (lng: string) => {
      console.log('lng', lng)
      setAppLanguage(lng as Language)
    }

    appI18n.on('languageChanged', handler)
    return () => appI18n.off('languageChanged', handler)
  }, [])

  return (
    <KeepAliveProvider>
      <Suspense>
        <DevAgentation />
      </Suspense>
      <I18nProvider
        resources={ allResources }
        defaultLanguage={ getCurrentLanguage() as Language }
        language={ appLanguage }
        persistence={ {
          enabled: true,
          key: I18N_STORAGE_KEY,
        } }
      >
        <AnimatePresence>
          <div className="min-h-full bg-background2 text-text">
            <ErrorBoundary
              fallbackRender={ (props) => <AppErrorFallback { ...props } /> }
              onError={ (error, info) => {
                console.error('[AppErrorBoundary]', error, info.componentStack)
              } }
            >
              <RouterProvider router={ router }>
                <Outlet />
              </RouterProvider>
            </ErrorBoundary>
          </div>
        </AnimatePresence>
      </I18nProvider>
    </KeepAliveProvider>
  )
}

export default App

const AppErrorFallback = memo<FallbackProps>((props) => {
  const {
    error,
    resetErrorBoundary,
  } = props
  const { t } = useTranslation('common')

  return (
    <main
      role="alert"
      className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-background3 px-6 text-center text-text"
    >
      <h1 className="text-sm font-medium">
        { t('appErrorBoundary.title') }
      </h1>

      <p className="max-w-70 text-xs leading-5 text-text3">
        { t('appErrorBoundary.description') }
      </p>

      { import.meta.env.DEV && (
        <p className="max-w-90 truncate text-[11px] leading-4 text-text4">
          { getErrorMessage(error) }
        </p>
      ) }

      <button
        className="rounded-full bg-background px-4 py-2 text-sm text-text transition-colors hover:bg-background2"
        type="button"
        onClick={ resetErrorBoundary }
      >
        { t('appErrorBoundary.retry') }
      </button>
    </main>
  )
})

AppErrorFallback.displayName = 'AppErrorFallback'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message

  if (typeof error === 'string') return error

  return 'Unknown render error'
}
