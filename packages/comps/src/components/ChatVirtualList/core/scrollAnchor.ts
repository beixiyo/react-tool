/**
 * Prepend 锚点快照 — 捕获/恢复纯函数
 *
 * @see {@link https://github.com/Luccas-carvalho/react-anchorlist | react-anchorlist} — scrollAnchor 设计参照
 */
import type { OffsetMap } from './offsetMap'
import type { AnchorSnapshot } from './types'

/**
 * 在 prepend 之前捕获锚点快照
 *
 * 记录当前视口第一个可见 item 的 key 和偏移量，
 * 以及最多 6 个候选 item 用于容错恢复
 */
export function captureAnchorSnapshot(opts: {
  scrollTop: number
  scrollHeight: number
  itemCount: number
  getKeyAtIndex: (index: number) => string | number
  offsetMap: OffsetMap
}): AnchorSnapshot {
  const { scrollTop, scrollHeight, itemCount, getKeyAtIndex, offsetMap } = opts
  const adjustedScrollTop = Math.max(0, scrollTop)

  if (itemCount === 0) {
    return {
      key: null,
      offsetWithinItem: 0,
      candidates: [],
      scrollTop,
      scrollHeight,
    }
  }

  const firstVisible = offsetMap.findIndexAtOffset(adjustedScrollTop)
  const candidates: AnchorSnapshot['candidates'] = []
  const candidateCount = Math.min(6, itemCount - firstVisible)

  for (let i = 0; i < candidateCount; i++) {
    const idx = firstVisible + i
    const key = getKeyAtIndex(idx)
    const itemOffset = offsetMap.getOffset(idx)
    candidates.push({
      key,
      offsetWithinItem: adjustedScrollTop - itemOffset,
    })
  }

  return {
    key: candidates[0]?.key ?? null,
    offsetWithinItem: candidates[0]?.offsetWithinItem ?? 0,
    candidates,
    scrollTop,
    scrollHeight,
  }
}

/**
 * 从快照解析恢复目标 scrollTop
 *
 * 降级策略：主 key → 候选 key → scrollHeight delta
 */
export function resolveAnchorTarget(opts: {
  snapshot: AnchorSnapshot
  currentScrollHeight: number
  resolveAnchorTop: (key: string | number, offsetWithinItem: number) => number | null
}): number {
  const { snapshot, currentScrollHeight, resolveAnchorTop } = opts

  if (snapshot.key !== null) {
    const primary = resolveAnchorTop(snapshot.key, snapshot.offsetWithinItem)
    if (primary !== null)
      return primary
  }

  for (const candidate of snapshot.candidates) {
    const target = resolveAnchorTop(candidate.key, candidate.offsetWithinItem)
    if (target !== null)
      return target
  }

  return snapshot.scrollTop + (currentScrollHeight - snapshot.scrollHeight)
}
