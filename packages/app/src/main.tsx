import { createRoot } from 'react-dom/client'
import App from '@/App.tsx'
import '@/plugins'
import '@/locales'
import 'comps/index.css'
import 'styles/index.css'
import { initMock } from '@/mocks'

initMock({ enabled: import.meta.env.DEV }).then(() => {
  createRoot(document.getElementById('app')!).render(
    <App />,
  )
})
