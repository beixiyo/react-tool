import { ThemeToggle } from '.'

export default function ThemeToggleDemo() {
  return (
    <div
      className="dark: // 使用 TailwindCSS 变体来控制背景色 min-h-screen w-full flex flex-col items-center justify-center gap-16 bg-[#d9deea] p-8 transition-colors duration-500 dark:bg-[#2b303e]"
    >
      <h1
        className="// 使用 TailwindCSS dark: 变体来控制文本颜色 text-center text-4xl text-gray-800 font-bold transition-colors duration-500 dark:text-gray-200"
      >
        主题切换器 (View Transitions API)
      </h1>

      {/* --- 大尺寸 --- */ }
      <div className="flex flex-col items-center gap-4">
        <p
          className="mb-2 text-gray-600 transition-colors duration-500 dark:text-gray-400"
        >
          大尺寸
        </p>
        <ThemeToggle
          size={ 300 }
        />
      </div>
    </div>
  )
}
