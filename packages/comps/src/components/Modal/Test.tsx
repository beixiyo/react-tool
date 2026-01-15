'use client'

import { useState } from 'react'
import { Button } from '../Button'
import { Modal } from '../Modal'
import { ThemeToggle } from '../ThemeToggle'

export default function ModalDemo() {
  const [isDefaultModalOpen, setIsDefaultModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false)
  const [okLoading, setOkLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  return (
    <div className="p-4 space-y-8">
      <ThemeToggle />
      <h1 className="text-xl font-bold text-center">Modal Demo</h1>

      <div className="space-x-2">
        <Button onClick={ () => setIsDefaultModalOpen(true) }>Open Default Modal</Button>
        <Button onClick={ () => setIsSuccessModalOpen(true) } variant="success">Open Success Modal</Button>
        <Button onClick={ () => setIsWarningModalOpen(true) } variant="warning">Open Warning Modal</Button>
        <Button onClick={ () => setIsErrorModalOpen(true) } variant="danger">Open Error Modal</Button>
        <Button onClick={ () => setIsInfoModalOpen(true) } variant="info">Open Info Modal</Button>
        <Button onClick={ () => setIsCustomModalOpen(true) } variant="default">Open Custom Modal</Button>
        <Button onClick={ () => setIsLoadingModalOpen(true) } variant="primary">Open Loading Modal</Button>
      </div>

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
        onOk={ () => {
          console.log('Default Modal OK')
          setIsDefaultModalOpen(false)
        } }
        titleText="Default Modal"
      >
        <p>This is the content of the default modal.</p>
      </Modal>

      <Modal
        isOpen={ isSuccessModalOpen }
        onClose={ () => setIsSuccessModalOpen(false) }
        onOk={ () => {
          console.log('Success Modal OK')
          setIsSuccessModalOpen(false)
        } }
        variant="success"
        titleText="Success!"
      >
        <p>Your operation was successful.</p>
      </Modal>

      <Modal
        isOpen={ isWarningModalOpen }
        onClose={ () => setIsWarningModalOpen(false) }
        onOk={ () => {
          console.log('Warning Modal OK')
          setIsWarningModalOpen(false)
        } }
        variant="warning"
        titleText="Warning!"
      >
        <p>Please be cautious about this action.</p>
      </Modal>

      <Modal
        isOpen={ isErrorModalOpen }
        onClose={ () => setIsErrorModalOpen(false) }
        onOk={ () => {
          console.log('Error Modal OK')
          setIsErrorModalOpen(false)
        } }
        variant="error"
        titleText="Error!"
      >
        <p>An error occurred while processing your request.</p>
      </Modal>

      <Modal
        isOpen={ isInfoModalOpen }
        onClose={ () => setIsInfoModalOpen(false) }
        onOk={ () => {
          console.log('Info Modal OK')
          setIsInfoModalOpen(false)
        } }
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
              <Button onClick={ () => {
                console.log('Custom Modal Confirmed')
                setIsCustomModalOpen(false)
              } }>
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

      <h2 className="text-lg font-semibold text-center">Imperative Modals</h2>
      <div className="space-x-2">
        <Button
          onClick={ () => Modal.success({ titleText: 'Imperative Success', children: <p>This is an imperative success modal.</p> }) }
          variant="success"
        >
          Open Imperative Success
        </Button>
        <Button
          onClick={ () => Modal.error({ titleText: 'Imperative Error', children: <p>This is an imperative error modal.</p> }) }
          variant="danger"
        >
          Open Imperative Error
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
      </div>
    </div>
  )
}
