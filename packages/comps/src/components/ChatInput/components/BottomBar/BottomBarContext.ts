import type { BottomBarLatestState } from '../../types'
import { createContext, useContext } from 'react'

export const BottomBarContext = createContext<BottomBarLatestState | null>(null)

export function useBottomBarState() {
  const state = useContext(BottomBarContext)

  if (!state)
    throw new Error('BottomBar parts must be rendered inside <BottomBar>')

  return state
}
