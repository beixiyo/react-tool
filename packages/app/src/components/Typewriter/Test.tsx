'use client'

import { typewriterEffect } from '@jl-org/tool'
import { MdToHtml } from 'comps'
import { onMounted } from 'hooks'
import { Bold, Code, Italic, Play, Terminal } from 'lucide-react' // 示例图标
import { useCallback, useEffect, useRef, useState } from 'react'
import { Typewriter } from '.'

function App() {
  const stopFn = useRef<Function>(null)
  const [text1, setText1] = useState('')
  const [typingDone, setTypingDone] = useState(false)

  const fullText1 = `# 复杂打字机模拟

## 功能

- 支持多种类型的文本
- 动态更新光标位置
- 支持自定义光标样式
- 支持多种光标效果

## 用法

\`\`\`tsx
<Typewriter
  className="text-gray-900 leading-relaxed" // 为容器添加文本样式
  done={ typingDone } // 传递完成状态
>
  <MdToHtml content={ text1 } />
</Typewriter>
\`\`\`


## 实现原理

1. 计算最后一个文本节点的位置
2. 动态更新光标位置
  `

  /** 开始打字模拟的函数 */
  const startTyping = useCallback(() => {
    stopFn.current?.()
    setText1('')
    setTypingDone(false)

    const { stop, promise } = typewriterEffect({
      content: fullText1,
      onUpdate: setText1,
      speed: 80,
    })
    stopFn.current = stop

    promise.then(() => setTypingDone(true))
  }, []) // 依赖项为空数组

  // --- 示例 2 状态 ---
  const [text2, setText2] = useState('静态文本，图标将出现：')
  const [showIcon, setShowIcon] = useState(false)
  const [trailingText, setTrailingText] = useState('')

  useEffect(() => {
    /** 模拟异步添加元素 */
    const timer1 = setTimeout(() => {
      setShowIcon(true)
    }, 1500)
    const timer2 = setTimeout(() => {
      setTrailingText(' 完成.') // 在图标后添加文本
    }, 2500)
    /** 清理定时器 */
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  onMounted(() => {
    startTyping()
  })

  // --- 复杂结构内容 ---
  /** 将复杂内容定义为变量以提高可读性 */
  const complexContent = (
    <>
      { ' ' }
      {/* 使用 Fragment 包裹 */ }
      <span className="text-sm text-gray-500">[前缀]</span>
      { ' ' }
      这是
      { ' ' }
      <Bold size={ 18 } className="inline text-blue-600" />
      { ' ' }
      <strong className="text-purple-700 font-semibold underline decoration-wavy">
        加粗并带下划线
      </strong>
      { ' ' }
      的文本。
      <br />
      { ' ' }
      {/* 换行符 */ }
      随后是一些
      { ' ' }
      <Code size={ 18 } className="inline text-green-600" />
      { ' ' }
      <code>内联代码;</code>
      { ' ' }
      然后是
      { ' ' }
      <Italic size={ 18 } className="inline text-orange-600" />
      { ' ' }
      <i>斜体后缀。</i>
      {/* 添加一个空 span 测试是否会被忽略 */ }
      <span></span>
      {/* 添加一个只包含空格的 span */ }
      <span> </span>
      最后的词语
    </>
  )

  // --- 新增：多行打字测试 ---
  const [multiLineText, setMultiLineText] = useState('')
  const [multiLineDone, setMultiLineDone] = useState(false)

  const typeMultiLine = useCallback(() => {
    setMultiLineDone(false)
    setMultiLineText('')

    const fullMultiLineText = `第一行文本
第二行文本
  缩进的文本
第四行文本

最后一行（空行之后）`

    const { promise } = typewriterEffect({
      content: fullMultiLineText,
      onUpdate: setMultiLineText,
      speed: 100,
    })

    promise.then(() => setMultiLineDone(true))
  }, [])

  useEffect(() => {
    typeMultiLine()
  }, [typeMultiLine])

  return (
    /** 页面整体样式 */
    <div
      className="h-screen w-full overflow-auto via-white bg-linear-to-br p-6 text-base font-mono space-y-10 md:p-10 md:text-lg"
    >
      <h1 className="mb-8 text-center text-3xl text-gray-200 font-bold">
        Typewriter Cursor 测试页面
      </h1>

      {/* 示例 1: 打字模拟与重启 */ }
      <div
        className="border-base-low/40 border rounded-lg bg-white/70 p-4 shadow-md backdrop-blur-xs"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-gray-600 font-semibold">
            1. 打字效果 & 完成状态:
          </p>
          <button
            onClick={ startTyping }
            className="flex items-center rounded-sm bg-blue-500 px-3 py-1 text-sm text-white transition duration-150 active:scale-95 hover:bg-blue-600"
            aria-label="重新开始打字动画"
          >
            <Play size={ 14 } className="mr-1" />
            重启
          </button>
        </div>
        <Typewriter
          className="text-gray-900 leading-relaxed" // 为容器添加文本样式
          done={ typingDone } // 传递完成状态
          cursorColor="red"
        >
          <MdToHtml content={ text1 } />
        </Typewriter>

        {/* 当打字完成时显示提示 */ }
        { typingDone && (
          <span className="ml-2 text-xs text-emerald-600">(已完成)</span>
        ) }
      </div>

      {/* 示例 2: 静态文本 + 动态元素 */ }
      <div className="border-base-low/40 border rounded-lg bg-white/70 p-4 shadow-md backdrop-blur-xs">
        <p className="mb-2 text-sm text-gray-600 font-semibold">
          2. 静态文本 + 动态添加元素:
        </p>
        <Typewriter
          cursorColor="#ec4899"
          cursorWidth={ 3 } // 数字表示像素
          as="div" // 使用 div 作为容器
          className="inline-flex items-baseline text-gray-900" // 容器样式
        >
          <span>{ text2 }</span>
          {/* 条件渲染图标 */ }
          { showIcon && (
            <Terminal size={ 18 } className="text-accent-high relative bottom-[-2px] mx-1 inline-block" />
          ) }
          {/* 仅当 trailingText 有值时渲染 */ }
          { trailingText && <span>{ trailingText }</span> }
        </Typewriter>
      </div>

      {/* 示例 3: 复杂 HTML 结构 */ }
      <div className="border-base-low/40 border rounded-lg bg-white/70 p-4 shadow-md backdrop-blur-xs">
        <p className="mb-2 text-sm text-gray-600 font-semibold">
          3. 复杂嵌套 HTML 结构测试:
        </p>
        <Typewriter
          cursorColor="#9333ea"
          cursorWidth="3px" // 字符串表示像素
          blinkSpeed="1.1s"
          as="div" // 使用 div 因为内容包含 <br>
          className="border border-purple-200 border-dashed p-2 text-gray-900 leading-relaxed" // 添加边框以便观察容器范围
        >
          { complexContent }
          { ' ' }
          {/* 传递复杂内容 */ }
        </Typewriter>
        <p className="mt-1 text-xs text-gray-500">
          (光标应出现在 "最后的词语" 之后)
        </p>
      </div>

      {/* 新增示例 4: 测试多行文本和光标自动换行 */ }
      <div className="border-base-low/40 border rounded-lg bg-white/70 p-4 shadow-md backdrop-blur-xs">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm text-gray-600 font-semibold">
            4. 多行文本测试 (光标跟随换行):
          </p>
          <button
            onClick={ typeMultiLine }
            className="flex items-center rounded-sm bg-blue-500 px-3 py-1 text-sm text-white transition duration-150 active:scale-95 hover:bg-blue-600"
            aria-label="重启多行打字"
          >
            <Play size={ 14 } className="mr-1" />
            重启
          </button>
        </div>
        <div className="border border-blue-200 rounded-sm p-2">
          <Typewriter
            as="pre"
            cursorColor="#3b82f6"
            cursorWidth="2px"
            className="whitespace-pre-wrap text-sm text-gray-900 font-mono" // 使用pre保留换行和缩进
            done={ multiLineDone }
          >
            { multiLineText }
          </Typewriter>
        </div>
      </div>

      {/* 示例 5: 禁用光标 */ }
      <div className="border-base-low/40 border rounded-lg bg-white/70 p-4 shadow-md backdrop-blur-xs">
        <p className="mb-2 text-sm text-gray-600 font-semibold">5. 禁用光标:</p>
        <Typewriter as="p" className="text-gray-900" done>
          光标
          { ' ' }
          <strong className="font-bold">不应</strong>
          { ' ' }
          出现在这里。
        </Typewriter>
      </div>

      {/* 示例 6: 空内容 */ }
      <div className="border-base-low/40 border rounded-lg bg-white/70 p-4 shadow-md backdrop-blur-xs">
        <p className="mb-2 text-sm text-gray-600 font-semibold">6. 空内容 (光标隐藏):</p>
        <Typewriter as="p" className="h-5 border border-gray-300 border-dashed">
          { ' ' }
          {/* 给容器一点高度以便观察 */ }
          {/* children 为空 */ }
        </Typewriter>
      </div>

      {/* 示例 7: 只有非文本元素 */ }
      <div className="border-base-low/40 border rounded-lg bg-white/70 p-4 shadow-md backdrop-blur-xs">
        <p className="mb-2 text-sm text-gray-600 font-semibold">7. 只有非文本元素 (光标隐藏):</p>
        <Typewriter as="p" className="h-5 border border-gray-300 border-dashed">
          <Terminal size={ 18 } />
          { ' ' }
          {/* children 是一个图标 */ }
        </Typewriter>
      </div>
    </div>
  )
}

export default App
