import { Notification } from '.'
import { Button } from '../Button'
import { ThemeToggle } from '../ThemeToggle'

export default function NotificationExample() {
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto p-4 dark:bg-black">
      <ThemeToggle></ThemeToggle>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-text">位置测试</h2>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={ () => {
              Notification.default('左上角通知', { position: 'topLeft' })
            } }
          >
            左上角
          </Button>
          <Button
            onClick={ () => {
              Notification.default('右上角通知', { position: 'topRight' })
            } }
          >
            右上角
          </Button>
          <Button
            onClick={ () => {
              Notification.default('左下角通知', { position: 'bottomLeft' })
            } }
          >
            左下角
          </Button>
          <Button
            onClick={ () => {
              Notification.default('右下角通知', { position: 'bottomRight' })
            } }
          >
            右下角
          </Button>
        </div>

        <h2 className="text-lg font-semibold text-text">类型测试</h2>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={ () => {
              Notification.default('这是一条默认通知')
            } }
          >
            默认通知
          </Button>
          <Button
            variant="success"
            onClick={ () => {
              Notification.success('操作成功')
            } }
          >
            成功通知
          </Button>
          <Button
            variant="warning"
            onClick={ () => {
              Notification.warning('警告信息')
            } }
          >
            警告通知
          </Button>
          <Button
            variant="danger"
            onClick={ () => {
              Notification.danger('发生错误')
            } }
          >
            错误通知
          </Button>
          <Button
            variant="info"
            onClick={ () => {
              Notification.info('提示信息')
            } }
          >
            提示通知
          </Button>
        </div>

        <h2 className="text-lg font-semibold text-text">Loading 测试</h2>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={ () => {
              const controller = Notification.loading('加载中...')
              // 3秒后手动关闭
              setTimeout(() => {
                controller.close()
              }, 3000)
            } }
          >
            Loading（3秒后关闭）
          </Button>
          <Button
            onClick={ () => {
              Notification.loading('加载中...', { showClose: true })
            } }
          >
            Loading（带关闭按钮）
          </Button>
        </div>

        <h2 className="text-lg font-semibold text-text">自定义 JSX 测试</h2>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={ () => {
              Notification.default(
                <div>
                  <div className="font-semibold">自定义标题</div>
                  <div className="text-text2 text-xs mt-1">这是自定义内容</div>
                </div>,
                { showClose: true },
              )
            } }
          >
            自定义 JSX
          </Button>
        </div>

        <h2 className="text-lg font-semibold text-text">带关闭按钮测试</h2>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={ () => {
              Notification.default('这是一条带关闭按钮的通知', {
                showClose: true,
                duration: 5000,
              })
            } }
          >
            带关闭按钮（5秒）
          </Button>
        </div>
      </div>
    </div>
  )
}
