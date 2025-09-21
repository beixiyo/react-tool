import { GridBg } from '.'

export default function Test() {
  return (
    <div className="relative h-screen w-screen">
      <div className="relative h-[50%] bg-blue/40">
        <GridBg theme="light" />
      </div>

      <div className="relative h-[50%] bg-blue/50">
        <GridBg />
      </div>
    </div>
  )
}
