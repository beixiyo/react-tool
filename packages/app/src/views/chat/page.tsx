import { ChatPage } from './components/ChatPage'
import { SideBar } from './components/SideBar'

function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-backgroundSubtle dark:bg-background">
      <SideBar className="shrink-0 bg-background dark:bg-background" />
      <ChatPage className="flex-1" />
    </div>
  )
}

export default App
