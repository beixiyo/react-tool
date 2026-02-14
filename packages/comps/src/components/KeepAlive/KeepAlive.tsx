'use client'

import type { KeepAliveProps } from './type'
import { memo, Suspense, use, useEffect, useRef, useState } from 'react'
import { KeepAliveContext } from './context'

const Wrapper = memo<KeepAliveProps>(({ children, active }) => {
  const resolveRef = useRef<Function | null>(null)

  if (active) {
    resolveRef.current?.()
    resolveRef.current = null
  }
  else {
    throw new Promise((resolve) => {
      resolveRef.current = resolve
    })
  }

  return children
})

/**
 * 利用 Suspense 实现的 KeepAlive 组件
 * 当 active 为 false 时，抛异常，触发 Suspense 的 fallback
 * 当 active 为 true 时，resolve 异常，触发 Suspense 的正常渲染
 */
export const KeepAlive = memo(({
  uniqueKey: key,
  active,
  children,
}: KeepAliveProps & { uniqueKey?: keyof any }) => {
  const { findEffect } = use(KeepAliveContext)
  const [renderKey, setRenderKey] = useState(0)
  /**
   * 触发钩子
   */
  useEffect(() => {
    const { activeEffect, deactiveEffect } = findEffect(key)

    if (active) {
      activeEffect.forEach(fn => fn())
      /**
       * 强制重新渲染以重置动画状态
       * 解决 framer-motion 等动画库在 Suspense 恢复后状态不重置的问题
       */
      setRenderKey(v => v + 1)
    }
    else {
      deactiveEffect.forEach(fn => fn())
    }
  }, [active, findEffect, key])

  return <Suspense fallback={ null } key={ renderKey }>
    <Wrapper active={ active }>
      { children }
    </Wrapper>
  </Suspense>
})
