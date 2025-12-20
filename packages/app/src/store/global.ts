import { createUseAtoms } from 'hooks'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

export const { useAtoms, useReset } = createUseAtoms({
  loading: atom(false),
  count: atomWithReset(0),
})
