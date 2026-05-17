/**
 * Fenwick Binary Indexed Tree 实现的偏移索引，所有查询/更新 O(log n)
 *
 * @see {@link https://github.com/Luccas-carvalho/react-anchorlist | react-anchorlist} — OffsetMap 设计参照
 */
export class OffsetMap {
  sizes: number[]
  private bit: number[]
  private n: number
  private defaultSize: number

  constructor(defaultSize: number) {
    this.defaultSize = defaultSize
    this.sizes = []
    this.bit = [0]
    this.n = 0
  }

  private build(): void {
    this.n = this.sizes.length
    this.bit = new Array(this.n + 1).fill(0)
    for (let i = 1; i <= this.n; i++) {
      this.bit[i] = this.sizes[i - 1]
    }
    for (let i = 1; i <= this.n; i++) {
      const j = i + (i & -i)
      if (j <= this.n)
        this.bit[j] += this.bit[i]
    }
  }

  private query(i: number): number {
    let sum = 0
    for (let x = i; x > 0; x -= x & -x) {
      sum += this.bit[x]
    }
    return sum
  }

  private pointUpdate(pos: number, delta: number): void {
    for (let x = pos; x <= this.n; x += x & -x) {
      this.bit[x] += delta
    }
  }

  reset(count: number, getSize?: (index: number) => number): void {
    this.sizes = Array.from(
      { length: count },
      (_, i) => getSize?.(i) ?? this.defaultSize,
    )
    this.build()
  }

  getOffset(index: number): number {
    if (index <= 0)
      return 0
    if (index > this.n)
      return this.query(this.n)
    return this.query(index)
  }

  getSize(index: number): number {
    if (index < 0 || index >= this.n)
      return this.defaultSize
    return this.sizes[index]
  }

  setSize(index: number, newSize: number): number {
    if (index < 0 || index >= this.n)
      return 0
    const delta = newSize - this.sizes[index]
    if (delta === 0)
      return 0
    this.sizes[index] = newSize
    this.pointUpdate(index + 1, delta)
    return delta
  }

  getTotalSize(): number {
    return this.query(this.n)
  }

  /**
   * BIT 二分下降 — O(log n) 查找 px 偏移对应的 item index
   */
  findIndexAtOffset(px: number): number {
    if (this.n === 0)
      return 0
    if (px <= 0)
      return 0
    if (px >= this.getTotalSize())
      return this.n - 1

    let idx = 0
    let remaining = px

    let pw = 1
    while (pw <= this.n) pw <<= 1
    pw >>= 1

    for (; pw > 0; pw >>= 1) {
      const next = idx + pw
      if (next <= this.n && this.bit[next] <= remaining) {
        idx = next
        remaining -= this.bit[idx]
      }
    }

    return Math.min(idx, this.n - 1)
  }

  get length(): number {
    return this.n
  }
}
