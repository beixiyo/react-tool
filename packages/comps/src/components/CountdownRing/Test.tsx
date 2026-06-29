import type { CountdownRingRef } from './index'
import { useRef } from 'react'
import { Button } from '../Button'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'
import { CountdownRing } from './index'

function CountdownRingTest() {
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
    <div className="min-h-screen bg-background p-8 text-text">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8">
        <header className="flex w-full items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">CountdownRing 组件</h1>
            <p className="mt-1 text-sm text-text2">环形倒计时，支持 start/pause/reset/restart 命令式控制</p>
          </div>
          <ThemeToggle />
        </header>

        <CountdownRing
          ref={ countdownRingRef }
          initialTime={ 45 }
        />

        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={ handleStart }>Start</Button>
          <Button onClick={ handlePause }>Pause</Button>
          <Button onClick={ handleReset }>Reset</Button>
          <Button onClick={ handleRestart }>Restart</Button>
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default CountdownRingTest
