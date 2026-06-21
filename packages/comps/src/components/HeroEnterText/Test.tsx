import { HeroEnterText } from '.'

export default function Test() {
  return (
    <div className="h-screen overflow-hidden bg-black">
      <div className="grid h-full grid-rows-2">
        <HeroEnterText color="rgb(245 245 247 / 1)">
          Hero Enter Text
        </HeroEnterText>

        <HeroEnterText
          color="rgb(245 245 247 / 1)"
          duration="3s"
          finalFontSize="9vw"
        >
          Slower & Smaller
        </HeroEnterText>
      </div>
    </div>
  )
}
