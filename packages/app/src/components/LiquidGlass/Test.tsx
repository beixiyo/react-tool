import {
  LiquidGlassBackground,
  LiquidGlassButton,
  LiquidGlassDock,
  LiquidGlassMenu,
} from '.'

function App() {
  /** 菜单项 */
  const menuItems = ['New file', 'Open file', 'Settings', 'Repository']

  /** 应用程序列表 */
  const dockApps = [
    {
      name: 'Finder',
      icon: 'https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/finder.png',
    },
    {
      name: 'Maps',
      icon: 'https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/map.png',
    },
    {
      name: 'Messages',
      icon: 'https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/messages.png',
    },
    {
      name: 'Notes',
      icon: 'https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/notes.png',
    },
    {
      name: 'Safari',
      icon: 'https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/safari.png',
    },
    {
      name: 'Books',
      icon: 'https://raw.githubusercontent.com/lucasromerodb/liquid-glass-effect-macos/refs/heads/main/assets/books.png',
    },
  ]

  const handleMenuItemClick = (item: string, index: number) => {
    console.log(`点击了菜单项: ${item}, 索引: ${index}`)
  }

  const handleAppClick = (app: { name: string, icon: string }, index: number) => {
    console.log(`点击了应用: ${app.name}, 索引: ${index}`)
  }

  return (
    <LiquidGlassBackground>
      <div className="flex flex-col items-end gap-6">
        {/* 菜单组件 */ }
        <LiquidGlassMenu
          items={ menuItems }
          onItemClick={ handleMenuItemClick }
        />

        {/* 工具栏组件 */ }
        <LiquidGlassDock
          apps={ dockApps }
          onAppClick={ handleAppClick }
          href="https://x.com/lucasromerodb"
        />

        {/* 按钮组件 */ }
        <LiquidGlassButton href="https://aerolab.co">
          Button
        </LiquidGlassButton>
      </div>
    </LiquidGlassBackground>
  )
}

export default App
