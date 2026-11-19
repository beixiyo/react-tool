import { memo, Suspense } from 'react'
import { Loading } from '../Loading'
import type { CustomSuspenseProps } from './types'

/**
 * 带默认 Loading 占位的 Suspense，lazy 加载的子树才有过渡效果
 */
export const CustomSuspense = memo(({
  children,
  fallback = <Loading loading />,
}: CustomSuspenseProps) => {
  return (
    <Suspense fallback={ fallback }>
      { children }
    </Suspense>
  )
})

CustomSuspense.displayName = 'CustomSuspense'
