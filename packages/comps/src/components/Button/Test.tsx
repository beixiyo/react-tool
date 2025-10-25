'use client'

import { useInsertStyle, useTheme, useToggleThemeWithTransition } from 'hooks'
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Check,
  Loader2,
  Mail,
  Menu,
  Moon,
  Save,
  Sun,
  ThumbsUp,
  User,
} from 'lucide-react'
import { useRef } from 'react'
import { Button, TipButton } from '.'
import { ThemeToggle } from '../ThemeToggle'

export default function App() {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const aRef = useRef<HTMLButtonElement>(null)

  const [theme, setTheme] = useTheme()
  useInsertStyle({
    lightStyleStrOrUrl: new URL('styles/transition/theme.css', import.meta.url).href,
    darkStyleStrOrUrl: new URL('styles/transition/theme.css', import.meta.url).href,
  })
  const toggleTheme = useToggleThemeWithTransition(theme, setTheme)

  return (
    <div className="h-screen overflow-auto bg-backgroundSubtle p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="mb-8 w-fit text-3xl font-bold">按钮组件展示</h1>
          <ThemeToggle></ThemeToggle>
        </div>

        {/* TipButton 提示按钮 */ }
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">提示按钮 (TipButton)</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">基本用法</h3>
              <div className="flex flex-wrap gap-4">
                <TipButton onClick={ () => alert('消息点击') }>
                  <Mail size={ 16 } className="mr-1" />
                  消息
                </TipButton>
                <TipButton>
                  <Bell size={ 16 } className="mr-1" />
                  通知
                </TipButton>
                <TipButton>
                  <User size={ 16 } className="mr-1" />
                  个人中心
                </TipButton>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">光环和徽标设置</h3>
              <div className="flex flex-wrap gap-4">
                <TipButton showPulse showBadge={ false }>
                  仅光环效果
                </TipButton>
                <TipButton showPulse={ false } showBadge>
                  仅红点提示
                </TipButton>
                <TipButton showPulse={ false } showBadge={ false }>
                  无特效
                </TipButton>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">自定义样式</h3>
              <div className="flex flex-wrap gap-4">
                <TipButton
                  variant="red"
                >
                  红色样式
                </TipButton>
                <TipButton
                  variant="green"
                >
                  绿色样式
                </TipButton>
                <TipButton
                  variant="purple"
                >
                  紫色样式
                </TipButton>
              </div>
            </div>
          </div>
        </section>

        {/* 扁平风格按钮 */ }
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">扁平风格按钮</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">变体</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default" ref={ buttonRef }>默认按钮</Button>
                <Button variant="primary">主要按钮</Button>
                <Button variant="success">成功按钮</Button>
                <Button variant="warning">警告按钮</Button>
                <Button variant="danger">危险按钮</Button>
                <Button variant="info">信息按钮</Button>
                <Button variant="link">链接按钮</Button>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">asChild 示例</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" asChild ref={ aRef }>
                  <a href="#" className="hover:underline">仪表盘链接</a>
                </Button>
                <Button variant="success" asChild>
                  <a href="#" className="hover:underline">设置链接</a>
                </Button>
                <Button variant="ghost" asChild>
                  <a href="#" className="hover:underline">个人资料</a>
                </Button>
                <Button designStyle="neumorphic" variant="info" asChild>
                  <a href="#" className="hover:underline">帮助中心</a>
                </Button>
                <Button variant="danger" disabled asChild>
                  <a href="#">禁用链接</a>
                </Button>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">尺寸</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">小按钮</Button>
                <Button variant="primary" size="md">中按钮</Button>
                <Button variant="primary" size="lg">大按钮</Button>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">图标按钮</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" leftIcon={ <Save size={ 16 } /> }>保存</Button>
                <Button variant="success" rightIcon={ <ArrowRight size={ 16 } /> }>下一步</Button>
                <Button variant="default" leftIcon={ <Menu size={ 18 } /> } aria-label="菜单" />
                <Button
                  variant="primary"
                  leftIcon={ <Sun size={ 18 } /> }
                  aria-label="亮色主题"
                  onClick={ toggleTheme }
                />
                <Button
                  variant="info"
                  leftIcon={ <Moon size={ 18 } /> }
                  aria-label="暗色主题"
                  onClick={ toggleTheme }
                />
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">状态</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  loadingText="加载中..."
                  loading
                  leftIcon={ <Save size={ 16 } /> }
                >
                  Loading...
                </Button>
                <Button variant="danger" disabled leftIcon={ <AlertCircle size={ 16 } /> }>
                  禁用按钮
                </Button>
                <Button variant="success" leftIcon={ <Check size={ 16 } /> }>
                  完成
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 新拟态风格按钮 */ }
        <section className="mb-12 rounded-lg bg-[#e8e8e8] p-12 dark:bg-[#262626]">
          <h2 className="mb-4 text-xl font-semibold">新拟态风格按钮</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg p-6 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#333,-5px_-5px_10px_#333]">
              <h3 className="mb-4 text-lg font-medium">变体</h3>
              <div className="flex flex-wrap gap-3">
                <Button designStyle="neumorphic" variant="default">默认按钮</Button>
                <Button designStyle="neumorphic" variant="primary">主要按钮</Button>
                <Button designStyle="neumorphic" variant="success">成功按钮</Button>
                <Button designStyle="neumorphic" variant="warning">警告按钮</Button>
                <Button designStyle="neumorphic" variant="danger">危险按钮</Button>
                <Button designStyle="neumorphic" variant="link">链接按钮</Button>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#333,-5px_-5px_10px_#333]">
              <h3 className="mb-4 text-lg font-medium">图标与状态</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  designStyle="neumorphic"
                  variant="primary"
                  leftIcon={ <ThumbsUp size={ 16 } /> }
                >
                  点赞
                </Button>
                <Button
                  designStyle="neumorphic"
                  variant="success"
                  loadingText="保存中..."
                  leftIcon={ <Save size={ 16 } /> }
                >
                  Save
                </Button>
                <Button
                  designStyle="neumorphic"
                  variant="info"
                  leftIcon={ <Moon size={ 18 } /> }
                  aria-label="暗色主题"
                  onClick={ toggleTheme }
                />
                <Button
                  designStyle="neumorphic"
                  disabled
                  variant="danger"
                >
                  禁用
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 幽灵按钮 */ }
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">其他风格按钮</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">幽灵按钮</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost">幽灵按钮</Button>
                <Button variant="ghost" size="sm">小号幽灵</Button>
                <Button variant="ghost" size="lg">大号幽灵</Button>
                <Button variant="ghost" disabled>禁用幽灵</Button>
                <Button variant="ghost" loading>加载幽灵</Button>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">圆角变体</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" rounded="none">无圆角</Button>
                <Button variant="primary" rounded="sm">小圆角</Button>
                <Button variant="primary" rounded="md">中圆角</Button>
                <Button variant="primary" rounded="lg">大圆角</Button>
                <Button variant="primary" rounded="full">完全圆角</Button>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-xs">
              <h3 className="mb-4 text-lg font-medium">块级按钮</h3>
              <div className="flex flex-col gap-3">
                <Button variant="primary" block>块级主要按钮</Button>
                <Button
                  variant="success"
                  block
                  leftIcon={ <Loader2 size={ 16 } /> }
                  loading
                  loadingText="加载中..."
                >
                  Submit
                </Button>
                <Button variant="danger" block>块级按钮</Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
