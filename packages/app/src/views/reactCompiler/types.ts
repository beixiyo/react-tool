/**
 * React Compiler 演示页面的类型定义
 */

export interface User {
  id: string
  name: string
  email: string
}

export interface Item {
  id: string
  value: number
  label: string
}

export interface Data {
  id: string
  title: string
  value: number
}

export interface OptimizedCardProps {
  className?: string
  children: React.ReactNode
}
