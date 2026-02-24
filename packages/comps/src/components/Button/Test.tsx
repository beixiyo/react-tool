'use client'

import { useInsertStyle, useTheme, useToggleThemeWithTransition } from 'hooks'
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Check,
  LayoutGrid,
  LayoutList,
  Loader2,
  Mail,
  Menu,
  Moon,
  Save,
  Sun,
  ThumbsUp,
  User,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Button, ButtonGroup, TipButton } from '.'
import { ThemeToggle } from '../ThemeToggle'

export default function App() {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const aRef = useRef<HTMLButtonElement>(null)

  const [theme, setTheme] = useTheme()
  const [viewMode, setViewMode] = useState('grid')
  const [sizeMode, setSizeMode] = useState('md')
  useInsertStyle({
    lightStyleStrOrUrl: new URL('styles/transition/theme.css', import.meta.url).href,
    darkStyleStrOrUrl: new URL('styles/transition/theme.css', import.meta.url).href,
  })
  const toggleTheme = useToggleThemeWithTransition(theme, setTheme)

  return (
    <div className="h-screen overflow-auto bg-background2 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="mb-8 w-fit text-3xl font-bold">按钮组件展示</h1>
          <ThemeToggle></ThemeToggle>
        </div>

        {/* TipButton 提示按钮 */ }
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">提示按钮 (TipButton)</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg p-6 shadow-2xs">
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

            <div className="rounded-lg p-6 shadow-2xs">
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

            <div className="rounded-lg p-6 shadow-2xs">
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
            <div className="rounded-lg p-6 shadow-2xs">
              <h3 className="mb-4 text-lg font-medium">变体</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default" ref={ buttonRef }>默认按钮</Button>
                <Button variant="primary">主要按钮</Button>
                <Button variant="secondary">次级按钮</Button>
                <Button variant="success">成功按钮</Button>
                <Button variant="warning">警告按钮</Button>
                <Button variant="danger">危险按钮</Button>
                <Button variant="info">信息按钮</Button>
                <Button variant="link">链接按钮</Button>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-2xs">
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

            <div className="rounded-lg p-6 shadow-2xs">
              <h3 className="mb-4 text-lg font-medium">尺寸</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">小按钮</Button>
                <Button variant="primary" size="md">中按钮</Button>
                <Button variant="primary" size="lg">大按钮</Button>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-2xs">
              <h3 className="mb-4 text-lg font-medium">数字尺寸</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size={ 24 }>24px</Button>
                <Button variant="primary" size={ 32 }>32px</Button>
                <Button variant="primary" size={ 40 }>40px</Button>
                <Button variant="primary" size={ 48 }>48px</Button>
              </div>
              <p className="mt-3 text-sm text-text2">
                使用数字可以精确控制按钮高度，内边距和字体大小会根据高度自动计算
              </p>
            </div>

            <div className="rounded-lg p-6 shadow-2xs">
              <h3 className="mb-4 text-lg font-medium">数字尺寸图标按钮</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size={ 24 } leftIcon={ <Save size={ 12 } /> }>保存</Button>
                <Button variant="success" size={ 32 } leftIcon={ <Check size={ 16 } /> }>确认</Button>
                <Button variant="info" size={ 40 } leftIcon={ <Mail size={ 20 } /> }>消息</Button>
                <Button variant="warning" size={ 48 } leftIcon={ <Bell size={ 24 } /> }>通知</Button>
                <Button variant="primary" size={ 32 } leftIcon={ <Sun size={ 18 } /> } aria-label="亮色主题" />
                <Button variant="info" size={ 40 } leftIcon={ <Moon size={ 20 } /> } aria-label="暗色主题" />
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-2xs">
              <h3 className="mb-4 text-lg font-medium">数字尺寸加载状态</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size={ 32 } loading loadingText="加载中...">
                  加载按钮
                </Button>
                <Button variant="success" size={ 40 } loading leftIcon={ <Save size={ 20 } /> }>
                  保存中
                </Button>
                <Button variant="info" size={ 48 } loading loadingText="处理中...">
                  处理中
                </Button>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-2xs">
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

            <div className="rounded-lg p-6 shadow-2xs">
              <h3 className="mb-4 text-lg font-medium">Tooltip 示例</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" tooltip="这是一个提示">带提示的按钮</Button>
                <Button variant="info" tooltip={ { content: '底部提示', placement: 'bottom' } }>对象形式</Button>
                <Button
                  variant="success"
                  tooltip={ <span>
                    自定义
                    <strong>ReactNode</strong>
                  </span> }>
                  ReactNode 内容
                </Button>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-2xs">
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
                <Button designStyle="neumorphic" variant="secondary">次级按钮</Button>
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

            <div className="rounded-lg p-6 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#333,-5px_-5px_10px_#333]">
              <h3 className="mb-4 text-lg font-medium">数字尺寸</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button designStyle="neumorphic" variant="primary" size={ 28 }>28px</Button>
                <Button designStyle="neumorphic" variant="success" size={ 36 }>36px</Button>
                <Button designStyle="neumorphic" variant="info" size={ 44 }>44px</Button>
                <Button designStyle="neumorphic" variant="warning" size={ 52 }>52px</Button>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#333,-5px_-5px_10px_#333]">
              <h3 className="mb-4 text-lg font-medium">数字尺寸图标按钮</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  designStyle="neumorphic"
                  variant="primary"
                  size={ 32 }
                  leftIcon={ <ThumbsUp size={ 16 } /> }
                >
                  点赞
                </Button>
                <Button
                  designStyle="neumorphic"
                  variant="success"
                  size={ 40 }
                  leftIcon={ <Save size={ 20 } /> }
                >
                  保存
                </Button>
                <Button
                  designStyle="neumorphic"
                  variant="info"
                  size={ 36 }
                  leftIcon={ <Moon size={ 18 } /> }
                  aria-label="暗色主题"
                  onClick={ toggleTheme }
                />
              </div>
            </div>
          </div>
        </section>

        {/* 幽灵按钮 */ }
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">其他风格按钮</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg p-6 shadow-2xs">
              <h3 className="mb-4 text-lg font-medium">幽灵按钮</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost">幽灵按钮</Button>
                <Button variant="ghost" size="sm">小号幽灵</Button>
                <Button variant="ghost" size="lg">大号幽灵</Button>
                <Button variant="ghost" disabled>禁用幽灵</Button>
                <Button variant="ghost" loading>加载幽灵</Button>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-2xs">
              <h3 className="mb-4 text-lg font-medium">圆角变体</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" rounded="none">无圆角</Button>
                <Button variant="primary" rounded="sm">小圆角</Button>
                <Button variant="primary" rounded="md">中圆角</Button>
                <Button variant="primary" rounded="lg">大圆角</Button>
                <Button variant="primary" rounded="full">完全圆角</Button>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-2xs">
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

        {/* 按钮组 (ButtonGroup) */ }
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">按钮组 (ButtonGroup)</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg p-6 shadow-2xs">
              <h3 className="mb-4 text-lg font-medium">基本用法</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="mb-2 text-sm text-text2">视图模式切换</p>
                  <ButtonGroup active={ viewMode } onChange={ setViewMode }>
                    <Button name="grid" leftIcon={ <LayoutGrid size={ 16 } /> }>
                      网格视图
                    </Button>
                    <Button name="list" leftIcon={ <LayoutList size={ 16 } /> }>
                      列表视图
                    </Button>
                  </ButtonGroup>

                  <ButtonGroup
                    active={ viewMode }
                    onChange={ setViewMode }
                    rounded="lg"
                    className="mt-4 border-none bg-background5"
                  >
                    <Button name="grid" leftIcon={ <LayoutGrid size={ 16 } /> }>
                      网格视图
                    </Button>
                    <Button name="list" leftIcon={ <LayoutList size={ 16 } /> }>
                      列表视图
                    </Button>
                  </ButtonGroup>
                </div>
                <div>
                  <p className="mb-2 text-sm text-text2">
                    当前选中:
                    { viewMode }
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-2xs">
              <h3 className="mb-4 text-lg font-medium">仅图标模式</h3>
              <div className="flex flex-col gap-4">
                <ButtonGroup active={ viewMode } onChange={ setViewMode }>
                  <Button name="grid" leftIcon={ <LayoutGrid size={ 18 } /> } />
                  <Button name="list" leftIcon={ <LayoutList size={ 18 } /> } />
                </ButtonGroup>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-2xs">
              <h3 className="mb-4 text-lg font-medium">尺寸选择</h3>
              <div className="flex flex-col gap-4">
                <ButtonGroup active={ sizeMode } onChange={ setSizeMode }>
                  <Button name="sm">小</Button>
                  <Button name="md">中</Button>
                  <Button name="lg">大</Button>
                </ButtonGroup>
                <p className="text-sm text-text2">
                  当前尺寸:
                  { sizeMode }
                </p>
              </div>
            </div>

            <div className="rounded-lg p-6 shadow-2xs">
              <h3 className="mb-4 text-lg font-medium">自定义样式</h3>
              <div className="flex flex-col gap-4">
                <ButtonGroup
                  active={ viewMode }
                  onChange={ setViewMode }
                  className="border-2 border-primary"
                >
                  <Button name="grid" leftIcon={ <LayoutGrid size={ 16 } /> }>
                    网格
                  </Button>
                  <Button name="list" leftIcon={ <LayoutList size={ 16 } /> }>
                    列表
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
