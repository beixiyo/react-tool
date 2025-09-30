import { AnimatePresence } from 'framer-motion'
import { useTheme } from 'hooks'
import { RouterProvider } from 'react-router-dom'
import { CusotmSuspense } from '@/components/CusotmSuspense'
import { KeepAliveProvider } from './components/KeepAlive'
import { router } from './router'

function App() {
  useTheme()

  return (
    <KeepAliveProvider>

      <CusotmSuspense>
        <AnimatePresence>
          <div className="h-full min-h-screen from-gray-50 to-gray-100 bg-gradient-to-br text-slate-800 dark:from-gray-900 dark:to-gray-800 dark:text-slate-200">
            <RouterProvider router={ router } />
          </div>
        </AnimatePresence>
      </CusotmSuspense>

    </KeepAliveProvider>
  )
}

export default App
