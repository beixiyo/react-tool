'use client'

import { Bell, Home, Settings, User } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { cn } from 'utils'
import { FlipItem } from '.'

export default function FlipTestPage() {
  const [activeItem, setActiveItem] = useState('#home')

  const menuItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Home',
      href: '#home',
      gradient: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)',
      className: 'transition-all duration-300 group-hover:text-blue-500 group-hover:fill-blue-500',
      activeClassName: 'transition-all duration-300 text-blue-500 fill-blue-500',
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: 'Notifications',
      href: '#notifications',
      gradient: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)',
      className: 'transition-all duration-300 group-hover:text-orange-500 group-hover:fill-orange-500',
      activeClassName: 'transition-all duration-300 text-orange-500 fill-orange-500',
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      href: '#settings',
      gradient: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)',
      className: 'transition-all duration-300 group-hover:text-green-500 group-hover:fill-green-500',
      activeClassName: 'transition-all duration-300 text-green-500 fill-green-500',
    },
    {
      icon: <User className="h-5 w-5" />,
      label: 'Profile',
      href: '#profile',
      gradient: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)',
      className: 'transition-all duration-300 group-hover:text-red-500 group-hover:fill-red-500',
      activeClassName: 'transition-all duration-300 text-red-500 fill-red-500',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="mb-4 font-bold">FlipItem 组件测试</h1>

        <div className="mb-12 w-full">
          <h2 className="mb-4">导航菜单示例</h2>
          <motion.nav
            className="from-background/80 to-background/40 relative overflow-hidden border border-border/40 rounded-2xl bg-linear-to-b p-2 shadow-card backdrop-blur-lg"
            initial="initial"
            whileHover="hover"
          >
            <motion.div
              variants={ {
                initial: { opacity: 0 },
                hover: {
                  opacity: 1,
                  transition: {
                    duration: 0.5,
                    ease: [0.4, 0, 0.2, 1],
                  },
                },
              } }
            />
            <ul className="relative z-10 flex items-center gap-2">
              { menuItems.map(item => (
                <li key={ item.label } className="group relative">
                  <FlipItem
                    frontContent={
                      <div className={ cn(
                        'flex items-center gap-2',
                        item.className,
                      ) }>
                        <span className="text-foreground transition-colors duration-300">
                          { item.icon }
                        </span>
                        <span className="text-muted-foreground group-hover:text-foreground">{ item.label }</span>
                      </div>
                    }
                    backContent={
                      <div className={ cn(
                        'flex items-center gap-2',
                        item.className,
                      ) }>
                        <span className="text-foreground transition-colors duration-300">
                          { item.icon }
                        </span>
                        <span className="text-muted-foreground group-hover:text-foreground">{ item.label }</span>
                      </div>
                    }
                    gradient={ item.gradient }
                    isActive={ activeItem === item.href }
                    className={ activeItem === item.href
                      ? item.activeClassName
                      : '' }
                  >
                    <a
                      href={ item.href }
                      className="absolute inset-0 z-20"
                      onClick={ (e) => {
                        e.preventDefault()
                        setActiveItem(item.href)
                      } } />
                  </FlipItem>
                </li>
              )) }
            </ul>
          </motion.nav>
          <div className="mt-4 text-center">
            <p>
              当前激活项:
              { ' ' }
              { activeItem }
            </p>
          </div>
        </div>

        <div className="max-w-md w-full">
          <h2 className="mb-4">卡片示例</h2>
          <div className="grid grid-cols-2 gap-4">
            { menuItems.slice(0, 2).map((item, index) => (
              <FlipItem
                key={ index }
                frontContent={
                  <div className={ cn(
                    'flex flex-col items-center justify-center p-4',
                    item.className,
                  ) }>
                    <div className="mb-2 h-8 w-8">{ item.icon }</div>
                    <span className="text-center font-medium">{ item.label }</span>
                  </div>
                }
                backContent={
                  <div className={ cn(
                    'flex flex-col items-center justify-center p-4',
                    item.className,
                  ) }>
                    <span className="text-center font-medium">
                      查看
                      { item.label }
                    </span>
                  </div>
                }
                gradient={ item.gradient }
              >
                <button className="absolute inset-0 z-20" onClick={ () => alert(`点击了${item.label}`) } />
              </FlipItem>
            )) }
          </div>
        </div>
      </div>
    </div>
  )
}
