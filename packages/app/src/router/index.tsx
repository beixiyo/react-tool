import { genRoutes } from '@jl-org/vite-auto-route'
import { createBrowserRouter, type RouteObject } from '@jl-org/react-router'
import Index from '@/views'
import { lazy } from 'react'

export const pages = genRoutes({
  globComponentsImport: () => import.meta.glob('/src/views/**/page.tsx'),
  indexFileName: '/page.tsx',
  routerPathFolder: '/src/views',
  pathPrefix: /^\/src\/views/,
  /** 使用 customizeRoute 自定义路由项，例如启用懒加载 */
  customizeRoute: (_context) => {
    return (route) => {
      const customizedRoute: RouteObject = {
        ...route,
        component: lazy(route.component),
      }

      return customizedRoute
    }
  },
  transformRoute: (route) => {
    return ['/'].includes(route.path)
      ? null
      : route
  },
  extendRoutes: (routes) => {
    routes.push({
      path: '/',
      component: Index,
    } as any)
    return routes
  },
})

export const comps = genRoutes({
  globComponentsImport: () => import.meta.glob('/../comps/src/components/**/Test.tsx'),
  indexFileName: '/Test.tsx',
  routerPathFolder: '../comps/src/components',
  pathPrefix: /^\.\.\/comps\/src\/components/,
  customizeRoute: (_context) => {
    return (route) => {
      const customizedRoute: RouteObject = {
        ...route,
        component: lazy(route.component),
      }

      return customizedRoute
    }
  },
})

export const components = genRoutes({
  globComponentsImport: () => import.meta.glob('/src/components/**/Test.tsx'),
  indexFileName: '/Test.tsx',
  routerPathFolder: '/src/components',
  pathPrefix: /^\/src\/components/,
  customizeRoute: (_context) => {
    return (route) => {
      const customizedRoute: RouteObject = {
        ...route,
        component: lazy(route.component),
      }

      return customizedRoute
    }
  },
})

export const router = createBrowserRouter({
  routes: [
    ...pages,
    ...comps,
    ...components,
  ],
  options: {
    // cache: {} // 自定义缓存页面等...
    beforeEach: async (ctx, from, next) => {
      await next()
    }
  },
})
