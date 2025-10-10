import type { CountdownRingRef } from './index'
import { useRef } from 'react'
import { Button } from '..'
import { CountdownRing } from './index'

export default function CountdownRingTest() {
  const countdownRingRef = useRef<CountdownRingRef>(null)

  const handleStart = () => {
    countdownRingRef.current?.start()
  }

  const handlePause = () => {
    countdownRingRef.current?.pause()
  }

  const handleReset = () => {
    countdownRingRef.current?.reset()
  }

  const handleRestart = () => {
    countdownRingRef.current?.restart()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-[#1a1a1a] p-10 text-white">
      <h1 className="text-3xl font-bold">CountdownRing Component Test</h1>
      <CountdownRing
        ref={ countdownRingRef }
        initialTime={ 45 }
        onComplete={ () => console.log('Countdown complete!') }
        onTick={ time => console.log(`Tick: ${time}`) }
      />
      <div className="flex gap-4">
        <Button onClick={ handleStart }>Start</Button>
        <Button onClick={ handlePause }>Pause</Button>
        <Button onClick={ handleReset }>Reset</Button>
        <Button onClick={ handleRestart }>Restart</Button>
      </div>
    </div>
  )
}
