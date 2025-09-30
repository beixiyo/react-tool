import { ChatPage } from './components/ChatPage'
import { SideBar } from './components/SideBar'

function App() {
  return (
    <div className="h-screen flex gap-4 overflow-hidden bg-slate-50 dark:bg-slate-900">
      <SideBar className="border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
      <ChatPage className="h-full flex-1 border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
    </div>
  )
}

export default App
