import { HeroEnterText } from 'comps'
import { GithubSourceLink } from '@/components/GithubSourceLink'
import { Landing } from '.'

function Test() {
  return <Landing className="flex items-center justify-center">
    <HeroEnterText color="white">
      Landing Page
    </HeroEnterText>

    <GithubSourceLink />
  </Landing>
}

export default Test
