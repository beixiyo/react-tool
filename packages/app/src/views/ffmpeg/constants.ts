import type { FilterType } from './types'
import {
  Brush,
  CloudSun,
  Contrast,
  Fan,
  Fish,
  FlipHorizontal,
  PocketKnife,
  RotateCcw,
  Shell,
  Sliders,
  Sun,
  Type,
} from 'lucide-react'

export const filterNames: Record<FilterType, string> = {
  fadeIn: '渐入动画',
  cool: '冷色',
  grayscale: '灰度',
  warm: '暖色',
  vintage: '复古',
  sketch: '素描',
  sharp: '锐化',
  fisheye: '鱼眼',
  horizontalMirror: '水平镜像',
  eq: '调整',
  blur: '模糊',
  rotate: '旋转',
  text: '文字',
}

export const filterIcons: Record<FilterType, React.ElementType> = {
  fadeIn: RotateCcw,
  cool: Fan,
  warm: Sun,
  vintage: CloudSun,
  sketch: Brush,
  sharp: PocketKnife,
  fisheye: Fish,
  horizontalMirror: FlipHorizontal,
  grayscale: Contrast,
  eq: Sliders,
  blur: Shell,
  rotate: RotateCcw,
  text: Type,
}
