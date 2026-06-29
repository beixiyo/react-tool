'use client'

import { TextFadeIn } from '.'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'

const paragraph = '文字渐显效果会让一段文本随着阅读节奏逐字浮现，常用于引导页、产品介绍或叙事性内容，营造柔和而专注的进入感。'

const englishParagraph = 'A gentle fade-in reveals each character in sequence, guiding the reader\'s attention and creating a calm, focused reading experience.'

function TestPage() {
  return (
    <div className="min-h-screen bg-background p-8 text-text">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">TextFadeIn 文字渐显</h1>
            <p className="mt-1 text-sm text-text2">文本随阅读节奏逐字渐显，可调节速度与渐变宽度</p>
          </div>
          <ThemeToggle />
        </header>

        <Card title="基本用法">
          <TextFadeIn text={ paragraph } />
        </Card>

        <Card title="更快的速度（duration=12）">
          <TextFadeIn text={ englishParagraph } duration={ 12 } />
        </Card>

        <Card title="更宽的渐变区域（fadeWidth=12em）">
          <TextFadeIn text={ paragraph } fadeWidth="12em" />
        </Card>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default TestPage
