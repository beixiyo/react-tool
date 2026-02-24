import type { PageSwiperRef } from './PageSwiper'
import { useRef, useState } from 'react'
import { Button, Slider, Switch } from '../'
import { PageSwiper } from './index'

export default function PageSwiperTest() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [gap, setGap] = useState(40)
  const [threshold, setThreshold] = useState(0.12)
  const [showPreview, setShowPreview] = useState(true)
  const [previewWidth, setPreviewWidth] = useState(100)
  const swiperRef = useRef<PageSwiperRef>(null)

  const pages = [
    {
      title: '页面 1',
      color: 'bg-linear-to-br from-blue-500 to-purple-600',
      content: '这是第一个页面，展示蓝色到紫色的渐变背景。',
    },
    {
      title: '页面 2',
      color: 'bg-linear-to-br from-green-500 to-teal-600',
      content: '这是第二个页面，展示绿色到青色的渐变背景。',
    },
    {
      title: '页面 3 - 可滚动内容',
      color: 'bg-linear-to-br from-orange-500 to-red-600',
      content: '这个页面展示了内部垂直滚动功能。',
      scrollable: true,
    },
    {
      title: '页面 4',
      color: 'bg-linear-to-br from-pink-500 to-rose-600',
      content: '这是第四个页面，展示粉色到玫瑰色的渐变背景。',
    },
    {
      title: '页面 5',
      color: 'bg-linear-to-br from-indigo-500 to-blue-600',
      content: '这是第五个页面，展示靛蓝到蓝色的渐变背景。',
    },
  ]

  return (
    <div className="w-full h-screen bg-background">
      <div className="h-16 bg-background2 shadow-xs flex items-center justify-center">
        <h1 className="text-2xl font-bold text-text">
          PageSwiper 测试页面
        </h1>
      </div>

      <div className="relative h-[calc(100vh-4rem)]">
        <PageSwiper
          ref={ swiperRef }
          className="w-full h-full"
          onIndexChange={ setCurrentIndex }
          index={ currentIndex }
          threshold={ threshold }
          showButtons={ true }
          showIndicator={ true }
          gap={ gap }
          showPreview={ showPreview }
          previewWidth={ previewWidth }
        >
          { pages.map((page, index) => (
            <div
              key={ index }
              className={ `w-full h-full ${page.color} flex flex-col text-white` }
            >
              { page.scrollable
                ? (
                    <>
                      <div className="shrink-0 p-6 text-center border-b border-white/20">
                        <h2 className="text-4xl font-bold mb-2">
                          { page.title }
                        </h2>
                        <p className="text-lg opacity-90">
                          { page.content }
                        </p>
                        <p className="text-sm mt-2 opacity-75">
                          👆 向下滚动查看内容，垂直滑动不会触发页面切换
                        </p>
                      </div>
                      <div className="flex-1 overflow-y-auto w-full">
                        <div className="max-w-3xl mx-auto p-6 space-y-6">
                          { Array.from({ length: 30 }).map((_, i) => (
                            <div
                              key={ i }
                              className="bg-white/15 rounded-xl p-6 backdrop-blur-xs border border-white/10 shadow-lg"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                                  { i + 1 }
                                </div>
                                <h3 className="text-xl font-semibold">
                                  内容区块
                                  { i + 1 }
                                </h3>
                              </div>
                              <p className="text-base opacity-90 leading-relaxed">
                                这是第
                                { i + 1 }
                                个内容区块，用于展示页面内部垂直滚动功能。
                                当内容超出页面高度时，可以在这个页面内部滚动，
                                而不会触发页面切换。这是 PageSwiper 的核心特性之一：
                                智能识别垂直滑动和水平滑动，避免与页面滚动冲突。
                              </p>
                              { i === 0 && (
                                <div className="mt-4 p-4 bg-yellow-400/20 rounded-lg border border-yellow-400/30">
                                  <p className="text-sm font-semibold text-yellow-100">
                                    💡 提示：尝试在这个页面内垂直滚动，然后尝试水平滑动切换页面
                                  </p>
                                </div>
                              ) }
                            </div>
                          )) }
                          <div className="text-center py-8 bg-white/10 rounded-xl backdrop-blur-xs border border-white/20">
                            <p className="text-xl font-semibold mb-2">
                              🎉 滚动到底部了！
                            </p>
                            <p className="text-base opacity-90">
                              现在可以水平滑动切换到其他页面
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )
                : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8">
                      <h2 className="text-4xl font-bold mb-6 text-center">
                        { page.title }
                      </h2>
                      <p className="text-xl text-center max-w-md leading-relaxed">
                        { page.content }
                      </p>
                      <div className="mt-8 text-sm opacity-80">
                        当前页面索引:
                        { ' ' }
                        { index + 1 }
                        { ' ' }
                        /
                        { ' ' }
                        { pages.length }
                      </div>
                    </div>
                  ) }
            </div>
          )) }
        </PageSwiper>
      </div>

      <div className="absolute top-20 left-4 bg-background2 rounded-lg shadow-lg p-4 max-w-xs border border-border">
        <h3 className="font-semibold text-text mb-3">
          操作说明
        </h3>
        <ul className="text-sm text-text2 space-y-1 mb-4">
          <li>• 鼠标拖拽或触摸滑动切换页面</li>
          <li>
            •
            <strong>垂直滑动不会触发页面切换</strong>
          </li>
          <li>• 点击两侧按钮切换页面</li>
          <li>• 点击底部指示器跳转页面</li>
          <li>
            •
            {' '}
            <strong className="text-systemBlue">页面 3 支持内部垂直滚动</strong>
          </li>
          <li className="text-xs mt-2 text-systemOrange">
            ⚠️ 切换到页面 3 体验垂直滚动功能
          </li>
          <li className="text-xs mt-2 text-systemPurple">
            👁️ 启用预览模式可看到两侧即将滚入的内容
          </li>
        </ul>
        <h3 className="font-semibold text-text mb-2 mt-4">
          Ref 方法控制
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={ () => swiperRef.current?.prev() }
            variant="primary"
            size="sm"
          >
            上一页
          </Button>
          <Button
            onClick={ () => swiperRef.current?.next() }
            variant="primary"
            size="sm"
          >
            下一页
          </Button>
          <Button
            onClick={ () => swiperRef.current?.goToIndex(0) }
            variant="success"
            size="sm"
          >
            跳转第1页
          </Button>
          <Button
            onClick={ () => swiperRef.current?.goToIndex(2) }
            variant="warning"
            size="sm"
            title="跳转到垂直滚动演示页面"
          >
            📜 垂直滚动演示
          </Button>
          <Button
            onClick={ () => swiperRef.current?.goToIndex(pages.length - 1) }
            variant="success"
            size="sm"
          >
            跳转最后页
          </Button>
        </div>
      </div>

      <div className="absolute top-20 right-4 bg-background2 rounded-lg shadow-lg p-4 border border-border">
        <h3 className="font-semibold text-text mb-2">
          当前状态
        </h3>
        <div className="text-sm text-text2 space-y-1 mb-4">
          <div>
            当前页面:
            { ' ' }
            { currentIndex + 1 }
            { ' ' }
            /
            { ' ' }
            { pages.length }
          </div>
          <div>
            页面标题:
            { ' ' }
            { pages[currentIndex]?.title }
          </div>
          <div>
            Ref 索引:
            { ' ' }
            { swiperRef.current?.getCurrentIndex() ?? '-' }
          </div>
          <div>
            Ref 总数:
            { ' ' }
            { swiperRef.current?.getChildrenLength() ?? '-' }
          </div>
        </div>
        <h3 className="font-semibold text-text mb-2 mt-4">
          配置参数
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <label className="block text-text2 mb-1">
              页面间距 (gap):
              { ' ' }
              { gap }
              px
            </label>
            <Slider
              min={ 0 }
              max={ 200 }
              value={ gap }
              onChange={ val => setGap(val as number) }
            />
          </div>
          <div>
            <label className="block text-text2 mb-1">
              切换阈值 (threshold):
              { ' ' }
              { threshold }
            </label>
            <Slider
              min={ 0.05 }
              max={ 0.5 }
              step={ 0.01 }
              value={ threshold }
              onChange={ val => setThreshold(val as number) }
            />
          </div>
          <div className="pt-2 border-t border-border">
            <label className="flex items-center gap-2 text-text2 mb-1 cursor-pointer">
              <Switch
                checked={ showPreview }
                onChange={ checked => setShowPreview(checked) }
              />
              <span className="font-semibold text-systemPurple">
                启用预览模式 (showPreview)
              </span>
            </label>
            <p className="text-xs text-text3 mb-2">
              启用后可以看到两侧即将滚入的内容
            </p>
          </div>
          { showPreview && (
            <div>
              <label className="block text-text2 mb-1">
                预览宽度 (previewWidth):
                { ' ' }
                { previewWidth }
                px
              </label>
              <Slider
                min={ 50 }
                max={ 300 }
                step={ 10 }
                value={ previewWidth }
                onChange={ val => setPreviewWidth(val as number) }
              />
            </div>
          ) }
        </div>
      </div>
    </div>
  )
}
