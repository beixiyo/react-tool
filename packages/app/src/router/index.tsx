import { genRoutes } from '@jl-org/vite-auto-route'
import { createBrowserRouter } from 'react-router'
import Index from '@/views'

export const pages = genRoutes({
  globComponentsImport: () => import.meta.glob('/src/views/**/page.tsx'),
  indexFileName: '/page.tsx',
  routerPathFolder: '/src/views',
  pathPrefix: /^\/src\/views/,
  customizeRoute: context => (route) => {
    return {
      path: route.path,
      Component: lazy(route.component),
      // ... anything you want
    }
  },
  extendRoutes: (routes) => {
    routes.push({
      path: '/',
      Component: Index,
    } as any)
    return routes
  },
})

export const comps = genRoutes({
  globComponentsImport: () => import.meta.glob('/../comps/src/components/**/Test.tsx'),
  indexFileName: '/Test.tsx',
  routerPathFolder: '../comps/src/components',
  pathPrefix: /^\.\.\/comps\/src\/components/,
  customizeRoute: context => (route) => {
    return {
      path: route.path,
      Component: lazy(route.component),
      // ... anything you want
    }
  },
})

export const components = genRoutes({
  globComponentsImport: () => import.meta.glob('/src/components/**/Test.tsx'),
  indexFileName: '/Test.tsx',
  routerPathFolder: '/src/components',
  pathPrefix: /^\/src\/components/,
  customizeRoute: context => (route) => {
    return {
      path: route.path,
      Component: lazy(route.component),
      // ... anything you want
    }
  },
})

export const router = createBrowserRouter([
  ...pages,
  ...comps,
  ...components,
])
