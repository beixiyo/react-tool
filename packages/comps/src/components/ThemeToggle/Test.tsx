import { ThemeToggle } from '.'
import { GithubSourceLink } from '../GithubSourceLink'

function ThemeToggleDemo() {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center gap-16 bg-background p-8 text-text transition-colors duration-500"
    >
      <h1
        className="text-center text-4xl text-text font-bold transition-colors duration-500"
      >
        主题切换器 (View Transitions API)
      </h1>

      {/* --- 大尺寸 --- */ }
      <div className="flex flex-col items-center gap-4">
        <p
          className="mb-2 text-text2 transition-colors duration-500"
        >
          大尺寸
        </p>
        <ThemeToggle
          size={ 300 }
        />
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default ThemeToggleDemo
