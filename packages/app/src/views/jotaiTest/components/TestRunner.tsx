import { memo, useState, useCallback } from 'react'
import { Button } from 'comps'
import { Play, Square } from 'lucide-react'
import type { TestCase, TestResult as TestResultType } from '../types'

export type TestRunnerProps = {
  tests: TestCase[]
  onRun: () => Promise<void>
  isRunning: boolean
  className?: string
}

export const TestRunner = memo<TestRunnerProps>((props) => {
  const {
    tests,
    onRun,
    isRunning,
    className,
  } = props

  return (
    <div className={ className }>
      <Button
        onClick={ onRun }
        disabled={ isRunning }
        variant="primary"
        size="lg"
        leftIcon={ isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" /> }
        block
        loading={ isRunning }
        loadingText="运行中..."
      >
        { isRunning ? '停止测试' : `运行所有测试 (${tests.length})` }
      </Button>
    </div>
  )
})

TestRunner.displayName = 'TestRunner'

