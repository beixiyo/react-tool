import { useState } from 'react'
import { SwipeNavi } from './index'

export default function SwipeNaviTest() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const pages = [
    {
      title: '页面 1',
      color: 'bg-gradient-to-br from-blue-500 to-purple-600',
      content: '这是第一个页面，展示蓝色到紫色的渐变背景。',
    },
    {
      title: '页面 2',
      color: 'bg-gradient-to-br from-green-500 to-teal-600',
      content: '这是第二个页面，展示绿色到青色的渐变背景。',
    },
    {
      title: '页面 3',
      color: 'bg-gradient-to-br from-orange-500 to-red-600',
      content: '这是第三个页面，展示橙色到红色的渐变背景。',
    },
    {
      title: '页面 4',
      color: 'bg-gradient-to-br from-pink-500 to-rose-600',
      content: '这是第四个页面，展示粉色到玫瑰色的渐变背景。',
    },
    {
      title: '页面 5',
      color: 'bg-gradient-to-br from-indigo-500 to-blue-600',
      content: '这是第五个页面，展示靛蓝到蓝色的渐变背景。',
    },
  ]

  return (
    <div className="w-full h-screen bg-gray-100 dark:bg-gray-900">
      <div className="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          SwipeNavi 测试页面
        </h1>
      </div>

      <div className="relative h-[calc(100vh-4rem)]">
        <SwipeNavi
          className="w-full h-full"
          onIndexChange={ setCurrentIndex }
          initialIndex={ 0 }
          threshold={ 0.12 }
          showButtons={ true }
          showIndicator={ true }
        >
          { pages.map((page, index) => (
            <div
              key={ index }
              className={ `w-full h-full ${page.color} flex flex-col items-center justify-center text-white p-8` }
            >
              <h2 className="text-4xl font-bold mb-6 text-center">
                { page.title }
              </h2>
              <p className="text-xl text-center max-w-md leading-relaxed">
                { page.content }
              </p>
              <div className="mt-8 text-sm opacity-80">
                当前页面索引:
                { ' ' }
                { index + 1 }
                { ' ' }
                /
                { ' ' }
                { pages.length }
              </div>
            </div>
          )) }
        </SwipeNavi>
      </div>

      <div className="absolute top-20 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
          操作说明
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• 鼠标拖拽或触摸滑动切换页面</li>
          <li>• 拖拽距离超过 1/4 屏幕宽度时切换</li>
          <li>• 点击两侧按钮切换页面</li>
          <li>• 底部指示器显示当前页面位置</li>
        </ul>
      </div>

      <div className="absolute top-20 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
          当前状态
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <div>
            当前页面:
            { currentIndex + 1 }
          </div>
          <div>
            总页面数:
            { pages.length }
          </div>
          <div>
            页面标题:
            { pages[currentIndex]?.title }
          </div>
        </div>
      </div>
    </div>
  )
}
