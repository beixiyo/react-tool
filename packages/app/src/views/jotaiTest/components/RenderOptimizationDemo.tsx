import { getColor } from '@jl-org/tool'
import { Button, Card } from 'comps'

import { createUseAtoms } from 'hooks'
import { atom } from 'jotai'
import { memo, useRef, useState } from 'react'
import { cn } from 'utils'

/**
 * 渲染优化测试组件
 * 测试当使用 createUseAtoms 时，如果只访问了部分 atom 的值，
 * 未访问的 atom 状态变更是否会导致组件重新渲染
 */

/** 创建多个 atom 用于测试 */
const testAtoms = {
  /** 这个 atom 会被访问 */
  accessedAtom: atom(0),
  /** 这些 atom 不会被访问，但会被订阅 */
  unaccessedAtom1: atom(0),
  unaccessedAtom2: atom(0),
  unaccessedAtom3: atom(0),
}

const { useAtoms: useTestAtoms } = createUseAtoms(testAtoms)

/**
 * 测试组件：只访问 accessedAtom，不访问其他 atom
 */
const TestComponent = memo(() => {
  const atoms = useTestAtoms()
  const renderCountRef = useRef(0)

  /** 只访问 accessedAtom */
  const accessedValue = atoms.accessedAtom

  /** 在渲染时递增计数（不触发重新渲染，避免无限循环） */
  renderCountRef.current += 1
  const currentRenderCount = renderCountRef.current

  return (
    <div className="p-4 border border-border rounded-lg" style={ { backgroundColor: getColor() } }>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-textPrimary">
            测试组件渲染次数
          </span>
          <span
            className={ cn(
              'px-2 py-1 rounded text-sm font-bold',
              currentRenderCount > 1
                ? 'bg-danger/20 text-danger'
                : 'bg-success/20 text-success',
            ) }
          >
            { currentRenderCount }
          </span>
        </div>
        <div className="text-sm text-textSecondary">
          已访问的 atom 值:
          { ' ' }
          <strong>{ accessedValue }</strong>
        </div>
        <div className="text-xs text-textTertiary">
          最后渲染时间:
          { ' ' }
          { new Date().toLocaleTimeString() }
        </div>
        <div className="text-xs text-textTertiary">
          说明: 此组件只访问了 accessedAtom，未访问其他 atom
        </div>
      </div>
    </div>
  )
})

/**
 * 优化后的测试组件：使用 selectors 只订阅 accessedAtom
 */
const OptimizedTestComponent = memo(() => {
  /** 使用 selectors 参数，只订阅 accessedAtom */
  const atoms = useTestAtoms(['accessedAtom'])
  const renderCountRef = useRef(0)

  /** 只访问 accessedAtom */
  const accessedValue = atoms.accessedAtom

  /** 在渲染时递增计数（不触发重新渲染，避免无限循环） */
  renderCountRef.current += 1
  const currentRenderCount = renderCountRef.current

  return (
    <div className="p-4 border border-border rounded-lg" style={ { backgroundColor: getColor() } }>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-textPrimary">
            优化测试组件渲染次数（使用 selectors）
          </span>
          <span
            className={ cn(
              'px-2 py-1 rounded text-sm font-bold',
              currentRenderCount > 1
                ? 'bg-danger/20 text-danger'
                : 'bg-success/20 text-success',
            ) }
          >
            { currentRenderCount }
          </span>
        </div>
        <div className="text-sm text-textSecondary">
          已访问的 atom 值:
          { ' ' }
          <strong>{ accessedValue }</strong>
        </div>
        <div className="text-xs text-textTertiary">
          最后渲染时间:
          { ' ' }
          { new Date().toLocaleTimeString() }
        </div>
        <div className="text-xs text-textTertiary">
          说明: 此组件使用 selectors 只订阅了 accessedAtom，未订阅其他 atom
        </div>
      </div>
    </div>
  )
})

/**
 * 控制面板：用于修改各个 atom 的值
 */
const ControlPanel = memo(() => {
  const atoms = useTestAtoms()
  const [testResults, setTestResults] = useState<string[]>([])

  const runTest = () => {
    const results: string[] = []
    results.push('开始测试...')
    results.push('提示: 请观察上方测试组件的渲染次数变化')

    /** 测试 1: 修改已访问的 atom */
    setTimeout(() => {
      results.push('✅ 测试 1: 修改已访问的 atom (accessedAtom) - 应该导致重新渲染')
      atoms.setAccessedAtom(prev => prev + 1)
    }, 500)

    /** 测试 2: 修改未访问的 atom1 */
    setTimeout(() => {
      results.push('❓ 测试 2: 修改未访问的 atom (unaccessedAtom1) - 观察是否重新渲染')
      atoms.setUnaccessedAtom1(prev => prev + 1)
    }, 1500)

    /** 测试 3: 修改未访问的 atom2 */
    setTimeout(() => {
      results.push('❓ 测试 3: 修改未访问的 atom (unaccessedAtom2) - 观察是否重新渲染')
      atoms.setUnaccessedAtom2(prev => prev + 1)
    }, 2500)

    /** 测试 4: 修改未访问的 atom3 */
    setTimeout(() => {
      results.push('❓ 测试 4: 修改未访问的 atom (unaccessedAtom3) - 观察是否重新渲染')
      atoms.setUnaccessedAtom3(prev => prev + 1)
      results.push('测试完成！请查看上方测试组件的渲染次数')
    }, 3500)

    setTestResults(results)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-textSecondary mb-2">
            已访问的 Atom (accessedAtom)
          </label>
          <div className="flex gap-2">
            <Button
              onClick={ () => atoms.setAccessedAtom(prev => prev + 1) }
              variant="primary"
              size="sm"
            >
              +1
            </Button>
            <Button
              onClick={ () => atoms.setAccessedAtom(0) }
              variant="default"
              size="sm"
            >
              重置
            </Button>
          </div>
          <div className="mt-2 text-xs text-textTertiary">
            当前值:
            { ' ' }
            { atoms.accessedAtom }
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-textSecondary mb-2">
            未访问的 Atom 1 (unaccessedAtom1)
          </label>
          <div className="flex gap-2">
            <Button
              onClick={ () => atoms.setUnaccessedAtom1(prev => prev + 1) }
              variant="warning"
              size="sm"
            >
              +1
            </Button>
            <Button
              onClick={ () => atoms.setUnaccessedAtom1(0) }
              variant="default"
              size="sm"
            >
              重置
            </Button>
          </div>
          <div className="mt-2 text-xs text-textTertiary">
            当前值:
            { ' ' }
            { atoms.unaccessedAtom1 }
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-textSecondary mb-2">
            未访问的 Atom 2 (unaccessedAtom2)
          </label>
          <div className="flex gap-2">
            <Button
              onClick={ () => atoms.setUnaccessedAtom2(prev => prev + 1) }
              variant="warning"
              size="sm"
            >
              +1
            </Button>
            <Button
              onClick={ () => atoms.setUnaccessedAtom2(0) }
              variant="default"
              size="sm"
            >
              重置
            </Button>
          </div>
          <div className="mt-2 text-xs text-textTertiary">
            当前值:
            { ' ' }
            { atoms.unaccessedAtom2 }
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-textSecondary mb-2">
            未访问的 Atom 3 (unaccessedAtom3)
          </label>
          <div className="flex gap-2">
            <Button
              onClick={ () => atoms.setUnaccessedAtom3(prev => prev + 1) }
              variant="warning"
              size="sm"
            >
              +1
            </Button>
            <Button
              onClick={ () => atoms.setUnaccessedAtom3(0) }
              variant="default"
              size="sm"
            >
              重置
            </Button>
          </div>
          <div className="mt-2 text-xs text-textTertiary">
            当前值:
            { ' ' }
            { atoms.unaccessedAtom3 }
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <Button
          onClick={ runTest }
          variant="primary"
          block
        >
          运行完整测试
        </Button>

        { testResults.length > 0 && (
          <div className="mt-4 space-y-1">
            { testResults.map((result, index) => (
              <div
                key={ index }
                className="text-sm p-2 rounded bg-info/10 text-info"
              >
                { result }
              </div>
            )) }
          </div>
        ) }
      </div>
    </div>
  )
})

/**
 * 主演示组件
 */
export const RenderOptimizationDemo = memo(() => {
  return (
    <Card
      title="渲染优化测试 - createUseAtoms 依赖收集验证"
      variant="default"
      bordered
      shadow="md"
      padding="lg"
    >
      <div className="space-y-6">
        {/* 说明 */ }
        <div className="p-4 bg-info/10 rounded-lg border border-info/20">
          <h3 className="text-sm font-semibold text-textPrimary mb-2">
            测试目的
          </h3>
          <p className="text-sm text-textSecondary leading-relaxed">
            验证当使用
            { ' ' }
            <code className="px-1 py-0.5 bg-surface rounded text-xs">createUseAtoms</code>
            { ' ' }
            时，
            如果组件只访问了部分 atom 的值，当未访问的 atom 状态变更时，组件是否会重新渲染。
          </p>
          <p className="text-sm text-textSecondary leading-relaxed mt-2">
            <strong>预期行为：</strong>
            由于
            <code className="px-1 py-0.5 bg-surface rounded text-xs">createUseAtoms</code>
            { ' ' }
            在组件顶层调用了所有
            <code className="px-1 py-0.5 bg-surface rounded text-xs">useAtom</code>
            { ' ' }
            hooks，
            理论上所有 atom 都会被订阅，即使不访问其值，变更时也会导致组件重新渲染。
          </p>
          <p className="text-sm text-textSecondary leading-relaxed mt-2">
            <strong>解决方案：</strong>
            使用
            <code className="px-1 py-0.5 bg-surface rounded text-xs">selectors</code>
            { ' ' }
            参数，只订阅需要的 atom，避免订阅所有 atom。
          </p>
        </div>

        {/* 测试组件 */ }
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-textPrimary mb-3">
              测试组件 1：未使用 selectors（订阅所有 atom）
            </h3>
            <TestComponent />
          </div>
          <OptimizedTestComponent />
        </div>

        {/* 控制面板 */ }
        <div>
          <h3 className="text-sm font-semibold text-textPrimary mb-3">
            控制面板（修改各个 atom 的值）
          </h3>
          <ControlPanel />
        </div>

        {/* 观察说明 */ }
        <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
          <h3 className="text-sm font-semibold text-textPrimary mb-2">
            观察要点
          </h3>
          <ul className="text-sm text-textSecondary space-y-1 list-disc list-inside">
            <li>
              点击"已访问的 Atom"的按钮，组件应该重新渲染（渲染次数增加）
            </li>
            <li>
              点击"未访问的 Atom"的按钮，观察组件是否也会重新渲染
            </li>
            <li>
              如果未访问的 atom 变更也会导致重新渲染，说明所有 atom 都被订阅了
            </li>
            <li>
              如果未访问的 atom 变更不会导致重新渲染，说明 Proxy 机制起到了优化作用
            </li>
            <li>
              对比两个测试组件：未使用 selectors 的组件会订阅所有 atom，使用 selectors 的组件只订阅指定的 atom
            </li>
          </ul>
        </div>
      </div>
    </Card>
  )
})
