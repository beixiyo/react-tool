import { createContext, useContext } from 'react'
import type { BottomBarContextValue } from '../../types'

export const BottomBarContext = createContext<BottomBarContextValue | null>(null)

export function useBottomBarState() {
  const state = useContext(BottomBarContext)

  if (!state) throw new Error('BottomBar parts must be rendered inside <BottomBar>')

  return state
}
