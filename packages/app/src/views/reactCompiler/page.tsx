/**
 * React Compiler 重新渲染演示主页面
 * 使用 getColor 函数显示组件重新渲染，展示编译器优化效果
 */

import { GithubSourceLink } from '@/components/GithubSourceLink'
import { ItemCardDemo } from './ItemCardDemo'
import { UserCardDemo } from './UserCardDemo'

function ReactCompilerDemo() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text mb-4">
            React Compiler 重新渲染演示
          </h1>
          <p className="text-lg text-text2 max-w-4xl mx-auto">
            使用 getColor 函数显示组件重新渲染。每次重新渲染时，背景色会发生变化。
            在 React Compiler 优化下，某些组件不会重新渲染，背景色保持不变。
          </p>
        </div>

        <div className="space-y-8">
          <UserCardDemo />
          <ItemCardDemo />
        </div>

        <div className="p-6 bg-info/10 border border-info/20 rounded-lg">
          <h3 className="text-lg font-semibold text-info mb-2">
            🔍 观察要点
          </h3>
          <ul className="text-sm text-info space-y-1">
            <li>
              •
              <strong>背景色变化</strong>
              ：表示组件重新渲染
            </li>
            <li>
              •
              <strong>背景色不变</strong>
              ：表示组件被优化，没有重新渲染
            </li>
          </ul>
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default ReactCompilerDemo
