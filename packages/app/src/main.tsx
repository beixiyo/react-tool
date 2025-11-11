import { createRoot } from 'react-dom/client'
import App from '@/App.tsx'
import '@/plugins'
import '@/locales'
import 'comps/index.css'
import 'styles/index.css'
import './App.css'

createRoot(document.getElementById('app')!).render(
  <App />,
)
