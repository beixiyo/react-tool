'use client'

import type { KeepAliveProps } from './type'
import { memo, Suspense, useContext, useEffect, useRef, useState } from 'react'
import { KeepAliveContext, KeepAliveKeyContext } from './context'

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
  forceRender = false,
}: KeepAliveProps & { uniqueKey?: keyof any }) => {
  const { findEffect } = useContext(KeepAliveContext)
  const [renderKey, setRenderKey] = useState(0)
  /**
   * 触发激活 / 失活钩子
   *
   * 用「激活时执行 + cleanup 失活」的平衡写法，使 deactive 在两种情况都会触发：
   * ① active 由 true → false（切走）；② 组件卸载
   */
  useEffect(() => {
    if (!active)
      return

    findEffect(key).activeEffect.forEach(fn => fn())
    if (forceRender) {
      setRenderKey(v => v + 1)
    }

    return () => {
      findEffect(key).deactiveEffect.forEach(fn => fn())
    }
  }, [active, findEffect, key, forceRender])

  return (
    <Suspense fallback={ null } key={ renderKey }>
      <KeepAliveKeyContext.Provider value={ key }>
        <Wrapper active={ active }>
          { children }
        </Wrapper>
      </KeepAliveKeyContext.Provider>
    </Suspense>
  )
})
