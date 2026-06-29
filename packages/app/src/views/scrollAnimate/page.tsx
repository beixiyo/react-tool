import { GithubSourceLink } from '@/components/GithubSourceLink'
import { List } from './List'
import { ScrollIndicator } from './ScrollIndicator'

function App() {
  return (
    <div className="h-[4000px] bg-background">
      <List>
        <ScrollIndicator />
      </List>

      <GithubSourceLink />
    </div>

  )
}

export default App
