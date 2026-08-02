import type { DateRangePickerCancelContext, DateRangePickerConfirmResult, DateRangePickerValue } from '../types'
import { useLatestCallback, useLatestRef } from 'hooks'
import { useEffect, useRef, useState } from 'react'
import { isDateRangeEqual } from '../utils'

/** 管理 DateRangePicker 单次打开事务的确认、取消和异步失效 */
export function useDateRangePickerSession({
  isOpen,
  committedValue,
  draftValue,
  setOpen,
  restoreValue,
  onConfirm,
  onCancel,
  onSessionEnd,
}: UseDateRangePickerSessionOptions): UseDateRangePickerSessionReturn {
  const [confirming, setConfirming] = useState(false)
  const [confirmRejected, setConfirmRejected] = useState(false)
  const initialValueRef = useRef<DateRangePickerValue>({ start: null, end: null })
  const actionHandledRef = useRef(false)
  const confirmPendingRef = useRef(false)
  const sessionIdRef = useRef(0)
  const mountedRef = useRef(true)
  const wasOpenRef = useRef(false)
  const draftValueRef = useLatestRef(draftValue)
  const isOpenRef = useLatestRef(isOpen)
  const onCancelRef = useLatestRef(onCancel)

  useEffect(() => () => {
    mountedRef.current = false
    sessionIdRef.current += 1
  }, [])

  const resetRejection = useLatestCallback(() => setConfirmRejected(false))

  const completeCancel = useLatestCallback((
    reason: DateRangePickerCancelContext['reason'],
    closePicker: boolean,
  ) => {
    if (actionHandledRef.current)
      return

    sessionIdRef.current += 1
    confirmPendingRef.current = false
    actionHandledRef.current = true

    setConfirming(false)
    const draft = { ...draftValueRef.current }
    const initial = { ...initialValueRef.current }

    onCancelRef.current?.(draft, { reason, initialValue: initial, draftValue: { ...draft } })

    if (!isDateRangeEqual(draft, initial))
      restoreValue(initial)

    onSessionEnd()
    setConfirmRejected(false)

    if (closePicker)
      setOpen(false)
  })

  const cancel = useLatestCallback((reason: DateRangePickerCancelContext['reason']) => {
    completeCancel(reason, true)
  })

  const confirm = useLatestCallback(async (value: DateRangePickerValue = draftValueRef.current) => {
    if (actionHandledRef.current || confirmPendingRef.current)
      return

    const sessionId = sessionIdRef.current
    confirmPendingRef.current = true
    setConfirming(true)
    const confirmedValue = { ...value }

    try {
      const resultOrPromise = onConfirm?.(confirmedValue, {
        reason: 'confirm',
        initialValue: { ...initialValueRef.current },
        draftValue: confirmedValue,
      })
      const result = isPromiseLike(resultOrPromise)
        ? await resultOrPromise
        : resultOrPromise
      if (!mountedRef.current || sessionId !== sessionIdRef.current || !isOpenRef.current)
        return

      confirmPendingRef.current = false
      setConfirming(false)
      if (result === false) {
        setConfirmRejected(true)
        return
      }

      actionHandledRef.current = true
      setConfirmRejected(false)
      setOpen(false)
    }
    catch {
      if (!mountedRef.current || sessionId !== sessionIdRef.current || !isOpenRef.current)
        return
      confirmPendingRef.current = false
      setConfirming(false)
      setConfirmRejected(true)
    }
  })

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      sessionIdRef.current += 1
      confirmPendingRef.current = false
      initialValueRef.current = { ...(committedValue ?? draftValueRef.current) }
      actionHandledRef.current = false
      setConfirming(false)
    }
    else if (!isOpen && wasOpenRef.current) {
      completeCancel('programmatic', false)
    }
    wasOpenRef.current = isOpen
  }, [committedValue, isOpen])

  return {
    confirming,
    confirmRejected,
    resetRejection,
    cancel,
    confirm,
  }
}

function isPromiseLike(result: DateRangePickerConfirmResult | undefined): result is Promise<boolean | void> {
  return !!result && typeof (result as Promise<boolean | void>).then === 'function'
}

type UseDateRangePickerSessionOptions = {
  isOpen: boolean
  committedValue: DateRangePickerValue | undefined
  draftValue: DateRangePickerValue
  setOpen: (open: boolean) => void
  restoreValue: (value: DateRangePickerValue) => void
  onConfirm?: (value: DateRangePickerValue, context: {
    reason: 'confirm'
    initialValue: DateRangePickerValue
    draftValue: DateRangePickerValue
  }) => DateRangePickerConfirmResult
  onCancel?: (value: DateRangePickerValue, context: DateRangePickerCancelContext) => void
  onSessionEnd: () => void
}

type UseDateRangePickerSessionReturn = {
  confirming: boolean
  confirmRejected: boolean
  resetRejection: () => void
  cancel: (reason: DateRangePickerCancelContext['reason']) => void
  confirm: (value?: DateRangePickerValue) => Promise<void>
}
