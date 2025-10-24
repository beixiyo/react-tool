/**
 * 基础组件自动 memo 优化演示
 * 展示 React Compiler 如何自动为组件添加 React.memo
 */

import type { User } from './types'
import { getColor } from '@jl-org/tool'
import { useState } from 'react'

/**
 * 这个组件会被 React Compiler 自动优化
 * 当父组件状态改变时，如果 props 没有变化，这个组件不会重新渲染
 */
function OptimizedUserCard({ user, onEdit }: { user: User, onEdit: (id: string) => void }) {
  const bgColor = getColor()

  return (
    <div
      className="p-4 border borderStrong rounded-lg shadow-sm transition-colors duration-200 toning-blue"
      style={ { backgroundColor: bgColor } }
    >
      <h3 className="text-lg font-semibold textPrimary">{user.name}</h3>
      <p className="textSecondary">{user.email}</p>
      <button
        onClick={ () => onEdit(user.id) }
        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        编辑
      </button>
    </div>
  )
}

/**
 * 演示组件：点击按钮时，只有相关的 UserCard 会重新渲染
 */
export function UserCardDemo() {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: '张三', email: 'zhangsan@example.com' },
    { id: '2', name: '李四', email: 'lisi@example.com' },
    { id: '3', name: '王五', email: 'wangwu@example.com' },
  ])
  const [counter, setCounter] = useState(0)

  /** 这个函数会被编译器自动优化 */
  const handleEdit = (id: string) => {
    console.log('编辑用户:', id)
  }

  /** 这个函数会被编译器自动优化 */
  const handleAddUser = () => {
    const newUser: User = {
      id: Date.now().toString(),
      name: `用户 ${users.length + 1}`,
      email: `user${users.length + 1}@example.com`,
    }
    setUsers(prev => [...prev, newUser])
  }

  return (
    <div className="p-6 bg-background border borderStrong rounded-lg">
      <h2 className="text-xl font-bold mb-4 textPrimary">示例 1：基础组件自动 memo 优化</h2>
      <p className="text-sm textSecondary mb-4">
        点击"增加计数器"按钮时，UserCard 组件不会重新渲染（背景色不变），
        因为它们的 props 没有变化。只有点击"添加用户"时，相关的 UserCard 才会重新渲染。
      </p>

      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <span className="text-lg textPrimary">
            计数器:
            {counter}
          </span>
          <button
            onClick={ () => setCounter(prev => prev + 1) }
            className="px-4 py-2 bg-danger text-white rounded hover:opacity-80 transition-opacity"
          >
            增加计数器
          </button>
          <button
            onClick={ handleAddUser }
            className="px-4 py-2 bg-success text-white rounded hover:opacity-80 transition-opacity"
          >
            添加用户
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {users.map(user => (
            <OptimizedUserCard key={ user.id } user={ user } onEdit={ handleEdit } />
          ))}
        </div>
      </div>
    </div>
  )
}
