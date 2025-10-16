import type { RouteObject } from 'react-router-dom'

/**
 * @deprecated
 * 旧的手动管理路由，已废弃
 */
export const routes = genRoutes([
  { path: '/', element: <Navigate to="/aiSnake" replace /> },
])

export type RoutePath = typeof routes[number]['path']

export type RouteItem<T extends string>
  = Omit<RouteObject, 'path'>
    & {
      path: T
    }

function genRoutes<const T extends string>(routes: RouteItem<T>[]) {
  return routes
}
