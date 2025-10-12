'use client'

import { useBindWinEvent } from 'hooks'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from 'utils'
import { Button } from '../Button'
import { Modal } from '../Modal'
import { ThemeToggle } from '../ThemeToggle'

const SEP = { path: '/', name: '' }

const pathArr = [
  { path: '/aiSnake', name: '机器学习贪吃蛇' },
  { path: '/perlinNoise', name: '柏林噪声' },

  SEP,

  { path: '/aurora', name: 'Aurora' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/card', name: 'Card' },
  { path: '/flipItem', name: 'FlipItem' },

  SEP,

  { path: '/zoomCvs', name: 'zoomCanvas' },
  { path: '/editor', name: 'Editor' },
  { path: '/canvasComposite', name: 'canvas 组合模式' },
  { path: '/cutoutImg', name: '抠图' },
  { path: '/smartSelection', name: '智能选取图片' },

  SEP,

  { path: '/virtualWaterfall', name: '虚拟瀑布流' },
  // { path: '/virtualWaterfallHook', name: '虚拟瀑布流 Hook 版本' },
  { path: '/virtualScroll', name: '虚拟滚动列表' },
  { path: '/dyVirtualScroll', name: '动态高度虚拟滚动列表' },
  { path: '/infiniteScroll', name: '无限滚动加载' },
  { path: '/seamlessScroll', name: '无缝滚动' },
  { path: '/scrollAnimate', name: '滚动动画' },

  SEP,

  { path: '/i18n', name: '国际化' },
  { path: '/lazyImg', name: '懒加载图片' },
  { path: '/tourGuide', name: '用户引导' },
  { path: '/popover', name: 'Popover' },

  SEP,

  { path: '/select', name: 'Select' },
  { path: '/dropdown', name: 'Dropdown' },
  { path: '/drawer', name: 'Drawer' },

  SEP,

  { path: '/steps', name: 'Steps' },
  { path: '/thinkingStep', name: '模仿 Grok 思考过程' },
  { path: '/autoScrollAnimate', name: '自动滚动动画' },

  SEP,

  { path: '/sidebar', name: 'Sidebar' },
  { path: '/searchBar', name: 'SearchBar' },
  { path: '/navBar', name: 'NavBar' },

  SEP,

  { path: '/textReveal', name: '文字渐出' },
  { path: '/interactiveEmoji', name: 'Emoji动画' },
  { path: '/disCount', name: '折扣' },
  { path: '/typewriter', name: '打字机' },

  SEP,

  { path: '/glowClock', name: 'canvas 渐变时钟' },
  { path: '/bgPaths', name: '动态线段' },
  { path: '/moveable', name: '缩放拖动' },
  { path: '/skeleton', name: '骨架屏' },

  SEP,

  { path: '/carousel3D', name: 'Carousel3D' },
  { path: '/chat', name: '聊天机器人' },

  SEP,

  { path: '/useGetStateTest', name: 'useGetStateTest' },
  { path: '/keepAliveTest', name: 'keepAliveTest' },

  SEP,

  { path: '/motionPrinciples', name: 'Motion原理' },
  { path: '/starport', name: 'starport' },
]

export function Menu(
  {
    className,
    style,
  }: MenuProps,
) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  useBindWinEvent('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && e.altKey) {
      setIsOpen(true)
    }
  })

  return (
    <div
      className={ cn(
        `flex h-full flex-col gap-4
      bg-black text-white p-3 overflow-y-auto overflow-x-hidden`,
        className,
      ) }
      style={ style }
    >

      <Button
        onClick={ () => Modal.info({
          titleText: 'Hello',
          children: <p className="h-[20vh]">Hello</p>,
        }) }
      >
        OpenModal
      </Button>

      <ThemeToggle />

      { pathArr.map((item, index) => (
        <NavLink
          key={ index }
          to={ item.path }
          className="transition-all duration-300 !hover:text-fuchsia-300"
          style={ {
            color: location.pathname === item.path
              ? '#f0abfc'
              : 'white',
          } }
        >
          { item.name }
        </NavLink>
      )) }

      <Modal
        isOpen={ isOpen }
        onClose={ () => setIsOpen(false) }
        onOk={ () => setIsOpen(false) }
      >
        <p className="h-[20vh]">Hello</p>
      </Modal>

    </div>
  )
}
Menu.displayName = 'Index'

export interface MenuProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}
