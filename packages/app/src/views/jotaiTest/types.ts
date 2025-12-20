/**
 * 测试相关的类型定义
 */

export type TestResult = {
  success: boolean
  message: string
  expected: string
  actual: string
  error?: string
  duration?: number
}

export type TestCase = {
  name: string
  description: string
  run: () => Promise<TestResult>
}

export type TestSuite = {
  name: string
  description: string
  tests: TestCase[]
}

