import { useNotifyParentReady } from '@/hooks'
import { List } from './List'
import { ScrollIndicator } from './ScrollIndicator'

export default function App() {
  /** 通知父窗口组件准备就绪（用于截图） */
  useNotifyParentReady()

  return (
    <div className="playground h-[4000px] bg-black">
      <List>
        <ScrollIndicator />
      </List>
    </div>

  )
}
