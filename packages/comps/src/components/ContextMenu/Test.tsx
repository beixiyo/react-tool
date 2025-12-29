'use client'

import { Copy, Star, Trash2 } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { ContextMenu } from './ContextMenu'

/**
 * 菜单项组件
 */
const MenuItem = memo<{
  icon?: React.ReactNode
  label: string
  children?: React.ReactNode
  onClick?: () => void
}>(({ icon, label, children, onClick }) => {
  return (
    <div
      className={ cn(
        'px-3 py-3 cursor-pointer',
        'hover:bg-background transition-colors',
        'first:rounded-t-lg last:rounded-b-lg',
      ) }
      onClick={ onClick }
    >
      <div className="flex items-center gap-2">
        { icon && (
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            { icon }
          </div>
        ) }
        <div className="flex-1 min-w-0">
          <div className="text-sm text-textPrimary font-medium">
            { label }
          </div>
        </div>
      </div>

      { children }
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
 * ContextMenu 测试页面
 */
export default function Test() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-textPrimary">
          右键菜单测试
        </h1>

        <div className="space-y-6">
          <div className="p-6 bg-backgroundSecondary rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-4 text-textPrimary">
              使用说明
            </h2>
            <p className="text-textSecondary">
              在页面上任意位置右键点击，会弹出菜单。菜单会根据鼠标位置自动调整，确保始终可见。
            </p>
          </div>

          <div className="p-6 bg-backgroundSecondary rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-4 text-textPrimary">
              测试区域
            </h2>
            <p className="text-textSecondary mb-4">
              在这个区域内右键点击，查看菜单效果：
            </p>
            <div className="h-64 bg-background rounded border border-border flex items-center justify-center">
              <p className="text-textSecondary">
                右键点击这里
              </p>
            </div>
          </div>
        </div>
      </div>

      <ContextMenu width={ 200 } closeOnClick>
        <MenuItem
          icon={ (
            <div className="w-2 h-2 rounded-full bg-textSecondary" />
          ) }
          label="选择 Flowtag"
        >
          <div className="flex items-center justify-around mt-4 pl-4">
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
          icon={ <Star className="w-4 h-4 text-textSecondary" /> }
          label="重要"
        />

        <MenuItem
          icon={ <Copy className="w-4 h-4 text-textSecondary" /> }
          label="创建副本"
        />

        <MenuItem
          icon={ <Trash2 className="w-4 h-4 text-textSecondary" /> }
          label="删除"
        />
      </ContextMenu>
    </div>
  )
}
