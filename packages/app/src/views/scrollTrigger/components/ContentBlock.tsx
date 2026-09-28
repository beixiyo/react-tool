import { memo } from 'react'

/** 示例内容区块组件 */
export const ContentBlock = memo<{
  id: string
  title: string
  color: string
  height?: number
}>(({
  id,
  title,
  color,
  height = 300,
}) => (
  <div
    id={ id }
    className="relative w-full flex items-center justify-center"
    style={ { height: `${height}px`, backgroundColor: color } }
  >
    <h2 className="text-3xl text-white font-bold">
      { title }
    </h2>
  </div>
))
ContentBlock.displayName = 'ContentBlock'
