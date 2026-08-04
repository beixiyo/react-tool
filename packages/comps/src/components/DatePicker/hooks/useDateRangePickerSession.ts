import type { DateRangePickerConfirmResult, DateRangePickerValue } from '../types'
import { useLatestCallback, useLatestRef } from 'hooks'
import { useEffect, useRef, useState } from 'react'
import { isDateRangeEqual } from '../utils'

/** 管理 DateRangePicker 单次打开事务的确认、取消和异步失效 */
export function useDateRangePickerSession<Value extends DateRangePickerValue>({
  isOpen,
  committedValue,
  draftValue,
  setOpen,
  restoreValue,
  onConfirm,
  onCancel,
  onSessionEnd,
  isValueEqual = isDateRangeEqual as (left: Value, right: Value) => boolean,
}: UseDateRangePickerSessionOptions<Value>): UseDateRangePickerSessionReturn<Value> {
  const [confirming, setConfirming] = useState(false)
  const [confirmRejected, setConfirmRejected] = useState(false)
  const initialValueRef = useRef<Value>(draftValue)
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
    reason: PickerSessionCancelReason,
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

    if (!isValueEqual(draft, initial))
      restoreValue(initial)

    onSessionEnd()
    setConfirmRejected(false)

    if (closePicker)
      setOpen(false)
  })

  const cancel = useLatestCallback((reason: PickerSessionCancelReason) => {
    completeCancel(reason, true)
  })

  const confirm = useLatestCallback(async (value: Value = draftValueRef.current) => {
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

type UseDateRangePickerSessionOptions<Value extends DateRangePickerValue> = {
  isOpen: boolean
  committedValue: Value | undefined
  draftValue: Value
  setOpen: (open: boolean) => void
  restoreValue: (value: Value) => void
  onConfirm?: (value: Value, context: {
    reason: 'confirm'
    initialValue: Value
    draftValue: Value
  }) => DateRangePickerConfirmResult
  onCancel?: (value: Value, context: {
    reason: PickerSessionCancelReason
    initialValue: Value
    draftValue: Value
  }) => void
  onSessionEnd: () => void
  isValueEqual?: (left: Value, right: Value) => boolean
}

type UseDateRangePickerSessionReturn<Value extends DateRangePickerValue> = {
  confirming: boolean
  confirmRejected: boolean
  resetRejection: () => void
  cancel: (reason: PickerSessionCancelReason) => void
  confirm: (value?: Value) => Promise<void>
}

type PickerSessionCancelReason = 'outside' | 'escape' | 'trigger' | 'programmatic'
