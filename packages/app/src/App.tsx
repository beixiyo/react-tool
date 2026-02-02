import type { Language } from 'comps'
import { Outlet, RouterProvider } from '@jl-org/react-router'

import { allResources, I18nProvider, KeepAliveProvider } from 'comps'
import { useTheme } from 'hooks'
import { AnimatePresence } from 'motion/react'
import { getCurrentLanguage, I18N_STORAGE_KEY } from './locales'
import { router } from './router'

function App() {
  useTheme({ sync: true })

  return (
    <KeepAliveProvider>
      <I18nProvider
        resources={ allResources }
        defaultLanguage={ getCurrentLanguage() as Language }
        storage={ {
          enabled: true,
          key: I18N_STORAGE_KEY,
        } }
      >
        <AnimatePresence>
          <div className="min-h-full bg-backgroundSecondary text-textPrimary">
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
