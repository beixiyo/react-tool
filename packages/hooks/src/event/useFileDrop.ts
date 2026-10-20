import type { RefObject } from 'react'
import { useEffect, useState } from 'react'
import { useLatestCallback } from '../memo'

/**
 * 文件拖入检测：系统文件悬停到目标上时报告「拖拽中」，松手时交出文件
 *
 * 目标默认是整个 window，也可以传入某个元素（或它的 ref），只响应落在该元素内的拖拽
 *
 * 只负责事件与状态，不判断文件类型、不决定如何处理——由调用方的 `onDrop` 决定
 *
 * 监听挂在目标的冒泡阶段，天然排在目标内各拖放区之后：
 * 拖放区会对自己接得住的拖拽调 `preventDefault`，此处看到 `defaultPrevented` 就让位，
 * 避免抢走它们的拖放
 *
 * @returns 文件是否正悬停在目标上（用于显示蒙层）
 */
export function useFileDrop(options: UseFileDropOptions): boolean {
  const { target, enabled = true, onDrop } = options
  const [dragging, setDragging] = useState(false)
  const handleDrop = useLatestCallback(onDrop)

  useEffect(() => {
    const el = resolveTarget(target)
    if (!enabled || !el) {
      setDragging(false)
      return
    }

    const hasFiles = (e: DragEvent) => Boolean(e.dataTransfer?.types.includes('Files'))

    /**
     * 用 dragover 而非 dragenter / dragleave 计数：子元素之间移动会成对触发 enter / leave，
     * 计数容易漂移；dragover 在悬停期间持续触发，状态只由「还在不在目标里」决定
     */
    const onOver = (e: DragEvent) => {
      if (e.defaultPrevented || !hasFiles(e)) return

      /** 不 preventDefault 的话松手会让浏览器 / Electron 直接导航到该文件 */
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
      setDragging(true)
    }

    /**
     * 指针离开目标才收起：window 目标看 `relatedTarget` 为空（离开窗口）；
     * 元素目标看去向是否还在元素内，子元素之间的 leave 不算
     */
    const onLeave = (e: DragEvent) => {
      const next = e.relatedTarget
      if (next === null || (el instanceof Element && !(next instanceof Node && el.contains(next)))) {
        setDragging(false)
      }
    }

    const onElDrop = (e: DragEvent) => {
      setDragging(false)
      if (e.defaultPrevented || !hasFiles(e)) return

      e.preventDefault()
      const files = Array.from(e.dataTransfer?.files ?? [])
      if (files.length > 0) handleDrop(files)
    }

    const reset = () => setDragging(false)

    el.addEventListener('dragover', onOver as EventListener)
    el.addEventListener('dragleave', onLeave as EventListener)
    el.addEventListener('drop', onElDrop as EventListener)
    el.addEventListener('dragend', reset)

    return () => {
      el.removeEventListener('dragover', onOver as EventListener)
      el.removeEventListener('dragleave', onLeave as EventListener)
      el.removeEventListener('drop', onElDrop as EventListener)
      el.removeEventListener('dragend', reset)
      setDragging(false)
    }
  }, [target, enabled, handleDrop])

  return dragging
}

/** `undefined` 取 window；ref 取其当前元素；传入 `null`（元素尚未就绪）则不监听 */
function resolveTarget(target: UseFileDropTarget | null | undefined): Window | HTMLElement | null {
  if (target === undefined) return window
  if (target === null) return null
  return isRefObject(target)
    ? target.current
    : target
}

function isRefObject(target: HTMLElement | RefObject<HTMLElement | null>): target is RefObject<HTMLElement | null> {
  return 'current' in target
}

export type UseFileDropTarget = HTMLElement | RefObject<HTMLElement | null>

export type UseFileDropOptions = {
  /**
   * 拖放目标：元素或其 ref，只响应落在该元素内的拖拽
   * - 不传：整个 window
   * - 传 `null`：目标尚未就绪（如元素存在 state 里还没挂载），暂不监听
   * @default undefined
   */
  target?: UseFileDropTarget | null
  /**
   * 是否启用；关闭时不监听，也不拦截任何拖放
   * @default true
   */
  enabled?: boolean
  /**
   * 文件在目标上松手；仅在启用且没有其它拖放区接手时调用
   */
  onDrop: (files: File[]) => void
}
