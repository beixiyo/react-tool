import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { createUseAtoms } from '../views/jotaiTest/jotaiTool'

export const { useAtoms, useReset } = createUseAtoms({
  loading: atom(false),
  count: atomWithReset(0),
})
