import type { WinListenerParams } from '@jl-org/tool'
import type { RefObject } from 'react'
import { bindWinEvent, rafThrottle } from '@jl-org/tool'
import { useCallback, useEffect, useInsertionEffect, useLayoutEffect, useState } from 'react'
import { useAsyncEffect } from './lifecycle'
import { useWatchRef } from './state'
import { useTheme } from './useTheme'

/**
 * 监听窗口隐藏
 * @param hiddenFn 窗口隐藏时执行的函数
 * @param showFn 窗口显示时执行的函数
 */
export function useOnWinHidden(
  hiddenFn: VoidFunction,
  showFn?: VoidFunction,
) {
  useEffect(() => {
    const fn = () => {
      const isHidden = document.visibilityState === 'hidden'
      if (isHidden) {
        hiddenFn()
        return
      }

      const isVisible = document.visibilityState === 'visible'
      if (isVisible && showFn) {
        showFn()
      }
    }

    document.addEventListener('visibilitychange', fn)

    return () => {
      document.removeEventListener('visibilitychange', fn)
    }
  }, [hiddenFn, showFn])
}

/**
 * 绑定 window 事件，并自动解绑事件
 * @param eventName 事件名称
 * @param listener 事件回调
 * @returns 解绑事件函数
 */
export function useBindWinEvent<K extends keyof WindowEventMap>(
  eventName: K,
  listener: WinListenerParams<K>[1],
  deps: any[] = [],
  options?: WinListenerParams<K>[2],
) {
  const stableListener = useWatchRef(listener)

  useEffect(() => {
    const unBind = bindWinEvent(eventName, stableListener.current, options)
    return unBind
  }, [eventName, options, ...deps])

  return () => {
    window.removeEventListener(eventName, stableListener.current, options)
  }
}

function parseAndInsertStyle(styleStrOrUrl: string) {
  let clean: VoidFunction | undefined

  return () => {
    /** 尝试解析为 URL */
    try {
      new URL(styleStrOrUrl)
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = styleStrOrUrl
      document.head.appendChild(link)

      clean = () => {
        document.head.removeChild(link)
      }
      return clean
    }
    catch (_error) { /** 是字符串 */ }

    const styleEl = document.createElement('style')
    styleEl.setAttribute('type', 'text/css')
    styleEl.innerHTML = styleStrOrUrl

    document.head.appendChild(styleEl)
    clean = () => {
      document.head.removeChild(styleEl)
    }

    return clean
  }
}

/**
 * 根据主题插入样式，并自动移除样式
 * @param styleStrOrUrl 样式字符串或 URL，同时用于浅色和深色主题
 * @returns 卸载函数
 */
export function useInsertStyle(styleStrOrUrl: string): VoidFunction | undefined

/**
 * 根据主题插入样式，并自动移除样式
 * @param opts 插入样式选项
 * @returns 卸载函数
 */
export function useInsertStyle(opts: InsertStyleOpts): VoidFunction | undefined

export function useInsertStyle(
  styleStrOrUrlOrOpts: string | InsertStyleOpts,
): VoidFunction | undefined {
  const [theme] = useTheme()
  const isString = typeof styleStrOrUrlOrOpts === 'string'

  const opts = isString
    ? undefined
    : styleStrOrUrlOrOpts
  const enable = opts?.enable ?? true
  const darkStyleStrOrUrl = opts?.darkStyleStrOrUrl
  const lightStyleStrOrUrl = opts?.lightStyleStrOrUrl

  // Handle string case
  useAsyncEffect(
    async () => {
      if (!isString)
        return

      const fn = parseAndInsertStyle(styleStrOrUrlOrOpts)
      return fn()
    },
    [isString, styleStrOrUrlOrOpts],
    {
      effectFn: useInsertionEffect,
    },
  )

  // Handle object case
  useAsyncEffect(
    async () => {
      if (isString)
        return

      if (!enable || !(darkStyleStrOrUrl && lightStyleStrOrUrl))
        return

      const lightFn = lightStyleStrOrUrl
        ? parseAndInsertStyle(lightStyleStrOrUrl)
        : () => () => { }
      const darkFn = darkStyleStrOrUrl
        ? parseAndInsertStyle(darkStyleStrOrUrl)
        : () => () => { }

      if (theme === 'light') {
        return lightFn()
      }
      else {
        return darkFn()
      }
    },
    [isString, enable, darkStyleStrOrUrl, lightStyleStrOrUrl, theme],
    {
      effectFn: useInsertionEffect,
    },
  )

  return undefined
}

/**
 * 检测当前点击区域，是否在元素外部
 * @param refs 需要监听点击的元素
 * @param handler 事件处理函数
 * @param options 配置选项
 */
export function useClickOutside(
  refs: RefObject<HTMLElement>[],
  handler: () => void,
  options: ClickOutsideOpts = {},
) {
  const {
    enabled = true,
    trigger = 'mousedown',
    additionalSelectors = [],
  } = options

  const stableHandler = useWatchRef(handler)

  useEffect(() => {
    if (!enabled)
      return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      /** 检查是否点击在指定的 refs 内部 */
      const clickedInRefs = refs.some(ref => ref.current?.contains(target))
      if (clickedInRefs)
        return

      /** 检查是否点击在额外的选择器元素内部 */
      if (additionalSelectors.length > 0) {
        const additionalElements = document.querySelectorAll(additionalSelectors.join(', '))
        const clickedInAdditional = Array.from(additionalElements).some(element =>
          element.contains(target),
        )
        if (clickedInAdditional)
          return
      }

      /** 如果都不在内部，则触发处理函数 */
      stableHandler.current?.()
    }

    document.addEventListener(trigger, handleClickOutside)
    return () => {
      document.removeEventListener(trigger, handleClickOutside)
    }
  }, [refs, enabled, trigger, additionalSelectors, stableHandler])
}

export function useScrollBottom(
  elRef: RefObject<HTMLElement>,
  deps: any[] = [],
  options: ScrollBottomOpts = {},
) {
  const {
    enabled = true,
    smooth = false,
    delay = 0,
  } = options

  const scrollToBottom = useCallback(() => {
    const el = elRef.current
    if (!el)
      return

    const { scrollHeight, clientHeight } = el
    /** 仅当内容溢出时才执行 */
    if (scrollHeight > clientHeight) {
      const target = scrollHeight - clientHeight
      el.scrollTo({
        top: target,
        behavior: smooth
          ? 'smooth'
          : 'instant',
      })
    }
  }, [elRef, smooth])

  useLayoutEffect(() => {
    if (!enabled)
      return

    if (delay > 0) {
      const timer = window.setTimeout(scrollToBottom, delay)
      return () => window.clearTimeout(timer)
    }
    else {
      scrollToBottom()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, smooth, delay, scrollToBottom, ...deps])

  return {
    /**
     * 计算并滚动到正确的底部位置
     */
    scrollToBottom,
  }
}

/**
 * 检测滚动是否触底
 * @param containerRef 滚动容器的 ref
 * @param onReachBottom 触底时的回调函数
 * @param options 配置选项
 * @returns 返回滚动信息和触底检测函数
 */
export function useScrollReachBottom(
  containerRef: RefObject<HTMLElement | null>,
  onReachBottom?: () => void,
  options: ScrollReachBottomOpts = {},
) {
  const {
    threshold = 50,
    enabled = true,
  } = options

  /**
   * 获取滚动尺寸信息
   */
  const getScrollSize = useCallback((customThreshold = threshold) => {
    const container = containerRef.current
    if (!container) {
      return {
        scrollTop: 0,
        clientHeight: 0,
        scrollHeight: 0,
        isReachedBottom: false,
      }
    }

    const scrollTop = container.scrollTop
    const clientHeight = container.clientHeight
    const scrollHeight = container.scrollHeight

    /** 检查是否触底：滚动位置 + 可视高度 >= 总高度 - 阈值 */
    const isReachedBottom = scrollTop + clientHeight >= scrollHeight - customThreshold

    return {
      scrollTop,
      clientHeight,
      scrollHeight,
      isReachedBottom,
    }
  }, [containerRef, threshold])

  /**
   * 检查是否触底
   */
  const checkReachBottom = useCallback(() => {
    if (!enabled || !onReachBottom) {
      return
    }

    const { isReachedBottom } = getScrollSize()
    if (isReachedBottom) {
      onReachBottom()
    }
  }, [enabled, onReachBottom, getScrollSize])

  /** 监听滚动事件 */
  useEffect(() => {
    const container = containerRef.current
    if (!container || !enabled || !onReachBottom) {
      return
    }

    const handleScroll = rafThrottle(() => {
      checkReachBottom()
    })

    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef, enabled, onReachBottom, checkReachBottom])

  return {
    /**
     * 获取滚动尺寸信息
     */
    getScrollSize,
    /**
     * 手动检查是否触底
     */
    checkReachBottom,
  }
}

interface ScrollReachBottomOpts {
  /**
   * 触底阈值（像素）
   * @default 50
   */
  threshold?: number
  /**
   * 是否启用
   * @default true
   */
  enabled?: boolean
}

export function useMouse() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  })

  return mouse
}

/**
 * 键盘快捷键钩子函数
 * @param opts 快捷键配置选项
 * @example
 * ```tsx
 * useShortCutKey({ key: 's', ctrl: true, fn: (e) => console.log('保存') })
 * ```
 */
export function useShortCutKey(opts: ShortCutKeyOpts) {
  const {
    fn,
    key,
    el = window as unknown as HTMLElement,
    ctrl = false,
    shift = false,
    alt = false,
    meta = false,
  } = opts

  const watchFn = useWatchRef(fn)

  useEffect(() => {
    if (!el)
      return

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyEvent = e as KeyboardEvent

      const keyMatches = keyEvent.key.toLowerCase() === key.toLowerCase()
      const ctrlMatches = keyEvent.ctrlKey === ctrl
      const shiftMatches = keyEvent.shiftKey === shift
      const altMatches = keyEvent.altKey === alt
      const metaMatches = keyEvent.metaKey === meta

      if (
        keyMatches
        && ctrlMatches && shiftMatches
        && altMatches && metaMatches
        && watchFn.current
      ) {
        keyEvent.preventDefault()
        watchFn.current(keyEvent)
      }
    }

    el.addEventListener('keydown', handleKeyDown)

    return () => {
      el.removeEventListener('keydown', handleKeyDown)
    }
  }, [alt, ctrl, el, key, meta, shift, watchFn])
}

export type ShortCutKeyOpts = KeyModifier & {
  /**
   * 键名，大小写不敏感
   */
  key: KeyEnum
  /**
   * 快捷键触发时的回调函数
   */
  fn: (e: KeyboardEvent) => void
  /**
   * 指定监听该快捷键的特定元素，优先级高于 defaultEl
   */
  el?: HTMLElement | null
}

export type KeyEnum = ('Ctrl' | 'Shift' | 'Alt' | 'Meta' | 'Enter' | 'Escape' | 'Tab' | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Backspace' | 'Delete' | 'Insert' | 'Home' | 'End' | 'PageUp' | 'PageDown' | 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'F11' | 'F12' | 'CapsLock' | 'NumLock' | 'ScrollLock' | 'PrintScreen' | 'Pause' | 'Break' | 'Clear' | 'ContextMenu' | 'Scroll' | 'Unidentified') | (string & {})

export type KeyModifier = {
  /**
   * 是否需要按下 Ctrl 键
   * @default false
   */
  ctrl?: boolean
  /**
   * 是否需要按下 Shift 键
   * @default false
   */
  shift?: boolean
  /**
   * 是否需要按下 Alt 键
   * @default false
   */
  alt?: boolean
  /**
   * 是否需要按下 Meta 键（Windows 键或 Mac 的 Command 键）
   * @default false
   */
  meta?: boolean
}

interface ClickOutsideOpts {
  /**
   * 是否启用
   * @default true
   */
  enabled?: boolean

  /**
   * 事件类型
   * @default mousedown
   */
  trigger?: 'click' | 'mousedown' | 'contextmenu'

  /**
   * 额外的 CSS 选择器，用于检测点击是否在这些元素内部
   * 主要用于处理固定定位的面板等场景
   * @default []
   */
  additionalSelectors?: string[]
}

interface ScrollBottomOpts {
  /**
   * 是否启用
   * @default true
   */
  enabled?: boolean
  /**
   * 启动平滑滚动，可能造成无法滚动到底
   * @default false
   */
  smooth?: boolean
  /**
   * 延迟时间
   * @default 0
   */
  delay?: number
}

type InsertStyleOpts = {
  enable?: boolean
  lightStyleStrOrUrl?: string
  darkStyleStrOrUrl?: string
}
