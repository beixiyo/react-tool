import type { RouteObject } from 'react-router'
import { Message } from 'comps'
import { redirect } from 'react-router'

/**
 * 提供测试 redirect 的路由配置
 */
export const testRedirectRoutes: RouteObject[] = [
  {
    path: '/test/redirect',
    Component: TestRedirectPlaceholder,
    middleware: [(_args, next) => {
      const canLogin = checkLogin()

      if (!canLogin) {
        Message.error('您尚未登录，请先登录')
        throw redirect('/')
      }
      Message.success('您已登录，欢迎使用')

      return next()
    }],
  },
]

/**
 * 该组件用于占位，真正逻辑在中间件中完成重定向
 */
function TestRedirectPlaceholder() {
  return <div className="h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">TestRedirectPlaceholder</h1>
  </div>
}

function checkLogin() {
  return Math.random() > 0.5
}
