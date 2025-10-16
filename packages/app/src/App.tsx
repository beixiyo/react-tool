import { CusotmSuspense, KeepAliveProvider } from 'comps'

import { AnimatePresence } from 'framer-motion'
import { useTheme } from 'hooks'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

function App() {
  useTheme()

  return (
    <KeepAliveProvider>

      <CusotmSuspense>
        <AnimatePresence>
          <div className="min-h-full bg-background text-textPrimary">
            <RouterProvider router={ router } />
          </div>
        </AnimatePresence>
      </CusotmSuspense>

    </KeepAliveProvider>
  )
}

export default App
