'use client'

import type { ContextMenuRef } from './ContextMenu'
import { Copy, Star, Trash2 } from 'lucide-react'
import { memo, useRef, useState } from 'react'
import { cn } from 'utils'
import { Button } from '../Button'
import { ThemeToggle } from '../ThemeToggle'
import { ContextMenu } from './ContextMenu'

/**
 * ContextMenu 测试页面
 */
export default function Test() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-8 text-text">
            右键菜单测试
          </h1>
          <ThemeToggle />
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-background2 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-4 text-text">
              使用说明
            </h2>
            <p className="text-text2">
              在页面上任意位置右键点击，会弹出菜单。菜单会根据鼠标位置自动调整，确保始终可见。
            </p>
          </div>

          <UncontrolledModeTest />

          <ControlledModeTest />
        </div>
      </div>
    </div>
  )
}

/**
 * 菜单项组件
 */
const MenuItem = memo<{
  icon?: React.ReactNode
  label: string
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}>(({ icon, label, children, onClick, disabled, loading }) => {
  return (
    <div className="first:rounded-t-lg last:rounded-b-lg">
      <Button
        variant="ghost"
        rounded="xl"
        block
        leftIcon={ icon }
        onClick={ onClick }
        disabled={ disabled }
        loading={ loading }
        className="flex justify-start gap-3"
      >
        { label }
      </Button>

      { children && (
        <div className="px-3">
          { children }
        </div>
      ) }
    </div>
  )
})

const ColorDot = memo<{
  color: string
  onClick?: () => void
}>(({ color, onClick }) => {
  return (
    <div
      className={ cn(
        'size-8 flex items-center justify-center cursor-pointer',
        'transition-all duration-200',
      ) }
      onClick={ onClick }
      onMouseEnter={ (e) => {
        const dot = e.currentTarget.querySelector('.color-dot') as HTMLElement
        if (dot) {
          dot.style.transform = 'scale(1.25)'
          dot.style.opacity = '0.8'
          dot.style.boxShadow = `0 0 0 2px ${color}40`
        }
      } }
      onMouseLeave={ (e) => {
        const dot = e.currentTarget.querySelector('.color-dot') as HTMLElement
        if (dot) {
          dot.style.transform = 'scale(1)'
          dot.style.opacity = '1'
          dot.style.boxShadow = 'none'
        }
      } }
    >
      <div
        className="color-dot w-2 h-2 rounded-full transition-all duration-200"
        style={ {
          backgroundColor: color,
        } }
      />
    </div>
  )
})

/**
 * 受控模式测试组件
 */
function ControlledModeTest() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<ContextMenuRef>(null)

  const handleOpenMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    /** 将 React.MouseEvent 转换为原生 MouseEvent */
    const nativeEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: event.clientX,
      clientY: event.clientY,
    })
    menuRef.current?.open(nativeEvent)
  }

  const handleCloseMenu = () => {
    menuRef.current?.close()
  }

  return (
    <div className="p-6 bg-background2 rounded-lg border border-border">
      <h2 className="text-lg font-semibold mb-4 text-text">
        受控模式测试
      </h2>
      <p className="text-text2 mb-4">
        受控模式下，菜单不会自动监听全局右键事件，需要通过按钮或代码手动控制打开/关闭。
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={ e => handleOpenMenu(e) }
            className={ cn(
              'px-4 py-2 rounded-lg',
              'bg-systemOrange text-white',
              'hover:bg-systemOrange/90 transition-colors',
              'font-medium',
            ) }
          >
            打开菜单
          </button>
          <button
            type="button"
            onClick={ handleCloseMenu }
            className={ cn(
              'px-4 py-2 rounded-lg',
              'bg-background border border-border text-text',
              'hover:bg-background2 transition-colors',
              'font-medium',
            ) }
          >
            关闭菜单
          </button>
          <div className="text-sm text-text2">
            当前状态：
            <span className={ cn(
              'ml-2 font-medium',
              open
                ? 'text-systemOrange'
                : 'text-text2',
            ) }>
              { open
                ? '打开'
                : '关闭' }
            </span>
          </div>
        </div>

        <div
          className="h-64 bg-background rounded-sm border border-border flex items-center justify-center cursor-pointer"
          onContextMenu={ handleOpenMenu }
        >
          <p className="text-text2">
            右键点击这里（受控模式需要手动处理事件）
          </p>
        </div>
      </div>

      <ContextMenu
        ref={ menuRef }
        width={ 200 }
        closeOnClick
        open={ open }
        onOpenChange={ setOpen }
      >
        <MenuItem
          icon={ <Star className="w-4 h-4 text-text2" /> }
          label="受控模式菜单项 1"
          onClick={ () => {
            console.log('点击了受控模式菜单项 1')
          } }
        />
      </ContextMenu>
    </div>
  )
}

/**
 * 非受控模式测试组件
 */
function UncontrolledModeTest() {
  return (
    <div className="p-6 bg-background2 rounded-lg border border-border">
      <h2 className="text-lg font-semibold mb-4 text-text">
        非受控模式测试
      </h2>
      <p className="text-text2 mb-4">
        非受控模式下，菜单会自动监听全局右键事件，无需手动控制。在这个区域内右键点击，查看菜单效果：
      </p>
      <div className="h-64 bg-background rounded-sm border border-border flex items-center justify-center">
        <p className="text-text2">
          右键点击这里
        </p>
      </div>

      <ContextMenu
        width={ 200 }
        closeOnClick
        className="p-2"
      >
        <MenuItem
          icon={ (
            <div className="w-2 h-2 rounded-full bg-text2" />
          ) }
          label="选择 Flowtag"
        >
          <div className="flex items-center justify-around pl-4">
            <ColorDot
              color="#ff6b9d"
              onClick={ () => {
                console.log('选择了粉色 Flowtag')
              } }
            />
            <ColorDot
              color="#a8e063"
              onClick={ () => {
                console.log('选择了绿色 Flowtag')
              } }
            />
            <ColorDot
              color="#c77dff"
              onClick={ () => {
                console.log('选择了紫色 Flowtag')
              } }
            />
          </div>
        </MenuItem>

        <MenuItem
          icon={ <Star className="w-4 h-4 text-text2" /> }
          label="重要"
        />

        <MenuItem
          icon={ <Copy className="w-4 h-4 text-text2" /> }
          label="创建副本"
        />

        <MenuItem
          icon={ <Trash2 className="w-4 h-4 text-text2" /> }
          label="删除"
        />
      </ContextMenu>
    </div>
  )
}
