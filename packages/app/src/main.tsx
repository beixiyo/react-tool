import App from '@/App.tsx'
import { initMock } from '@/mocks'
import { createRoot } from 'react-dom/client'
import '@/plugins'
import '@/locales'
import './tailwind.css'

initMock({ enabled: import.meta.env.DEV }).then(() => {
  createRoot(document.getElementById('app')!).render(
    <App />,
  )
})
