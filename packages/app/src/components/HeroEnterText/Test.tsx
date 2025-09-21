import { HeroEnterText } from '.'

export default function Test() {
  return <div
    className="h-screen overflow-hidden"
    style={ {
      background: '#000',
      // background: 'url(https://images.pexels.com/photos/7267852/pexels-photo-7267852.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400&h=250&fit=crop&crop=focalpoint) no-repeat center/cover',
    } }
  >
    <HeroEnterText
    >
      Hero Enter Text
    </HeroEnterText>
  </div>
}
