'use client'

import type {
  LegendContextValue,
  LegendItemContextValue,
} from './types'
import { createContext, use } from 'react'

const LegendContext = createContext<LegendContextValue | null>(null)
const LegendItemContext = createContext<LegendItemContextValue | null>(null)

export function LegendProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: LegendContextValue
}) {
  return (
    <LegendContext value={ value }>
      { children }
    </LegendContext>
  )
}

export function LegendItemProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: LegendItemContextValue
}) {
  return (
    <LegendItemContext value={ value }>
      { children }
    </LegendItemContext>
  )
}

export function useLegend(): LegendContextValue {
  const ctx = use(LegendContext)
  if (!ctx)
    throw new Error('useLegend 必须在 <Legend> 内使用')
  return ctx
}

export function useLegendItem(): LegendItemContextValue {
  const ctx = use(LegendItemContext)
  if (!ctx)
    throw new Error('useLegendItem 必须在 Legend 的某项模板内使用')
  return ctx
}
