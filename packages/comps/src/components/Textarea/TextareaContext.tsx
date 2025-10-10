'use client'

import { createContext, use } from 'react'

export interface TextareaContextValue {
  id?: string
  disabled?: boolean
  required?: boolean
  error?: boolean
  errorMessage?: string
  isFocused?: boolean
  value: string
  maxLength?: number
}

const TextareaContext = createContext<TextareaContextValue | undefined>(undefined)

export function TextareaProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: TextareaContextValue
}) {
  return <TextareaContext value={ value }>{children}</TextareaContext>
}

export function useTextarea() {
  const context = use(TextareaContext)
  if (!context) {
    throw new Error('useTextarea must be used within a TextareaProvider')
  }
  return context
}
