import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import { createFFmpeg, disposeFFmpeg } from './compatible'

export function useFFmpeg() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const ffmpegRef = useRef<FFmpeg | null>(null)

  const reload = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      /** 先终止旧的实例 */
      ffmpegRef.current && disposeFFmpeg(ffmpegRef.current)

      /** 创建新实例 */
      const newFFmpeg = await loadFFmpeg()
      ffmpegRef.current = newFFmpeg
      setLoading(false)
    }
    catch (err) {
      setError(err instanceof Error
        ? err
        : new Error('加载 FFmpeg 失败'))
      setLoading(false)
      console.error(err)
    }
  }, [])

  useEffect(() => {
    reload()
    return () => {
      ffmpegRef.current && disposeFFmpeg(ffmpegRef.current)
    }
  }, [reload])

  return {
    ffmpeg: ffmpegRef.current,
    loading,
    error,
    reload,
  }
}

export async function loadFFmpeg() {
  /**
   * @version 0.11.6
   * @module UMD
   *
   * @link 核心包 https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js
   * @link worker https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.worker.js
   * @link wasm https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.wasm
   */
  // const ffmpegInstance = await createFFmpeg({
  //   log: true,
  //   corePath: new URL('/ffmpeg-umd@0.11.0/core.js', import.meta.url).href,
  //   wasmPath: new URL('/ffmpeg-umd@0.11.0/core.wasm', import.meta.url).href,
  //   workerPath: new URL('/ffmpeg-umd@0.11.0/worker.js', import.meta.url).href,
  // })

  // return ffmpegInstance

  /**
   * worker 需要版本:
   * - @ffmpeg/ffmpeg@0.12.6+
   * - @ffmpeg/core@0.12.4+
   *
   * @version 0.12.10
   * @module ESM
   *
   * ## core-mt 代表多线程版本，需要 workerURL，如果是单线程版本，workerURL 不需要
   * @link 核心包 https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm/ffmpeg-core.js
   * @link worker https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm/ffmpeg-core.worker.js
   * @link wasm https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm/ffmpeg-core.wasm
   *
   * @link 文档 https://ffmpegwasm.netlify.app/docs/getting-started/usage
   * @example https://ffmpegwasm.netlify.app/docs/getting-started/examples
   */
  const ffmpegInstance = await createFFmpeg({
    /**
     * 多线程版本
     */
    // coreURL: await toBlobURL(new URL('/ffmpeg-esm-core-mt@0.12.10/core.js', import.meta.url).href, 'text/javascript'),
    // wasmURL: await toBlobURL(new URL('/ffmpeg-esm-core-mt@0.12.10/core.wasm', import.meta.url).href, 'application/wasm'),
    // workerURL: await toBlobURL(new URL('/ffmpeg-esm-core-mt@0.12.10/worker.js', import.meta.url).href, 'text/javascript'),

    /**
     * 单线程版本
     */
    coreURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js', 'text/javascript'),
    wasmURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm', 'application/wasm'),
  })

  ffmpegInstance.on('log', (log) => {
    console.log(log.message)
  })

  return ffmpegInstance
}
