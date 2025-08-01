import { createRandomSeed, fade, grad1, grad2, grad3, lerp } from './tools'

/**
 * Implements 1D, 2D, and 3D Perlin Noise algorithms.
 */
export class PerlinNoise {
  seedValue: number | undefined

  // --- Private Members ---
  private p: number[] = [] // Permutation table (doubled)
  private randomFunc: () => number // The PRNG function in use

  // Gradient vectors (static for efficiency)
  static readonly GRAD3: ReadonlyArray<readonly [number, number, number]> = [
    [1, 1, 0],
    [-1, 1, 0],
    [1, -1, 0],
    [-1, -1, 0],

    [1, 0, 1],
    [-1, 0, 1],
    [1, 0, -1],
    [-1, 0, -1],

    [0, 1, 1],
    [0, -1, 1],
    [0, 1, -1],
    [0, -1, -1],
  ] as const

  constructor(opts: PerlinNoiseOpts = {}) {
    const defaultSeed = Date.now()
    this.seedValue = opts.seed ?? defaultSeed // Store the seed used/provided

    if (opts.randomFunction) {
      this.randomFunc = opts.randomFunction
    }
    else {
      this.randomFunc = createRandomSeed(this.seedValue)
    }

    this.generatePermutationTable() // Initialize permutation table
  }

  reseed(newSeed: number): void {
    this.seedValue = newSeed
    this.generatePermutationTable()
  }

  // --- Private: Permutation Table Generation ---

  /**
   * 使用Fisher-Yates洗牌算法生成排列表
   */
  private generatePermutationTable(): void {
    this.p = new Array(512)
    const permutation = Array.from({ length: 256 }, (_, i) => i)

    /** 洗牌 */
    for (let i = permutation.length - 1; i > 0; i--) {
      const j = Math.floor(this.randomFunc() * (i + 1));
      [permutation[i], permutation[j]] = [permutation[j], permutation[i]]
    }

    /** 双倍长度排列表(避免模运算) */
    for (let i = 0; i < 256; i++) {
      this.p[i] = this.p[i + 256] = permutation[i]
    }
  }

  // --- Noise Functions ---

  /**
   * 计算给定坐标的1D Perlin噪声值
   * @param x 输入坐标
   * @returns 归一化到[0,1]范围的噪声值
   */
  noise1D(x: number): number {
    const X = Math.floor(x) & 255 // 整数部分(0-255)，这相当于 x % 256（取模256）
    const xf = x - Math.floor(x) // 小数部分
    const u = fade(xf) // 平滑曲线

    if (!this.p || this.p.length !== 512) {
      console.error('PerlinNoise Error: Permutation table not initialized correctly.')
      this.generatePermutationTable()
      if (!this.p || this.p.length !== 512)
        return 0
    }

    const p = this.p
    const g1 = grad1(p[X], xf)
    const g2 = grad1(p[X + 1], xf - 1)

    /** 归一化到[0,1] */
    return lerp(g1, g2, u) * 0.5 + 0.5
  }

  /**
   * 计算给定坐标的2D Perlin噪声值
   * @param x x坐标
   * @param y y坐标
   * @returns 归一化到[0,1]范围的噪声值
   */
  noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255 // 整数部分(0-255)
    const Y = Math.floor(y) & 255
    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)
    const u = fade(xf)
    const v = fade(yf)

    if (!this.p || this.p.length !== 512) {
      console.error('PerlinNoise Error: Permutation table not initialized correctly.')
      this.generatePermutationTable()
      if (!this.p || this.p.length !== 512)
        return 0
    }

    const p = this.p
    const A = p[X] + Y
    const B = p[X + 1] + Y

    const aa = p[p[A] & 255] // Ensure indices are wrapped if p[A] is > 255
    const ab = p[p[A + 1] & 255] // Accessing p[512] is okay due to doubling, but p[A+1] might be > 255
    const ba = p[p[B] & 255]
    const bb = p[p[B + 1] & 255]

    const dotAA = grad2(aa, xf, yf)
    const dotBA = grad2(ba, xf - 1, yf)
    const dotAB = grad2(ab, xf, yf - 1)
    const dotBB = grad2(bb, xf - 1, yf - 1)

    const lerpX1 = lerp(dotAA, dotBA, u)
    const lerpX2 = lerp(dotAB, dotBB, u)
    const result = lerp(lerpX1, lerpX2, v)

    // Original range approx [-sqrt(2)/2, sqrt(2)/2] ~= [-0.707, 0.707]
    // Normalize to [0, 1]
    return (result + Math.sqrt(2) / 2) / Math.sqrt(2)
    // Simpler normalization (result + 1) / 2 also works, range approx [0.15, 0.85]
    // return (result + 1) / 2;
  }

  /**
   * 计算给定坐标的3D Perlin噪声值
   * @param x x坐标
   * @param y y坐标
   * @param z z坐标
   * @returns 归一化到[0,1]范围的噪声值
   */
  noise3D(x: number, y: number, z: number): number {
    const X = Math.floor(x) & 255 // 整数部分(0-255)
    const Y = Math.floor(y) & 255
    const Z = Math.floor(z) & 255
    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)
    const zf = z - Math.floor(z)
    const u = fade(xf)
    const v = fade(yf)
    const w = fade(zf)

    if (!this.p || this.p.length !== 512) {
      console.error('PerlinNoise Error: Permutation table not initialized correctly.')
      this.generatePermutationTable()
      if (!this.p || this.p.length !== 512)
        return 0
    }

    const p = this.p
    const A = p[X] + Y
    const B = p[X + 1] + Y
    // Need to handle index wrapping carefully for 3D
    const AA = p[A & 255] + Z
    const BA = p[B & 255] + Z
    const AB = p[(A + 1) & 255] + Z // Use A+1 before accessing p
    const BB = p[(B + 1) & 255] + Z // Use B+1 before accessing p

    const aaa = p[AA & 255]
    const baa = p[BA & 255]
    const aba = p[AB & 255]
    const bba = p[BB & 255]
    const aab = p[(AA + 1) & 255]
    const bab = p[(BA + 1) & 255]
    const abb = p[(AB + 1) & 255]
    const bbb = p[(BB + 1) & 255]

    const dotAAA = grad3(aaa, xf, yf, zf)
    const dotBAA = grad3(baa, xf - 1, yf, zf)
    const dotABA = grad3(aba, xf, yf - 1, zf)
    const dotBBA = grad3(bba, xf - 1, yf - 1, zf)
    const dotAAB = grad3(aab, xf, yf, zf - 1)
    const dotBAB = grad3(bab, xf - 1, yf, zf - 1)
    const dotABB = grad3(abb, xf, yf - 1, zf - 1)
    const dotBBB = grad3(bbb, xf - 1, yf - 1, zf - 1)

    const lerpX1 = lerp(dotAAA, dotBAA, u)
    const lerpX2 = lerp(dotABA, dotBBA, u)
    const lerpX3 = lerp(dotAAB, dotBAB, u)
    const lerpX4 = lerp(dotABB, dotBBB, u)

    const lerpY1 = lerp(lerpX1, lerpX2, v)
    const lerpY2 = lerp(lerpX3, lerpX4, v)

    const result = lerp(lerpY1, lerpY2, w)

    // Original range approx [-sqrt(3)/2, sqrt(3)/2] ~= [-0.866, 0.866]
    // Normalize to [0, 1]
    return (result + Math.sqrt(3) / 2) / Math.sqrt(3)
    // Simpler normalization (result + 1) / 2 also works, range approx [0.07, 0.93]
    // return (result + 1) / 2;
  }
}

export type PerlinNoiseOpts = {
  /**
   * The seed for the pseudo-random number generator used to create the permutation table.
   * Providing the same seed will always produce the same noise pattern for the same inputs.
   * @default Date.now() // Uses the current time if no seed is provided.
   */
  seed?: number

  /**
   * An optional custom pseudo-random number generator function.
   * If provided, it overrides the internal seeded LCG and the `seed` option is ignored for generation,
   * though the provided seed value might still be stored internally for reference.
   * The function should return numbers in the range [0, 1).
   * @default Internal Linear Congruential Generator (LCG) based on the 'seed' option, or Math.random() if no seed given.
   */
  randomFunction?: () => number
}
