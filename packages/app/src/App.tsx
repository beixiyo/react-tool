import { Outlet, RouterProvider } from '@jl-org/react-router'
import type { Language } from 'comps'
import type { FallbackProps } from 'react-error-boundary'

import { allResources, I18nProvider, KeepAliveProvider } from 'comps'
import { useTheme } from 'hooks'
import { AnimatePresence } from 'motion/react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import appI18n, { getCurrentLanguage, I18N_STORAGE_KEY } from './locales'
import { router } from './router'

const DevAgentation = import.meta.env.DEV
  ? lazy(() => import('agentation').then(m => ({ default: m.Agentation })))
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
              fallbackRender={ props => <AppErrorFallback { ...props } /> }
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

function AppErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const { t } = useTranslation('common')

  return (
    <main className="flex min-h-screen items-center justify-center bg-background2 px-6 py-10 text-text">
      <section className="w-full max-w-105 rounded-lg border border-border bg-background p-6 shadow-lg">
        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-systemRed">
            { t('appErrorBoundary.eyebrow') }
          </p>
          <h1 className="text-xl font-semibold">
            { t('appErrorBoundary.title') }
          </h1>
          <p className="mt-3 text-sm leading-6 text-text2">
            { t('appErrorBoundary.description') }
          </p>
        </div>

        <pre className="mb-5 max-h-32 overflow-auto rounded-md bg-background2 p-3 text-xs leading-5 text-text2">
          { (error as any)?.message }
        </pre>

        <button
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          type="button"
          onClick={ resetErrorBoundary }
        >
          { t('appErrorBoundary.retry') }
        </button>
      </section>
    </main>
  )
}
