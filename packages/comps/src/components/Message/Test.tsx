import { Message } from '.'
import { Button } from '../Button'
import { GradientText } from '../GradientText'
import { ThemeToggle } from '../ThemeToggle'

export default function MessageExample() {
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
    </div>
  )
}
