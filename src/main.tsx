import App from '@/App.tsx'
import { createRoot } from 'react-dom/client'
import '@/plugins'
import '@/locales'
import '@/styles/css/index.css'

createRoot(document.getElementById('app')!).render(
  <App />,
)
