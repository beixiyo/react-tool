'use client'

import { useState } from 'react'
import { Button } from '../Button'
import { Checkbox } from '../Checkbox'
import { GithubSourceLink } from '../GithubSourceLink'
import { Modal } from '../Modal'
import { ThemeToggle } from '../ThemeToggle'

function ModalDemo() {
  const [isDefaultModalOpen, setIsDefaultModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false)
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false)
  const [isFixedCloseModalOpen, setIsFixedCloseModalOpen] = useState(false)
  const [isInsideCloseModalOpen, setIsInsideCloseModalOpen] = useState(false)
  const [okLoading, setOkLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  /**
   * onOk 语义演示：声明式不再自己管 loading 与关闭
   *
   * 四个开关各盯一条规则：Promise 期间自动 loading、落定后自动 onClose；
   * 返回 false 保持打开；reject 保持打开；closeOnOk=false 时确认不关
   */
  const [isAsyncOkOpen, setIsAsyncOkOpen] = useState(false)
  const [isFalseOkOpen, setIsFalseOkOpen] = useState(false)
  const [okAllowed, setOkAllowed] = useState(false)
  const [isRejectOkOpen, setIsRejectOkOpen] = useState(false)
  const [isKeepOpen, setIsKeepOpen] = useState(false)
  const [keepOpenClicks, setKeepOpenClicks] = useState(0)

  /** 多层叠加演示：三层声明式 Modal */
  const [layer1, setLayer1] = useState(false)
  const [layer2, setLayer2] = useState(false)
  const [layer3, setLayer3] = useState(false)

  /** 命令式连续叠加：每点一次再叠一层 */
  const handleStackImperative = () => {
    let depth = 0
    const openNext = () => {
      depth++
      const current = depth
      Modal.info({
        titleText: `命令式叠加 第 ${current} 层`,
        okText: current >= 4
          ? 'OK'
          : '再叠一层',
        cancelText: '关闭本层',
        onOk: () => {
          if (current < 4) {
            openNext()
            return false
          }
        },
        children: (
          <div className="space-y-2">
            <p>
              这是命令式 Modal.info 叠加的第
              { current }
              {' '}
              层
            </p>
            <p>
              按 ESC 应只关闭
              <strong>当前最顶层</strong>
              ，下层保持不动
            </p>
            <p>遮罩只在最顶层显示，不会越叠越黑。</p>
          </div>
        ),
      })
    }
    openNext()
  }

  const handleShowModal = () => {
    Modal.show(
      () => (
        <div className="space-y-2">
          <p>This content is rendered by Modal.show(Component, props).</p>
          <p>You can put any custom React component here.</p>
        </div>
      ),
      {
        titleText: 'Modal.show Demo',
      },
    )
  }

  return (
    <div className="p-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <ThemeToggle />

        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={ () => setIsDefaultModalOpen(true) }>Open Default Modal</Button>
          <Button onClick={ () => setIsSuccessModalOpen(true) } variant="success">Open Success Modal</Button>
          <Button onClick={ () => setIsWarningModalOpen(true) } variant="warning">Open Warning Modal</Button>
          <Button onClick={ () => setIsDangerModalOpen(true) } variant="danger">Open Danger Modal</Button>
          <Button onClick={ () => setIsInfoModalOpen(true) } variant="info">Open Info Modal</Button>
          <Button onClick={ () => setIsCustomModalOpen(true) } variant="default">Open Custom Modal</Button>
          <Button onClick={ () => setIsLoadingModalOpen(true) } variant="primary">Open Loading Modal</Button>
          <Button onClick={ () => setIsFixedCloseModalOpen(true) }>Fixed Close Button</Button>
          <Button onClick={ () => setIsInsideCloseModalOpen(true) }>Inside Close Button</Button>
        </div>

        <Modal
          isOpen={ isFixedCloseModalOpen }
          onClose={ () => setIsFixedCloseModalOpen(false) }
          onOk={ () => setIsFixedCloseModalOpen(false) }
          titleText="Fixed Close Button"
          fixedCloseBtn={ {
            className: 'top-6 right-6',
          } }
        >
          <p>全局 fixed 关闭按钮适合沉浸式弹窗或大尺寸内容，按钮脱离窗口本体并吸附到页面右上角。</p>
        </Modal>

        <Modal
          isOpen={ isInsideCloseModalOpen }
          onClose={ () => setIsInsideCloseModalOpen(false) }
          onOk={ () => setIsInsideCloseModalOpen(false) }
          titleText="Inside Close Button"
          innerCloseBtn
        >
          <p>窗口内部关闭按钮适合常规对话框，右上角无圆圈背景，不抢主操作按钮的视觉权重。</p>
        </Modal>

        <Modal
          isOpen={ isLoadingModalOpen }
          onClose={ () => setIsLoadingModalOpen(false) }
          onOk={ () => {
            setOkLoading(true)
            setTimeout(() => {
              setOkLoading(false)
              setIsLoadingModalOpen(false)
            }, 2000)
          } }
          okLoading={ okLoading }
          cancelLoading={ cancelLoading }
          titleText="Loading Modal Test"
        >
          <div className="space-y-4">
            <p>Click "OK" to see the loading state for 2 seconds.</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={ () => setOkLoading(!okLoading) }>
                Toggle OK Loading
              </Button>
              <Button size="sm" onClick={ () => setCancelLoading(!cancelLoading) }>
                Toggle Cancel Loading
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={ isDefaultModalOpen }
          onClose={ () => setIsDefaultModalOpen(false) }
          onOk={ () => setIsDefaultModalOpen(false) }
          titleText="Default Modal"
        >
          <p>This is the content of the default modal.</p>
        </Modal>

        <Modal
          isOpen={ isSuccessModalOpen }
          onClose={ () => setIsSuccessModalOpen(false) }
          onOk={ () => setIsSuccessModalOpen(false) }
          variant="success"
        >
          <p>Your operation was successful.</p>
        </Modal>

        <Modal
          isOpen={ isWarningModalOpen }
          onClose={ () => setIsWarningModalOpen(false) }
          onOk={ () => setIsWarningModalOpen(false) }
          variant="warning"
          titleText="Warning!"
        >
          <p>Please be cautious about this action.</p>
        </Modal>

        <Modal
          isOpen={ isDangerModalOpen }
          onClose={ () => setIsDangerModalOpen(false) }
          onOk={ () => setIsDangerModalOpen(false) }
          variant="danger"
          titleText="Danger!"
        >
          <p>An error occurred while processing your request.</p>
        </Modal>

        <Modal
          isOpen={ isInfoModalOpen }
          onClose={ () => setIsInfoModalOpen(false) }
          onOk={ () => setIsInfoModalOpen(false) }
          variant="info"
          titleText="Information"
        >
          <p>Here is some information for you.</p>
        </Modal>

        <Modal
          isOpen={ isCustomModalOpen }
          onClose={ () => setIsCustomModalOpen(false) }
          titleText="Custom Modal with Long Content"
          okText="Confirm"
          cancelText="Dismiss"
          width={ 800 }
          center
          footer={ (
            <div className="w-full flex justify-between px-6 pb-6">
              <Button variant="default" onClick={ () => setIsCustomModalOpen(false) }>Learn More</Button>
              <div className="space-x-2">
                <Button variant="default" onClick={ () => setIsCustomModalOpen(false) }>Dismiss</Button>
                <Button onClick={ () => setIsCustomModalOpen(false) }>
                  Confirm
                </Button>
              </div>
            </div>
          ) }
        >
          <div className="p-6 space-y-4">
            <p>This modal has custom content and a custom footer.</p>
            <p>You can put any ReactNode here.</p>
            { [...new Array(10)].map((_, i) => (
              <p key={ i }>
                This is a long content line
                { i + 1 }
                { ' ' }
                to test scrolling behavior if the content overflows.
              </p>
            )) }
          </div>
        </Modal>

        <h2 className="text-lg font-semibold text-center">onOk 语义 (声明式与命令式一致)</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={ () => setIsAsyncOkOpen(true) } variant="primary">
            异步 onOk：自动 loading 并关闭
          </Button>
          <Button onClick={ () => setIsFalseOkOpen(true) } variant="warning">
            返回 false：保持打开
          </Button>
          <Button onClick={ () => setIsRejectOkOpen(true) } variant="danger">
            reject：保持打开
          </Button>
          <Button onClick={ () => setIsKeepOpen(true) }>
            closeOnOk=false：确认不关
          </Button>
          <Button
            variant="info"
            onClick={ () => Modal.info({
              titleText: '命令式异步 onOk',
              okText: '提交（1.5s）',
              onOk: () => sleep(1500),
              children: <p>点确认后按钮转 loading，1.5 秒后自动关闭；期间再点或按 Enter 都不会重复提交。</p>,
            }) }
          >
            命令式异步 onOk
          </Button>
        </div>

        <Modal
          isOpen={ isAsyncOkOpen }
          onClose={ () => setIsAsyncOkOpen(false) }
          onOk={ () => sleep(1500) }
          titleText="异步 onOk"
          okText="提交（1.5s）"
        >
          <div className="space-y-2">
            <p>这里没有传 okLoading，也没有在 onOk 里调 onClose。</p>
            <p>点确认：按钮应自动转 loading，1.5 秒后弹窗自动关闭；期间连点或按 Enter 只提交一次。</p>
          </div>
        </Modal>

        <Modal
          isOpen={ isFalseOkOpen }
          onClose={ () => setIsFalseOkOpen(false) }
          onOk={ () => okAllowed
            ? undefined
            : false }
          variant="warning"
          titleText="返回 false 保持打开"
        >
          <div className="space-y-3">
            <p>模拟校验：未勾选时 onOk 返回 false，点确认弹窗不关；勾选后再点确认才关。</p>
            <Checkbox checked={ okAllowed } onChange={ setOkAllowed } label="校验通过" />
          </div>
        </Modal>

        <Modal
          isOpen={ isRejectOkOpen }
          onClose={ () => setIsRejectOkOpen(false) }
          onOk={ async () => {
            await sleep(800)
            throw new Error('模拟请求失败')
          } }
          variant="danger"
          titleText="reject 保持打开"
          okText="提交（会失败）"
        >
          <p>点确认：loading 0.8 秒后请求失败，弹窗保持打开、按钮复位，控制台有一条错误日志。</p>
        </Modal>

        <Modal
          isOpen={ isKeepOpen }
          onClose={ () => setIsKeepOpen(false) }
          onOk={ () => setKeepOpenClicks((count) => count + 1) }
          closeOnOk={ false }
          titleText="closeOnOk=false"
          okText="计数 +1"
        >
          <p>
            确认不关弹窗，只计数：已点
            { ' ' }
            { keepOpenClicks }
            { ' ' }
            次。用取消或 Esc 关闭
          </p>
        </Modal>

        <h2 className="text-lg font-semibold text-center">Imperative Modals</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={ () => Modal.success({ titleText: 'Imperative Success', children: <p>This is an imperative success modal.</p> }) }
            variant="success"
          >
            Open Imperative Success
          </Button>
          <Button
            onClick={ () => Modal.danger({ titleText: 'Imperative Danger', children: <p>This is an imperative danger modal.</p> }) }
            variant="danger"
          >
            Open Imperative Danger
          </Button>
          <Button
            onClick={ () => Modal.warning({ titleText: 'Imperative Warning', children: <p>This is an imperative warning modal.</p> }) }
            variant="warning"
          >
            Open Imperative Warning
          </Button>
          <Button
            onClick={ () => Modal.info({ titleText: 'Imperative Info', children: <p>This is an imperative info modal.</p> }) }
            variant="info"
          >
            Open Imperative Info
          </Button>
          <Button
            onClick={ () => Modal.default({ titleText: 'Imperative Default', children: <p>This is an imperative default modal.</p> }) }
          >
            Open Imperative Default
          </Button>
          <Button
            onClick={ () => Modal.info({
              titleText: 'Imperative Loading',
              okLoading: true,
              cancelLoading: true,
              children: <p>Both buttons are in loading state.</p>,
            }) }
          >
            Open Imperative Loading
          </Button>
          <Button onClick={ handleShowModal } variant="primary">
            Open Modal.show Demo
          </Button>
        </div>

        <h2 className="text-lg font-semibold text-center">多层叠加 (z-index 自增 + ESC 只关栈顶 + 遮罩去重)</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={ () => setLayer1(true) } variant="primary">
            打开第 1 层 (声明式嵌套)
          </Button>
          <Button onClick={ handleStackImperative } variant="default">
            命令式连续叠加
          </Button>
        </div>

        <Modal
          isOpen={ layer1 }
          onClose={ () => setLayer1(false) }
          onOk={ () => setLayer1(false) }
          titleText="第 1 层"
        >
          <div className="space-y-3">
            <p>这是最底层。点击下方按钮在其上再叠一层 Modal。</p>
            <Button onClick={ () => setLayer2(true) }>在上面打开第 2 层</Button>
          </div>
        </Modal>

        <Modal
          isOpen={ layer2 }
          onClose={ () => setLayer2(false) }
          onOk={ () => setLayer2(false) }
          variant="warning"
          titleText="第 2 层"
        >
          <div className="space-y-3">
            <p>第 2 层应完整盖在第 1 层之上 (z-index 自动更高)。</p>
            <p>遮罩只显示一层暗色，不会比单层更黑。</p>
            <Button onClick={ () => setLayer3(true) }>在上面打开第 3 层</Button>
          </div>
        </Modal>

        <Modal
          isOpen={ layer3 }
          onClose={ () => setLayer3(false) }
          onOk={ () => setLayer3(false) }
          variant="danger"
          titleText="第 3 层"
          clickOutsideClose
        >
          <div className="space-y-2">
            <p>连按 ESC：应当先关第 3 层，再关第 2 层，最后第 1 层。</p>
            <p>点击遮罩空白处 (本层开启了 clickOutsideClose) 只关本层。</p>
          </div>
        </Modal>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default ModalDemo

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
