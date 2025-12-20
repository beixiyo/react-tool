import { useState, useCallback, Suspense } from 'react'
import { Card } from 'comps'
import { TestCard, TestResult, TestRunner, CreateUseAtomsDemo, SplitAtomDemo, UseStateDemo, RenderOptimizationDemo } from './components'
import { primitiveTests } from './tests/primitiveTests'
import { derivedTests } from './tests/derivedTests'
import { asyncTests } from './tests/asyncTests'
import { writableTests } from './tests/writableTests'
import { createUseAtomsTests } from './tests/createUseAtomsTests'
import type { TestCase, TestResult as TestResultType } from './types'

/**
 * Jotai 测试页面
 * 提供全面的 Jotai 功能测试和 createUseAtoms 工具测试
 */

const allTests: TestCase[] = [
  ...primitiveTests,
  ...derivedTests,
  ...asyncTests,
  ...writableTests,
  ...createUseAtomsTests,
]

export default function JotaiTestPage() {
  const [testResults, setTestResults] = useState<Map<string, TestResultType>>(new Map())
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)

  const runAllTests = useCallback(async () => {
    setIsRunning(true)
    setStartTime(Date.now())
    const results = new Map<string, TestResultType>()

    for (const test of allTests) {
      try {
        const start = Date.now()
        const result = await test.run()
        const duration = Date.now() - start
        results.set(test.name, {
          ...result,
          duration,
        })
      }
      catch (error) {
        results.set(test.name, {
          success: false,
          message: `测试执行失败: ${error}`,
          expected: '',
          actual: '',
          error: String(error),
        })
      }
    }

    setTestResults(results)
    setIsRunning(false)
  }, [])

  const passed = Array.from(testResults.values()).filter(r => r.success).length
  const failed = Array.from(testResults.values()).filter(r => !r.success).length
  const total = testResults.size
  const duration = startTime > 0 ? Date.now() - startTime : 0

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 页面标题 */ }
        <div>
          <h1 className="text-3xl font-bold text-textPrimary mb-2">
            Jotai 功能测试
          </h1>
          <p className="text-textSecondary">
            全面测试 Jotai 的各种功能和 createUseAtoms 工具函数
          </p>
        </div>

        {/* 测试控制 */ }
        <TestRunner
          tests={ allTests }
          onRun={ runAllTests }
          isRunning={ isRunning }
        />

        {/* 测试结果汇总 */ }
        { testResults.size > 0 && (
          <TestResult
            total={ total }
            passed={ passed }
            failed={ failed }
            duration={ duration }
          />
        ) }

        {/* 渲染优化测试 */ }
        <RenderOptimizationDemo />

        {/* createUseAtoms 演示 */ }
        <Suspense fallback={ <div>Loading...</div> }>
          <CreateUseAtomsDemo />
        </Suspense>

        {/* splitAtom 性能优化演示 */ }
        <SplitAtomDemo />

        {/* useState 示例 */ }
        <UseStateDemo />

        {/* 测试列表 */ }
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-textPrimary">
            测试用例 ({ allTests.length })
          </h2>
          <div className="grid gap-4">
            { allTests.map((test) => (
              <TestCard
                key={ test.name }
                name={ test.name }
                description={ test.description }
                result={ testResults.get(test.name) }
                isRunning={ isRunning && !testResults.has(test.name) }
              />
            )) }
          </div>
        </div>
      </div>
    </div>
  )
}

