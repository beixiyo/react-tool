import { memo } from 'react'
import { KeepAliveRouteCtx, KeepAliveRouteCtxVal } from './KeepAliveRouteCtx'

export const KeepAliveProvider = memo<KeepAliveProviderProps>((
  {
    children,
  },
) => {
  return <KeepAliveRouteCtx
    value={ KeepAliveRouteCtxVal }
  >
    { children }
  </KeepAliveRouteCtx>
})
KeepAliveProvider.displayName = 'KeepAliveProvider'

export interface KeepAliveProviderProps {
  children?: React.ReactNode
}
