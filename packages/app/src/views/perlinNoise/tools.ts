import { PerlinNoise } from './PerlinNoise'

/**
 * 简单的线性同余生成器(LCG)
 */
export function createRandomSeed(seed: number) {
  // Simple LCG (Linear Congruential Generator)
  const a = 1664525
  const c = 1013904223
  const m = 2 ** 32
  let currentSeed = seed % m // Ensure seed is within range
  if (currentSeed <= 0) {
    currentSeed += m // Ensure positive seed if 0 or negative
  }

  return () => {
    currentSeed = (a * currentSeed + c) % m
    return currentSeed / m // Returns value in [0, 1)
  }
}

/**
 * 平滑曲线函数(6t^5 - 15t^4 + 10t^3)
 */
export function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

/**
 * 线性插值
 */
export function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a)
}

// --- 梯度函数(各维度) ---

export function grad1(hash: number, x: number): number {
  return (hash & 1) === 0
    ? x
    : -x
}

export function grad2(hash: number, x: number, y: number): number {
  const h = hash & 3
  switch (h) {
    case 0: return x + y
    case 1: return -x + y
    case 2: return x - y
    case 3: return -x - y
    default: return 0
  }
}

export function grad3(hash: number, x: number, y: number, z: number): number {
  const h = hash & 15
  // Use only the first 12 gradient vectors by taking modulo 12
  const grad = PerlinNoise.GRAD3[h % 12]
  return grad[0] * x + grad[1] * y + grad[2] * z
}
