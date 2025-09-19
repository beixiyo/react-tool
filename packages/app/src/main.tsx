import { createRoot } from 'react-dom/client'
import App from '@/App.tsx'
import '@/plugins'
import '@/locales'
import '@/styles/css/index.css'

createRoot(document.getElementById('app')!).render(
  <App />,
)
