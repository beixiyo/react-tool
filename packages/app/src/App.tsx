import { KeepAliveProvider } from 'comps'

import { AnimatePresence } from 'framer-motion'
import { useTheme } from 'hooks'
import { RouterProvider } from 'react-router'
import { router } from './router'

function App() {
  useTheme()

  return (
    <KeepAliveProvider>

      <AnimatePresence>
        <div className="min-h-full bg-background text-textPrimary">
          <RouterProvider router={ router } />
        </div>
      </AnimatePresence>

    </KeepAliveProvider>
  )
}

export default App
