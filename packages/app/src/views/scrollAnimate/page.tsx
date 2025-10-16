import { List } from './List'
import { ScrollIndicator } from './ScrollIndicator'

export default function App() {
  return (
    <div className="h-[4000px] bg-black">
      <List>
        <ScrollIndicator />
      </List>
    </div>

  )
}
