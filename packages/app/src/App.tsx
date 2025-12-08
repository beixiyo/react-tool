import type { Language } from 'comps'
import { allResources, I18nProvider, KeepAliveProvider, LANGUAGES } from 'comps'

import { AnimatePresence } from 'framer-motion'
import { useTheme } from 'hooks'
import { Outlet, RouterProvider } from '@jl-org/react-router'
import { router } from './router'

/**
 * 获取默认语言
 * 优先从 localStorage 读取，否则根据浏览器语言设置，最后默认为中文
 */
function getDefaultLanguage(): Language {
  const stored = localStorage.getItem('i18n:language')
  if (stored && (stored === LANGUAGES.ZH_CN || stored === LANGUAGES.EN_US)) {
    return stored as Language
  }

  /** 从浏览器语言检测 */
  const browserLang = navigator.language || navigator.languages?.[0] || ''
  if (browserLang.startsWith('zh')) {
    return LANGUAGES.ZH_CN
  }
  if (browserLang.startsWith('en')) {
    return LANGUAGES.EN_US
  }

  /** 默认中文 */
  return LANGUAGES.ZH_CN
}

function App() {
  useTheme()

  return (
    <KeepAliveProvider>
      <I18nProvider
        resources={ allResources }
        defaultLanguage={ getDefaultLanguage() }
        storage={ {
          enabled: true,
          key: 'i18n:language',
        } }
      >
        <AnimatePresence>
          <div className="min-h-full bg-background text-textPrimary">
            <RouterProvider router={ router } >
              <Outlet />
            </RouterProvider>
          </div>
        </AnimatePresence>
      </I18nProvider>
    </KeepAliveProvider>
  )
}

export default App
