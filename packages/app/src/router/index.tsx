import type { ComponentType } from 'react'
import type { RouteObject } from 'react-router'
import type { FileSystemRoute } from '@jl-org/vite-auto-route'
import type { RoutePath } from './routes'
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import Index from '@/views'
import { genRoutes } from '@jl-org/vite-auto-route'
import { testRedirectRoutes } from './testRedirect'

export const pages = genRoutes({
  globComponentsImport: () => import.meta.glob('/src/views/**/page.tsx'),
  indexFileName: '/page.tsx',
  routerPathFolder: '/src/views',
  pathPrefix: /^\/src\/views/,
})

export const components = genRoutes({
  globComponentsImport: () => import.meta.glob('/src/components/**/Test.tsx'),
  indexFileName: '/Test.tsx',
  routerPathFolder: '/src/components',
  pathPrefix: /^\/src\/components/,
})

export const comps = genRoutes({
  globComponentsImport: () => import.meta.glob('/../comps/src/components/**/Test.tsx'),
  indexFileName: '/Test.tsx',
  routerPathFolder: '../comps/src/components',
  pathPrefix: /^\.\.\/comps\/src\/components/,
})

/** 生成所有路由 */
const allRoutes = [
  ...pages,
  ...components,
  ...comps,
]

/** 分离首页和其他路由 */
const otherRoutes = allRoutes.filter(item => item.path !== '/')

console.log(otherRoutes)

export const router = createBrowserRouter([
  /** 首页路由 - 独立路由 */
  {
    path: '/',
    Component: Index,
  },
  ...deepToLazy(otherRoutes),

  ...testRedirectRoutes,
])

/**
 * 带有类型推断的路由跳转
 * ### 注意会导致热重载失败
 */
export function routerTo(path: RoutePath, opts?: Parameters<typeof router['navigate']>[1]) {
  router.navigate(path, opts)
}

function deepToLazy(routes: FileSystemRoute[]): RouteObject[] {
  return routes.map((route) => {
    return {
      path: route.path,
      Component: lazy(async () => {
        const mod = await route.component()
        if (mod && typeof mod === 'object' && 'default' in mod)
          return { default: (mod as { default: ComponentType<any> }).default }
        return { default: mod as ComponentType<any> }
      }),
      children: route.children.length > 0
        ? deepToLazy(route.children)
        : undefined,
    }
  })
}
