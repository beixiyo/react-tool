import { List } from './List'
import { ScrollIndicator } from './ScrollIndicator'

export default function App() {
  return (
    <div className="h-[4000px] bg-background">
      <List>
        <ScrollIndicator />
      </List>
    </div>

  )
}
