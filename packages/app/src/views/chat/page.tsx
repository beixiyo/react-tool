import { ChatPage } from './components/ChatPage'
import { SideBar } from './components/SideBar'

function App() {
  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 dark:bg-slate-900">
      <SideBar className="shrink-0 bg-white dark:bg-slate-900" />
      <ChatPage className="h-full flex-1 bg-white dark:bg-slate-900" />
    </div>
  )
}

export default App
