'use client'

import type { ReactNode } from 'react'
import type { PieContextValue } from './types'
import { createContext, use } from 'react'

/** 默认扇区色（设计 Token，与 chart-context 语义一致） */
export const defaultPieColors = [
  'rgb(var(--systemBlue))',
  'rgb(var(--systemGreen))',
  'rgb(var(--systemOrange))',
  'rgb(var(--systemPurple))',
  'rgb(var(--systemYellow))',
] as const

const PieContext = createContext<PieContextValue | null>(null)

export function PieProvider({
  children,
  value,
}: {
  children: ReactNode
  value: PieContextValue
}) {
  return (
    <PieContext value={ value }>
      { children }
    </PieContext>
  )
}

export function usePie(): PieContextValue {
  const context = use(PieContext)
  if (!context) {
    throw new Error(
      'usePie 必须在 PieChart（PieProvider）内使用',
    )
  }
  return context
}
