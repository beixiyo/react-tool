/**
 * 把 AnalyserNode 的频域数据归一化成 0-1 的音量强度
 *
 * 供光效、电平条等「按响度改变外观」的组件使用；波形绘制走各自的逐柱映射，不用这里
 */

import type { Recorder } from '@jl-org/tool'

/**
 * 只取低频段参与计算
 *
 * 人声基频与主要谐波集中在低频端，而 `frequencyBinCount` 覆盖到采样率的一半（常见 22kHz）
 * 把整条频谱一起平均会被大片接近静默的高频拖平，说话与不说话的差值只剩几个点，光效几乎不动
 */
const SPEECH_BAND_RATIO = 0.35

/** 低于此均值视为静默：麦克风底噪与环境声长期在此之下，不该让光效一直亮着 */
const SILENCE_FLOOR = 0.02

/**
 * 映射到满强度的均值
 *
 * 正常说话的频段均值远达不到 1（那是全频段削顶），取 0.55 作满量程，
 * 常规音量说话即可覆盖大半区间，喊话时才顶到 1
 */
const FULL_SCALE_AVERAGE = 0.55

/**
 * @param data `getByteFrequencyData` 的输出，空数据按静默处理
 * @returns 0-1 的归一化强度
 */
export function normalizeAudioLevel(data: Uint8Array | null | undefined): number {
  if (!data?.length) return 0

  const bandEnd = Math.max(1, Math.floor(data.length * SPEECH_BAND_RATIO))

  let sum = 0
  for (let i = 0; i < bandEnd; i++) {
    sum += data[i]
  }

  const average = sum / bandEnd / 255
  if (average <= SILENCE_FLOOR) return 0

  const scaled = (average - SILENCE_FLOOR) / (FULL_SCALE_AVERAGE - SILENCE_FLOOR)
  return Math.min(1, scaled)
}

/**
 * 造一个音量读取器，每次调用返回当前的归一化音量（0-1）
 *
 * 收 getter 而不是收 recorder 实例：录音器在一轮会话里会被销毁重建，
 * 攥着旧实例会一直读到已断开的 analyser，光效就此卡死不动
 *
 * @param getRecorder 读取当前录音器，尚未就位时返回 null
 */
export function createAudioLevelReader(getRecorder: () => Recorder | null): () => number {
  /** 缓冲跟着读取器走：采样是持续跑的，每次新建数组等于每次都在造垃圾 */
  let buffer: Uint8Array<ArrayBuffer> | null = null

  return () => {
    const recorder = getRecorder()
    if (!recorder?.analyser) return 0

    if (buffer?.length !== recorder.analyser.frequencyBinCount) {
      buffer = new Uint8Array(recorder.analyser.frequencyBinCount)
    }

    return normalizeAudioLevel(recorder.getByteFrequencyData(buffer))
  }
}
