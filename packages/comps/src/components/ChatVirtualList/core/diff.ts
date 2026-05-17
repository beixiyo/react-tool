import type { ListMutation } from './types'

/**
 * O(1) 变更检测 — 通过首尾 key 判断 prepend/append/mixed
 */
export function detectMutation(
  prevKeys: (string | number)[],
  nextKeys: (string | number)[],
): ListMutation {
  const prevN = prevKeys.length
  const nextN = nextKeys.length

  if (prevN === 0 || nextN === 0) {
    return { type: 'mixed' }
  }

  const delta = nextN - prevN
  if (delta <= 0) {
    return { type: 'mixed' }
  }

  if (
    nextKeys[delta] === prevKeys[0]
    && nextKeys[nextN - 1] === prevKeys[prevN - 1]
  ) {
    return { type: 'prepend', count: delta }
  }

  if (
    nextKeys[0] === prevKeys[0]
    && nextKeys[prevN - 1] === prevKeys[prevN - 1]
  ) {
    return { type: 'append', count: delta }
  }

  return { type: 'mixed' }
}
