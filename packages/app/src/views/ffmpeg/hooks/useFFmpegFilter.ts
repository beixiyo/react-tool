import type { VideoFilterProps } from '../components/VideoFilter'
import type { FilterType } from '../types'
import { blurFilter, coolFilter, drawVideoText, eQFilter, fadeInWithBlack, fisheyeFilter, flipHorizontalFilter, grayscaleFilter, rotateVideo, sharpenFilter, sketchFilter, vintageFilter, warmFilter } from '@/utils'
import { filterNames } from '../constants'

export function useFFmpegFilter(props: Omit<VideoFilterProps, 'className'>) {
  const {
    ffmpeg,
    videoFile,
    onProgress,
    setOperationType,
    onProcessComplete,
    onProcessing,
    onOperationError,
    onOperationMsg,
  } = props

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('eq')
  const [showDrawer, setShowDrawer] = useState(false)

  // EQ 滤镜参数
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(1)
  const [saturation, setSaturation] = useState(1)
  const [gamma, setGamma] = useState(1)

  /** 模糊滤镜参数 */
  const [blurType, setBlurType] = useState<'boxblur' | 'gblur'>('gblur')
  const [blurRadius, setBlurRadius] = useState(5)
  const [blurSigma, setBlurSigma] = useState(2)

  /** 旋转滤镜参数 */
  const [rotateAngle, setRotateAngle] = useState(0)

  /** 文字水印参数 */
  const [watermarkText, setWatermarkText] = useState('水印文字')
  const [fontSize, setFontSize] = useState(24)
  const [fontColor, setFontColor] = useState('#ffffff')
  const [textPosition, setTextPosition] = useState<'center' | 'top' | 'bottom'>('center')

  const handleProcess = async (type?: FilterType) => {
    if (!videoFile || !ffmpeg)
      return

    onProcessing(true)
    try {
      let result: Blob
      setOperationType(filterNames[selectedFilter])
      onProgress?.(0)

      switch (type || selectedFilter) {
        case 'grayscale':
          onOperationMsg?.('正在应用灰度滤镜...')
          result = await grayscaleFilter(ffmpeg, { source: [videoFile], onProgress })
          onOperationMsg?.('已完成灰度滤镜')

          break
        case 'eq':
          onOperationMsg?.('正在应用 EQ 滤镜...')
          result = await eQFilter(ffmpeg, { source: [videoFile], brightness, contrast, saturation, gamma, onProgress })
          onOperationMsg?.('已完成 EQ 滤镜')
          break

        case 'blur':
          onOperationMsg?.('正在应用模糊滤镜...')
          result = await blurFilter(ffmpeg, { source: [videoFile], blurType, radius: blurRadius, sigma: blurSigma, onProgress })
          onOperationMsg?.('已完成模糊滤镜')
          break

        case 'rotate':
          onOperationMsg?.('正在旋转视频...')
          result = await rotateVideo(ffmpeg, { source: [videoFile], angle: rotateAngle, onProgress })
          onOperationMsg?.('已完成旋转视频')
          break

        case 'text':
          onOperationMsg?.('正在添加文字水印...')
          result = await drawVideoText(ffmpeg, {
            source: [videoFile],
            text: watermarkText,
            fontSize,
            fontColor,
            y: textPosition === 'center'
              ? '(h-text_h)/2'
              : textPosition === 'top'
                ? '10'
                : 'h-text_h-10',
            onProgress,
          })
          onOperationMsg?.('已完成添加文字水印')
          break

        case 'cool':
          onOperationMsg?.('正在应用冷色滤镜...')
          result = await coolFilter(ffmpeg, { source: [videoFile], onProgress })
          onOperationMsg?.('已完成冷色滤镜')
          break

        case 'warm':
          onOperationMsg?.('正在应用暖色滤镜...')
          result = await warmFilter(ffmpeg, { source: [videoFile], onProgress })
          onOperationMsg?.('已完成暖色滤镜')
          break

        case 'vintage':
          onOperationMsg?.('正在应用复古滤镜...')
          result = await vintageFilter(ffmpeg, { source: [videoFile], onProgress })
          onOperationMsg?.('已完成复古滤镜')
          break

        case 'sketch':
          onOperationMsg?.('正在应用素描滤镜...')
          result = await sketchFilter(ffmpeg, { source: [videoFile], onProgress })
          onOperationMsg?.('已完成素描滤镜')
          break

        case 'sharp':
          onOperationMsg?.('正在应用锐化滤镜...')
          result = await sharpenFilter(ffmpeg, { source: [videoFile], onProgress })
          onOperationMsg?.('已完成锐化滤镜')
          break

        case 'fisheye':
          onOperationMsg?.('正在应用鱼眼滤镜...')
          result = await fisheyeFilter(ffmpeg, { source: [videoFile], onProgress })
          onOperationMsg?.('已完成鱼眼滤镜')
          break

        case 'horizontalMirror':
          onOperationMsg?.('正在水平镜像视频...')
          result = await flipHorizontalFilter(ffmpeg, { source: [videoFile], onProgress })
          onOperationMsg?.('已完成水平镜像视频')
          break

        case 'fadeIn':
          onOperationMsg?.('正在淡入黑色动画...')
          result = await fadeInWithBlack(ffmpeg, { source: [videoFile], onProgress })
          onOperationMsg?.('已完成淡入黑色动画')
          break

        default:
          throw new Error('未知的滤镜类型')
      }

      onProcessComplete(result)
    }
    catch (error: any) {
      console.error('处理视频时出错:', error)
      onOperationError?.(error?.message || String(error))
    }
    finally {
      onProcessing(false)
    }
  }

  const handleFilterChange = (type: FilterType) => {
    setSelectedFilter(type)
    /** 对于不需要参数的滤镜，直接应用效果 */
    if (['grayscale', 'cool', 'warm', 'vintage', 'sketch', 'sharp', 'fisheye', 'horizontalMirror', 'fadeIn'].includes(type)) {
      handleProcess(type)
    }
    else {
      setShowDrawer(true)
    }
  }

  return {
    selectedFilter,
    handleFilterChange,
    handleProcess,
    showDrawer,
    setShowDrawer,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    saturation,
    setSaturation,
    gamma,
    setGamma,
    blurType,
    setBlurType,
    blurRadius,
    setBlurRadius,
    blurSigma,
    setBlurSigma,
    rotateAngle,
    setRotateAngle,
    watermarkText,
    setWatermarkText,
    fontSize,
    setFontSize,
    fontColor,
    setFontColor,
    textPosition,
    setTextPosition,
  }
}
