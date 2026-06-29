import { DyBgc } from 'comps'
import { GithubSourceLink } from '@/components/GithubSourceLink'
import { Aurora } from '.'

function Test() {
  return <div className="h-screen flex">
    <Aurora className="flex-1 min-w-[45vw]" />
    <DyBgc className="flex-1" />

    <GithubSourceLink />
  </div>
}

export default Test
