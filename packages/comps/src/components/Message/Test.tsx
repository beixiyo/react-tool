'use client'

import { useState } from 'react'
import { Message } from '.'
import { Button } from '../Button'
import { GradientText } from '../GradientText'
import { ThemeToggle } from '../ThemeToggle'

export default function MessageExample() {
  /** 组件式 <Message/> 的挂载开关（命令式无需 state，直接调用即可） */
  const [showInline, setShowInline] = useState(false)

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto p-4 dark:bg-black">
      <ThemeToggle></ThemeToggle>

      <div className="flex gap-2">
        <Button
          onClick={ () => {
            Message.default('这是一条默认消息')
          } }
        >
          默认消息
        </Button>
        <Button
          variant="success"
          onClick={ () => {
            Message.success('操作成功')
          } }
        >
          成功消息
        </Button>
        <Button
          variant="warning"
          onClick={ () => {
            Message.warning('警告信息')
          } }
        >
          警告消息
        </Button>
        <Button
          variant="danger"
          onClick={ () => {
            Message.error('发生错误')
          } }
        >
          错误消息
        </Button>
        <Button
          variant="info"
          onClick={ () => {
            Message.info('提示信息')
          } }
        >
          提示消息
        </Button>
        <Button
          onClick={ () => {
            Message.loading('加载中...', 2000)
          } }
        >
          加载消息
        </Button>
        <Button
          onClick={ () => {
            Message.neutral('中性消息 (无图标)')
          } }
        >
          中性消息
        </Button>
        <Button
          onClick={ () => {
            const { close } = Message.loading('演示手动关闭 (2秒后)')
            setTimeout(close, 2000)
          } }
        >
          中性加载
        </Button>
        <Button
          onClick={ () => {
            Message.loading({
              content: '配置对象调用 (3秒)',
              duration: 3000,
            })
          } }
        >
          对象配置调用
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant="success"
          onClick={ () => {
            for (let i = 1; i <= 5; i++) {
              Message.info(`堆叠消息 #${i}`, 5000)
            }
          } }
        >
          连发 5 条（堆叠）
        </Button>
        <Button
          variant="danger"
          onClick={ () => {
            for (let i = 1; i <= 30; i++) {
              Message.default(`溢出测试 #${i}（超出窗口自动关顶部）`, 8000)
            }
          } }
        >
          连发 30 条（溢出自动关顶部）
        </Button>
      </div>

      { /* content 类型为 ReactNode，可直接传入任意自定义 tsx */ }
      <div className="flex gap-2">
        <Button
          onClick={ () => {
            Message.default(
              <GradientText colors={ ['#ffaa40', '#9c40ff', '#ffaa40'] }>
                自定义 GradientText 内容
              </GradientText>,
            )
          } }
        >
          自定义 tsx 内容
        </Button>
        <Button
          onClick={ () => {
            Message.success({
              content: (
                <GradientText
                  colors={ ['#10b981', '#3b82f6', '#10b981'] }
                  className="text-base font-bold"
                >
                  渐变标题 + 自定义图标
                </GradientText>
              ),
              icon: props => <span { ...props }>🎉</span>,
              showClose: true,
              duration: 4000,
            })
          } }
        >
          tsx 内容 + 配置
        </Button>
      </div>

      { /* ⬇️ 验证「自定义 tsx 里的事件能否触发」——Modal 此前踩过坑，Message 同样需验证 */ }

      { /* 命令式调用：传 tsx + 事件（showFailureBar 同款：duration:0 持久 + 内嵌按钮 onClick） */ }
      <div className="flex flex-col gap-2">
        <span className="text-sm text-slate-400 font-semibold">命令式调用 · 传 tsx + 事件</span>
        <div className="flex gap-2">
          <Button
            variant="danger"
            onClick={ () => {
              const bar = Message.error({
                duration: 0,
                showClose: false,
                content: (
                  <span className="flex items-center gap-3">
                    <span>持久失败条（duration:0）</span>
                    <button
                      type="button"
                      className="shrink-0 font-medium underline"
                      onClick={ () => {
                        bar.close()
                        Message.success('✅ 命令式 tsx 的 onClick 生效')
                      } }
                    >
                      点我重试
                    </button>
                  </span>
                ),
              })
            } }
          >
            持久失败条 + 重试按钮
          </Button>

          <Button
            onClick={ () => {
              let count = 0
              Message.info({
                duration: 0,
                showClose: true,
                content: (
                  <span className="flex items-center gap-3">
                    <span>事件闭包计数</span>
                    <button
                      type="button"
                      className="shrink-0 font-medium underline"
                      onClick={ () => Message.info(`✅ 第 ${++count} 次点击：闭包累加正常`) }
                    >
                      点击 +1
                    </button>
                  </span>
                ),
              })
            } }
          >
            事件闭包计数
          </Button>
        </div>
      </div>

      { /* 组件式调用：直接以 JSX 渲染 <Message/>，验证其内部 tsx 事件同样可用 */ }
      <div className="flex flex-col gap-2">
        <span className="text-sm text-slate-400 font-semibold">组件式调用 · &lt;Message/&gt; + 事件</span>
        <div className="flex gap-2">
          <Button onClick={ () => setShowInline(true) }>
            渲染组件式 Message
          </Button>
        </div>
      </div>

      { showInline && (
        <Message
          variant="error"
          duration={ 0 }
          showClose
          style={ { top: 120 } }
          content={ (
            <span className="flex items-center gap-3">
              <span>组件式 Message（JSX 渲染）</span>
              <button
                type="button"
                className="shrink-0 font-medium underline"
                onClick={ () => Message.success('✅ 组件式 tsx 的 onClick 生效') }
              >
                点我
              </button>
            </span>
          ) }
          onClose={ () => setShowInline(false) }
        />
      ) }
    </div>
  )
}
