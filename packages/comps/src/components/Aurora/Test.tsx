import { Aurora } from '.'
import { DyBgc } from '../DyBgc'

export default function Test() {
  return <div className="size-full flex gap-4">
    <Aurora className="flex-1 min-w-[45vw]" />
    <DyBgc className="flex-1" />
  </div>
}
