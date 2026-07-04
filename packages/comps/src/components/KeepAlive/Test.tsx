'use client'

import type { KeepAliveTransitionDirection } from './type'
import { memo, useState } from 'react'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'
import { useKeepAliveTransitionBindings } from './hooks'
import { KeepAlive } from './KeepAlive'

const PANELS = [
  { letter: 'A', tint: 'bg-blue-500/10' },
  { letter: 'B', tint: 'bg-violet-500/10' },
  { letter: 'C', tint: 'bg-emerald-500/10' },
]

const OFFSET = 48

/**
 * 单个面板：只用 useKeepAliveTransitionBindings 的 bind + isEntering / isExiting / direction
 * 写样式，进出场滑动与「动画结束通知」都由 bind 内部接管（headless）
 */
const DemoPanel = memo(({ letter, tint }: { letter: string, tint: string }) => {
  const [count, setCount] = useState(0)
  const { isEntering, isExiting, direction, bind } = useKeepAliveTransitionBindings()

  const hidden = isEntering || isExiting
  const dirSign = direction === 'back'
    ? -1
    : 1
  /** 进场：从起始位滑入（forward 从右、back 从左）；退场：滑向反向终点 */
  const translateX = hidden
    ? (isEntering
        ? dirSign * OFFSET
        : -dirSign * OFFSET)
    : 0

  return (
    <div
      className={ `absolute inset-0 flex flex-col items-center justify-center gap-5 ${tint}` }
      style={ {
        transition: 'opacity 320ms ease, transform 320ms ease',
        opacity: hidden
          ? 0
          : 1,
        transform: `translateX(${translateX}px)`,
      } }
      { ...bind }
    >
      <div className="text-5xl font-semibold text-text">{ letter }</div>

      <button
        type="button"
        onClick={ () => setCount(c => c + 1) }
        className="rounded-md border border-border bg-backgroundPrimary px-4 py-2 text-sm text-text transition-colors hover:bg-background2"
      >
        计数
        { ' ' }
        { count }
      </button>

      <p className="text-xs text-text3">切到别的面板再回来，计数仍保留 = keep-alive 生效</p>
    </div>
  )
})

DemoPanel.displayName = 'DemoPanel'

function KeepAliveTest() {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState<KeepAliveTransitionDirection>('replace')

  const switchTo = (i: number) => {
    if (i === active)
      return

    setDirection(i > active
      ? 'forward'
      : 'back')
    setActive(i)
  }

  return (
    <div className="w-full overflow-auto bg-background2 p-8">
      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-backgroundPrimary p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-lg font-medium text-text">KeepAlive 过渡演示</div>
          <ThemeToggle />
        </div>

        <div className="mb-6 rounded-lg border border-border bg-background2 p-4">
          <h3 className="mb-2 text-base font-medium text-text">演示要点</h3>
          <ul className="ml-4 list-disc text-sm space-y-1 text-text2">
            <li>
              <span className="font-medium text-text">进出场动画</span>
              { ' ' }
              - 传 transition 后，切走的面板播完退场、进来的面板播进场
            </li>
            <li>
              <span className="font-medium text-text">方向感知</span>
              { ' ' }
              - 向右切 forward（右进左出）、向左切 back（左进右出）
            </li>
            <li>
              <span className="font-medium text-text">状态保留</span>
              { ' ' }
              - 每个面板的计数切走再回来仍在
            </li>
            <li>
              <span className="font-medium text-text">headless 接线</span>
              { ' ' }
              - 面板只用 useKeepAliveTransitionBindings 的 bind + isEntering / isExiting 写样式
            </li>
          </ul>
        </div>

        <div className="mb-4 flex gap-2">
          { PANELS.map((p, i) => (
            <button
              key={ p.letter }
              type="button"
              onClick={ () => switchTo(i) }
              className={ `rounded-md border px-4 py-1.5 text-sm transition-colors ${
                i === active
                  ? 'border-systemOrange bg-systemOrange/10 text-systemOrange'
                  : 'border-border bg-background2 text-text2 hover:text-text'
              }` }
            >
              面板
              { ' ' }
              { p.letter }
            </button>
          )) }
          <span className="ml-auto self-center text-xs text-text3">
            当前方向：
            { direction }
          </span>
        </div>

        {/* 舞台：面板绝对堆叠，overflow-hidden 让滑动被裁切；切换时退场与进场面板短暂并存交错 */}
        <div className="relative h-72 overflow-hidden rounded-lg border border-border bg-background2">
          { PANELS.map((p, i) => (
            <KeepAlive
              key={ p.letter }
              uniqueKey={ p.letter }
              active={ i === active }
              direction={ direction }
              transition={ { enterTimeout: 600, exitTimeout: 600 } }
            >
              <DemoPanel letter={ p.letter } tint={ p.tint } />
            </KeepAlive>
          )) }
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default KeepAliveTest
