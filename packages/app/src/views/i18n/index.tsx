import type { CSSProperties, ReactNode } from 'react'
import { useNotifyParentReady } from 'hooks'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { cn } from 'utils'
import { Button } from '@/components/Button'
import { useRouteActive, useRouteDeactive } from '@/components/KeepAliveRoute'
import { Select } from '@/components/Select'
import { SplitLine } from '@/components/SplitLine'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function I18n() {
  /** 通知父窗口组件准备就绪（用于截图） */
  useNotifyParentReady()

  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  useRouteActive(() => {
    console.log('i18n active')
  })

  useRouteDeactive(() => {
    console.log('i18n unactive')
  })

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value)
  }

  return (
    <div className={ cn(
      'p-8 min-h-full transition-all duration-300',
      'dark:bg-gray-900 dark:text-gray-100',
      'bg-gray-100 text-gray-800',
    ) }>
      <div className={ cn(
        'mb-4 rounded-lg p-6 transition-all duration-300',
        'dark:(bg-gray-800 text-gray-100 shadow-lg shadow-black/50)',
        'bg-white text-gray-800 shadow-md shadow-black/10',
      ) }>
        <div className="w-full flex flex-col space-y-6">
          <h4 className="mb-4 text-xl font-semibold">
            { t('common.welcome') }
          </h4>

          <SplitLine />

          <div className="flex flex-col space-y-4">
            <div>
              <ThemeToggle />
            </div>

            <div>
              <div className="flex items-center space-x-3">
                <span>切换语言:</span>
                <Select
                  value={ i18n.language }
                  onChange={ handleLanguageChange as any }
                  options={ [
                    { value: 'zh-CN', label: '中文' },
                    { value: 'en-US', label: 'English' },
                  ] }
                  className="w-32"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={ () => navigate('/zoomCvs') }
            variant="primary"
          >
            { i18n.language === 'zh-CN'
              ? '跳转到 Canvas'
              : 'Go to Canvas' }
          </Button>
        </div>
      </div>
    </div>
  )
}

I18n.displayName = 'I18n'

export interface I18nProps {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}
