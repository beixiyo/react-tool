import { Button } from '@/components/Button'
import { ThemeToggle } from '../ThemeToggle'
import { Message } from './'

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
            Message.loading('加载中...')
          } }
        >
          加载消息
        </Button>
      </div>
    </div>
  )
}
