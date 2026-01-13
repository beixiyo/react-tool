import { createRoot } from 'react-dom/client'
import App from '@/App.tsx'
import { initMock } from '@/mocks'
import '@/plugins'
import '@/locales'
import 'comps/index.css'
import 'styles/index.css'

initMock({ enabled: import.meta.env.DEV }).then(() => {
  createRoot(document.getElementById('app')!).render(
    <App />,
  )
})
