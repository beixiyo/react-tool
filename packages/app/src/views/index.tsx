import { motion } from 'framer-motion'
import { Landing } from '@/components/Landing'
import { PageSnapshots } from '@/components/PageSnapshots'
import { comps, pages } from '@/router'

/**
 * 页面截图展示 - 组件库画廊
 */
export default function Index() {
  return (
    <Landing className="overflow-auto">
      {/* 页面头部 */ }
      <motion.header
        initial={ { opacity: 0, y: -20 } }
        animate={ { opacity: 1, y: 0 } }
        transition={ { duration: 0.6 } }
        className="relative overflow-hidden shadow-xs"
      >
        <div className="relative mx-auto px-6 py-12 container">
          <motion.div
            initial={ { opacity: 0, y: 20 } }
            animate={ { opacity: 1, y: 0 } }
            transition={ { delay: 0.1, duration: 0.6 } }
            className="text-center"
          >
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-200 md:text-xl">
              探索丰富的 React 组件和页面示例，每个组件都经过精心设计，提供最佳的用户体验和开发体验
            </p>

            {/* 特性标签 */ }
            <motion.div
              initial={ { opacity: 0, y: 20 } }
              animate={ { opacity: 1, y: 0 } }
              transition={ { delay: 0.1, duration: 0.6 } }
              className="mb-8 flex flex-wrap justify-center gap-3"
            >
              { [
                '🎨 精美设计',
                '⚡ 高性能',
                '📱 响应式',
                '🌙 深色模式',
                '🎭 动画效果',
                '🔧 TypeScript',
              ].map((feature, index) => (
                <motion.span
                  key={ feature }
                  initial={ { opacity: 0, scale: 0.8 } }
                  animate={ { opacity: 1, scale: 1 } }
                  transition={ { delay: 0.15 + index * 0.05 } }
                  className="rounded-full bg-white/10 px-4 py-2 text-sm text-gray-200 font-medium shadow-xs backdrop-blur-xs"
                >
                  { feature }
                </motion.span>
              )) }
            </motion.div>

            {/* 统计信息 */ }
            <motion.div
              initial={ { opacity: 0, y: 20 } }
              animate={ { opacity: 1, y: 0 } }
              transition={ { delay: 0.12, duration: 0.6 } }
              className="mx-auto max-w-2xl flex flex-wrap items-center justify-between gap-6"
            >
              { [
                { label: '组件数量', value: `${comps.length}+` },
                { label: '页面示例', value: `${pages.length}+` },
                { label: '代码质量', value: 'A+' },
              ].map((stat, index) => (
                <motion.div
                  key={ stat.label }
                  initial={ { opacity: 0, y: 20 } }
                  animate={ { opacity: 1, y: 0 } }
                  transition={ { delay: 0.2 + index * 0.05 } }
                  className="text-center"
                >
                  <div className="text-2xl text-blue-400 font-bold md:text-3xl">
                    { stat.value }
                  </div>
                  <div className="text-sm text-gray-300">
                    { stat.label }
                  </div>
                </motion.div>
              )) }
            </motion.div>
          </motion.div>
        </div>
      </motion.header>

      {/* 主要内容区域 */ }
      <motion.main
        initial={ { opacity: 0 } }
        animate={ { opacity: 1 } }
        transition={ { delay: 0.1, duration: 0.6 } }
        className="mx-auto px-6 py-8 container"
      >
        <motion.div
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { delay: 0.15, duration: 0.6 } }
          className="mb-4 w-full flex flex-col items-center justify-center gap-3"
        >
          <h2 className="text-2xl text-gray-100 font-bold md:text-3xl">
            浏览所有组件和页面
          </h2>
          <p className="text-gray-300">
            所有页面预览截图都是前端实现
          </p>
        </motion.div>

        {/* 页面截图展示组件 */ }
        <PageSnapshots
          gridCols={ {
            sm: 1,
            md: 2,
            lg: 3,
            xl: 4,
          } }
          pagination={ {
            enabled: true,
            pageSize: 12, // 每页显示12个项目
          } }
        />
      </motion.main>

      {/* 页脚 */ }
      <motion.footer
        initial={ { opacity: 0 } }
        animate={ { opacity: 1 } }
        transition={ { delay: 0.2, duration: 0.6 } }
        className="mt-16 border-t border-gray-700"
      >
        <div className="mx-auto px-6 py-8 container">
          <div className="text-center text-gray-300">
            <p className="mb-2">
              基于 React + TypeScript + Tailwind CSS + Framer Motion 构建
            </p>
            <p className="text-sm">
              © React 组件工具库. 用心打造每一个组件
            </p>
          </div>
        </div>
      </motion.footer>

    </Landing>
  )
}
