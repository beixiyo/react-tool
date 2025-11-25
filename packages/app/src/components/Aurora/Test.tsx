import { DyBgc } from 'comps'
import { Aurora } from '.'

export default function Test() {
  return <div className="h-screen flex">
    <Aurora className="flex-1 min-w-[45vw]" />
    <DyBgc className="flex-1" />
  </div>
}
