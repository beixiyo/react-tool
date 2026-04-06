import { useState } from 'react'
import { AnnouncementBar } from '.'
import { Button, Switch, ThemeToggle } from '../'

const verticalItems = [
  <span key="a">系统将于今晚 02:00–04:00 维护，请提前保存工作</span>,
  <span key="b">新功能：主题切换已支持跟随系统</span>,
  <span key="c">欢迎使用组件库演示站</span>,
]

const horizontalItems = [
  <span key="1">限时活动 · 全场包邮</span>,
  <span key="2">会员日 · 积分双倍</span>,
  <span key="3">新品上架 · 点击查看</span>,
]

export default function AnnouncementBarTest() {
  const [pauseOnHover, setPauseOnHover] = useState(true)
  const [fastTick, setFastTick] = useState(false)

  return (
    <div className="min-h-screen overflow-auto bg-background p-6 text-text">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-text">AnnouncementBar</h1>
          <ThemeToggle />
        </div>

        <section className="space-y-3 rounded-xl border border-border bg-background2 p-5">
          <h2 className="text-lg font-medium text-text">垂直轮播</h2>
          <p className="text-sm text-text2">
            多条公告上下切换，首尾无缝；悬停可暂停（可关闭）。
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-text2">
            <label className="flex cursor-pointer items-center gap-2">
              <Switch
                checked={ pauseOnHover }
                onChange={ setPauseOnHover }
              />
              pauseOnHover
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <Switch
                checked={ fastTick }
                onChange={ setFastTick }
              />
              快速间隔（1.2s）
            </label>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-background">
            <AnnouncementBar
              className="h-11 bg-transparent from-transparent to-transparent"
              items={ verticalItems }
              direction="vertical"
              durationMs={ fastTick ? 1200 : 3000 }
              pauseOnHover={ pauseOnHover }
              itemClassName="text-sm text-text px-4"
            />
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-border bg-background2 p-5">
          <h2 className="text-lg font-medium text-text">水平轮播</h2>
          <p className="text-sm text-text2">
            适用于顶栏跑马灯式公告。
          </p>
          <div className="overflow-hidden rounded-lg border border-border bg-systemOrange/15">
            <AnnouncementBar
              className="h-10 bg-transparent from-transparent to-transparent"
              items={ horizontalItems }
              direction="horizontal"
              durationMs={ 2500 }
              itemClassName="text-sm text-text whitespace-nowrap"
            />
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-border bg-background2 p-5">
          <h2 className="text-lg font-medium text-text">单条</h2>
          <p className="text-sm text-text2">
            仅一条时不自动轮播，仅静态展示。
          </p>
          <div className="overflow-hidden rounded-lg border border-border bg-background">
            <AnnouncementBar
              className="h-10 bg-transparent from-transparent to-transparent"
              items={ [<span key="only">仅此一条公告</span>] }
              itemClassName="text-sm text-text px-4"
            />
          </div>
        </section>

        <section className="rounded-xl border border-dashed border-border bg-background2/50 p-5 text-sm text-text2">
          <p className="mb-2 font-medium text-text">空列表</p>
          <p className="mb-3">items 为空时组件返回 null，下方区域不应出现条带。</p>
          <div className="min-h-[2.5rem] rounded border border-border bg-background">
            <AnnouncementBar items={ [] } />
            <div className="p-2 text-xs text-text3">（占位：无 AnnouncementBar 渲染）</div>
          </div>
        </section>

        <div className="flex flex-wrap gap-2 pb-8">
          <Button
            variant="secondary"
            size="sm"
            onClick={ () => window.scrollTo({ top: 0, behavior: 'smooth' }) }
          >
            回到顶部
          </Button>
        </div>
      </div>
    </div>
  )
}
