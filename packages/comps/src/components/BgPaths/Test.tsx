import { BgPaths } from '.'
import { GithubSourceLink } from '../GithubSourceLink'

function Test() {
  return (
    <BgPaths className="h-screen flex items-center justify-center bg-background">
      <h1 className="text-7xl font-bold text-text">Bg Paths</h1>

      <GithubSourceLink />
    </BgPaths>
  )
}

export default Test
