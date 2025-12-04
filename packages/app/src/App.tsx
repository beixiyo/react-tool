import { allResources, I18nProvider, KeepAliveProvider, Language } from 'comps'

import { AnimatePresence } from 'framer-motion'
import { useTheme } from 'hooks'
import { RouterProvider } from 'react-router'
import { router } from './router'

/**
 * 获取默认语言
 * 优先从 localStorage 读取，否则根据浏览器语言设置，最后默认为中文
 */
function getDefaultLanguage(): Language {
  const stored = localStorage.getItem('i18n:language')
  if (stored && (stored === Language.ZH_CN || stored === Language.EN_US)) {
    return stored as Language
  }

  /** 从浏览器语言检测 */
  const browserLang = navigator.language || navigator.languages?.[0] || ''
  if (browserLang.startsWith('zh')) {
    return Language.ZH_CN
  }
  if (browserLang.startsWith('en')) {
    return Language.EN_US
  }

  /** 默认中文 */
  return Language.ZH_CN
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
            <RouterProvider router={ router } />
          </div>
        </AnimatePresence>
      </I18nProvider>
    </KeepAliveProvider>
  )
}

export default App
