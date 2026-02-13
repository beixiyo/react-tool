import type { Language } from 'comps'
import { Outlet, RouterProvider } from '@jl-org/react-router'

import { allResources, I18nProvider, KeepAliveProvider } from 'comps'
import { useTheme } from 'hooks'
import { AnimatePresence } from 'motion/react'
import { useEffect, useState } from 'react'
import appI18n, { getCurrentLanguage, I18N_STORAGE_KEY } from './locales'
import { router } from './router'

function App() {
  useTheme({ sync: true })

  /** 与 app 包 i18next 同步：监听语言切换并传给 comps，实现组件库语言联动 */
  const [appLanguage, setAppLanguage] = useState<Language>(() =>
    (appI18n.language ?? getCurrentLanguage()) as Language,
  )
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
      <I18nProvider
        resources={ allResources }
        defaultLanguage={ getCurrentLanguage() as Language }
        language={ appLanguage }
        storage={ {
          enabled: true,
          key: I18N_STORAGE_KEY,
        } }
      >
        <AnimatePresence>
          <div className="min-h-full bg-background2 text-text">
            <RouterProvider router={ router }>
              <Outlet />
            </RouterProvider>
          </div>
        </AnimatePresence>
      </I18nProvider>
    </KeepAliveProvider>
  )
}

export default App
