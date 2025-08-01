import { createProxy } from '@/hooks'
import { devtools } from 'valtio/utils'

export const globalStore = createProxy({
  loading: false,
})

/**
 * Redux DevTools
 */
devtools(globalStore, { name: 'globalStore', enabled: true })
