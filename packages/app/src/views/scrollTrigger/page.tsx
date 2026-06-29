import type { TimeFunc } from '@jl-org/cvs'
import { ScrollTrigger } from '@jl-org/tool'
import { useEffect, useState } from 'react'
import { GithubSourceLink } from '@/components/GithubSourceLink'
import {
  AnimatedCard,
  ContentBlock,
  ControlPanel,
} from './components'
import ParallaxPage from './components/Parallax'

/** 主演示组件 */
function ScrollTriggerDemo() {
  const [selectedEase, setSelectedEase] = useState<TimeFunc>('easeInOut')
  const [startPos, setStartPos] = useState(0)
  const [endPos, setEndPos] = useState(500)

  useEffect(() => {
    /** 页面加载时刷新所有触发器 */
    ScrollTrigger.refreshAll()

    /** 组件卸载时销毁所有触发器 */
    return () => {
      ScrollTrigger.destroyAll()
    }
  }, [])

  /** 当动画选项变化时重新计算 */
  useEffect(() => {
    ScrollTrigger.refreshAll()
  }, [selectedEase, startPos, endPos])

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <ContentBlock
        id="section2"
        title="视差滚动"
        color="#4f46e5"
      />
      <ParallaxPage />

      {/* 顶部标题区域 */ }
      <ContentBlock
        id="header"
        title="ScrollTrigger 演示"
        color="#3b82f6"
        height={ 400 }
      />

      {/* 控制面板 */ }
      <ControlPanel
        selectedEase={ selectedEase }
        startPos={ startPos }
        endPos={ endPos }
        onEaseChange={ setSelectedEase }
        onStartPosChange={ setStartPos }
        onEndPosChange={ setEndPos }
      />

      {/* 内容区域 */ }
      <div className="mx-auto px-4 py-8 container space-y-32">
        <div className="space-y-2">
          <h2 className="mb-6 text-center text-2xl font-bold">基本动画效果</h2>
          <AnimatedCard
            title={ `动画曲线: ${selectedEase}` }
            ease={ selectedEase }
            startPos={ startPos }
            endPos={ endPos }
          />
        </div>

        <ContentBlock
          id="section1"
          title="滚动继续"
          color="#10b981"
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 md:grid-cols-2">
          <AnimatedCard title="线性动画" ease="linear" startPos={ startPos } endPos={ endPos } />
          <AnimatedCard title="缓入动画" ease="easeIn" startPos={ startPos } endPos={ endPos } />
          <AnimatedCard title="缓出动画" ease="easeOut" startPos={ startPos } endPos={ endPos } />
          <AnimatedCard title="回弹动画" ease="backOut" startPos={ startPos } endPos={ endPos } />
          <AnimatedCard title="弹性动画" ease="elasticOut" startPos={ startPos } endPos={ endPos } />
          <AnimatedCard title="弹跳动画" ease="bounceOut" startPos={ startPos } endPos={ endPos } />
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default ScrollTriggerDemo
