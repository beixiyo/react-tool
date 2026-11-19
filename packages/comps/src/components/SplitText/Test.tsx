'use client'

import { Card } from '../Card'
import { ThemeToggle } from '../ThemeToggle'
import { SplitText } from '.'

function SplitTextTest() {
  return (
    <Card
      className="min-h-screen rounded-none border-0 shadow-none"
      padding="lg"
      title="SplitText 分割线文字"
      headerActions={ <ThemeToggle /> }
      bodyClassName="space-y-8"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <Card title="基础用法" variant="glass" padding="lg">
          <SplitText>或使用以下方式登录</SplitText>
        </Card>

        <Card title="空内容：显示默认文案 No Data" variant="glass" padding="lg">
          <SplitText />
        </Card>

        <Card title="自定义 className / style" variant="glass" padding="lg" bodyClassName="space-y-6">
          <SplitText className="text-text2 text-sm">更小的次要文字</SplitText>
          <SplitText className="text-text2 mx-auto w-1/2 text-xs tracking-widest uppercase">Narrow</SplitText>
          <SplitText style={ { paddingBlock: 12 } }>style 额外留白</SplitText>
        </Card>

        <Card title="富内容 children" variant="glass" padding="lg">
          <SplitText>
            <span className="text-info">2026</span>
            <span className="text-text2 ml-1 font-normal">年度回顾</span>
          </SplitText>
        </Card>
      </div>
    </Card>
  )
}

export default SplitTextTest
