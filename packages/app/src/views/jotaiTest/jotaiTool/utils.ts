import { useRef } from 'react'

/**
 * 在 hook 中检查某个“签名”在多次渲染间是否保持稳定。
 * 如果签名在后续渲染中发生变化，则抛出错误，帮助开发者尽早发现不稳定的 hooks 调用或依赖。
 *
 * 注：签名应尽量使用简单可序列化的数据（如字符串数组、数字等）。
 *
 * @param hookName - Hook 名称，用于错误提示定位
 * @param signature - 用于判断稳定性的值（尽量可序列化）
 */
export function useStableSignature(hookName: string, signature: unknown) {
  const sigRef = useRef<string | null>(null)

  let currentSig: string
  try {
    currentSig = JSON.stringify(signature)
  }
  catch (err) {
    /** 如果无法序列化，退回到 toString（尽量避免） */
    currentSig = String(signature)
  }

  if (sigRef.current === null) {
    sigRef.current = currentSig
    return
  }

  if (sigRef.current !== currentSig) {
    throw new Error(
      `${hookName}: detected unstable hook dependencies between renders — `
      + `please ensure hook inputs (keys/selectors) are stable and created outside render.`,
    )
  }
}

export function isDev() {
  const isNode = typeof process !== 'undefined'
  return isNode
    ? process.env.NODE_ENV === 'development'
    : import.meta.env.DEV || import.meta.env.NODE_ENV === 'development'
}

declare global {
  interface ImportMeta {
    env: {
      DEV: boolean
      NODE_ENV: string
    }
  }
}
