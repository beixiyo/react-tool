/**
 * 三帧 CSS transform 偏差补偿控制器
 *
 * 当视口上方 item 尺寸变化时，通过三帧流水线消除视觉跳动：
 * - 第 1 帧：CSS transform 立即抵消视觉偏移（不产生 scroll event）
 * - 第 2 帧：scrollBy 推进真实 scrollTop + 缩减 transform
 *
 * @see {@link https://github.com/Luccas-carvalho/react-anchorlist | react-anchorlist} — DeviationController 设计参照
 * - 第 3 帧：防御性清理残留 transform
 */
export class DeviationController {
  private getScrollerEl: () => HTMLElement | null
  private getInnerEl: () => HTMLElement | null

  private pendingAmount = 0
  private appliedDeviation = 0
  private scheduleRafId: number | null = null
  private flushRafId: number | null = null
  private cleanupRafId: number | null = null
  private _isLocked = false

  constructor(
    getScrollerEl: () => HTMLElement | null,
    getInnerEl: () => HTMLElement | null,
  ) {
    this.getScrollerEl = getScrollerEl
    this.getInnerEl = getInnerEl
  }

  get isLocked(): boolean {
    return this._isLocked
  }

  set isLocked(locked: boolean) {
    this._isLocked = locked
  }

  schedule(amount: number): void {
    if (this._isLocked || amount === 0)
      return

    this.pendingAmount += amount

    if (this.scheduleRafId === null) {
      this.scheduleRafId = requestAnimationFrame(() => this.flush())
    }
  }

  private flush(): void {
    this.scheduleRafId = null
    const amount = this.pendingAmount
    this.pendingAmount = 0
    if (amount === 0)
      return

    const innerEl = this.getInnerEl()
    if (!innerEl)
      return

    this.appliedDeviation += amount
    this.applyTransform()

    this.flushRafId = requestAnimationFrame(() => {
      this.flushRafId = null
      const scrollerEl = this.getScrollerEl()
      if (!scrollerEl)
        return

      const deviation = this.appliedDeviation
      scrollerEl.scrollBy({ top: deviation, behavior: 'instant' as ScrollBehavior })
      this.appliedDeviation = 0
      this.applyTransform()

      this.cleanupRafId = requestAnimationFrame(() => {
        this.cleanupRafId = null
        if (this.appliedDeviation === 0) {
          const el = this.getInnerEl()
          if (el)
            el.style.transform = ''
        }
      })
    })
  }

  private applyTransform(): void {
    const el = this.getInnerEl()
    if (!el)
      return

    el.style.transform = this.appliedDeviation !== 0
      ? `translateY(${-this.appliedDeviation}px)`
      : ''
  }

  reset(): void {
    this.pendingAmount = 0
    this.appliedDeviation = 0

    const el = this.getInnerEl()
    if (el)
      el.style.transform = ''

    this.cancelAll()
  }

  destroy(): void {
    this.reset()
  }

  private cancelAll(): void {
    if (this.scheduleRafId !== null) {
      cancelAnimationFrame(this.scheduleRafId)
      this.scheduleRafId = null
    }
    if (this.flushRafId !== null) {
      cancelAnimationFrame(this.flushRafId)
      this.flushRafId = null
    }
    if (this.cleanupRafId !== null) {
      cancelAnimationFrame(this.cleanupRafId)
      this.cleanupRafId = null
    }
  }
}
