/* eslint-disable no-restricted-globals */
import type { NoiseGenerationParams } from '@/views/perlinNoise'
import { PerlinNoise } from '@/views/perlinNoise/PerlinNoise'

const perlin = new PerlinNoise()

/** 更复杂的颜色映射 (示例) */
const colorStops: { value: number, color: RGBColor }[] = [
  { value: 0.0, color: [0, 0, 80] }, // 深水区
  { value: 0.25, color: [0, 50, 150] }, // 中等水深
  { value: 0.4, color: [60, 120, 180] }, // 浅水/海岸线
  { value: 0.45, color: [210, 200, 150] }, // 沙滩
  { value: 0.55, color: [90, 160, 70] }, // 草地
  { value: 0.65, color: [60, 130, 50] }, // 森林
  { value: 0.75, color: [140, 130, 120] }, // 岩石
  { value: 0.85, color: [180, 180, 180] }, // 高山岩石
  { value: 1.0, color: [240, 240, 245] }, // 雪顶
]

self.onmessage = (event: MessageEvent) => {
  const params = event.data as NoiseGenerationParams

  // Update seed if provided
  if (params.seed !== undefined) {
    console.log(`Worker: Received request to reseed with ${params.seed}`)
    perlin.reseed(params.seed)
  }

  const generationWidth = params.width
  const generationHeight = params.height

  try {
    const noiseData = generateNoiseData(params)
    self.postMessage(
      {
        pixelData: noiseData.buffer,
        width: generationWidth,
        height: generationHeight,
      },
      // @ts-ignore
      [noiseData.buffer],
    )
  }
  catch (error: any) {
    console.error('Worker error during noise generation:', error)
    self.postMessage({
      error: error.message,
      width: params.width,
      height: params.height,
    })
  }
}

console.log('Noise worker initialized.') // Log worker start

/**
 * 颜色插值
 */
function lerpColor(color1: RGBColor, color2: RGBColor, t: number): RGBColor {
  t = Math.max(0, Math.min(1, t))
  return [
    Math.floor(color1[0] + (color2[0] - color1[0]) * t),
    Math.floor(color1[1] + (color2[1] - color1[1]) * t),
    Math.floor(color1[2] + (color2[2] - color1[2]) * t),
  ]
}

/**
 * 根据噪声值获取颜色
 */
function getColorFromValue(value: number): RGBColor {
  value = Math.max(0, Math.min(1, value))

  for (let i = 0; i < colorStops.length - 1; i++) {
    const stop1 = colorStops[i]
    const stop2 = colorStops[i + 1]
    if (value >= stop1.value && value <= stop2.value) {
      const t = stop2.value === stop1.value
        ? 0
        : (value - stop1.value) / (stop2.value - stop1.value)
      return lerpColor(stop1.color, stop2.color, t)
    }
  }
  return colorStops[colorStops.length - 1].color
}

function generateNoiseData(params: NoiseGenerationParams): Uint8ClampedArray {
  const { width, height, scale, octaves, persistence, lacunarity, offsetX, offsetY, offsetZ, dimension } = params
  const data = new Uint8ClampedArray(width * height * 4)

  /** 计算最大可能的噪声值用于归一化 */
  let maxNoiseValuePossible = 0
  let amp = 1.0
  for (let i = 0; i < octaves; i++) {
    maxNoiseValuePossible += amp
    amp *= persistence
  }
  const normalizationFactor = maxNoiseValuePossible > 0
    ? maxNoiseValuePossible
    : 1

  /** 遍历每个像素生成噪声 */
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let totalNoise = 0
      let currentAmplitude = 1.0
      let currentFrequency = 1.0 / scale

      /** 分形布朗运动(fBm) - 多倍频叠加 */
      for (let i = 0; i < octaves; i++) {
        const nx = (x + offsetX) * currentFrequency
        const ny = (y + offsetY) * currentFrequency
        const nz = offsetZ * currentFrequency // Always calculate Z for 3D

        let noiseVal = 0
        // Choose noise function based on dimension param
        if (dimension === '1D') {
          // For 1D visualization on 2D canvas, map x coordinate to noise input
          noiseVal = perlin.noise1D(nx)
        }
        else if (dimension === '3D') {
          noiseVal = perlin.noise3D(nx, ny, nz)
        }
        else { // Default to 2D
          noiseVal = perlin.noise2D(nx, ny)
        }

        // Accumulate noise; Perlin functions already return ~[0, 1]
        totalNoise += noiseVal * currentAmplitude

        currentAmplitude *= persistence
        currentFrequency *= lacunarity
      }

      // Normalize the fBm sum based on max possible amplitude
      let normalizedNoise = totalNoise / normalizationFactor
      normalizedNoise = Math.max(0, Math.min(1, normalizedNoise)) // Clamp final result

      // --- Color Mapping ---
      const [r, g, b] = getColorFromValue(normalizedNoise)

      const index = (y * width + x) * 4
      data[index] = r
      data[index + 1] = g
      data[index + 2] = b
      data[index + 3] = 255 // Alpha
    }
  }

  return data
}

type RGBColor = [number, number, number]
