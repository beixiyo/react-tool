import { onMounted } from 'hooks'
import { use } from 'react'
import { useLocation } from 'react-router'
import { KeepAliveRouteCtx } from './KeepAliveRouteCtx'

/**
 * 注册路由激活回调
 */
export function useRouteActive(callback: VoidFunction) {
  const { pathname } = useLocation()
  const { registerActiveEffect, delActiveEffect } = use(KeepAliveRouteCtx)

  onMounted(() => {
    registerActiveEffect?.(pathname, callback)

    return () => {
      delActiveEffect(pathname)
    }
  })
}

/**
 * 注册路由失活回调
 */
export function useRouteDeactive(callback: VoidFunction) {
  const { pathname } = useLocation()
  const { registerDeactiveEffect, delDeactiveEffect } = use(KeepAliveRouteCtx)

  onMounted(() => {
    registerDeactiveEffect?.(pathname, callback)

    return () => {
      delDeactiveEffect(pathname)
    }
  })
}
