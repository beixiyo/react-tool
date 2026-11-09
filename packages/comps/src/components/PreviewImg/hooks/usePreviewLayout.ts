import { useElBounding, useLatestCallback } from 'hooks'
import { useMemo, useRef } from 'react'
import type { ImgThumbnailsOrientation } from '../../ImgThumbnails/types'
import { PREVIEW_ARROW_SIZE, PREVIEW_CLOSE_SIZE, PREVIEW_SAFE_GAP as SAFE_GAP } from '../layoutConstants'
import type { PreviewImgProps } from '../types'

/** 一个浮层实际占掉的空间：自身尺寸 + 一个安全间距；没有浮层则不占 */
function band(size: number) {
  return size > 0
    ? size + SAFE_GAP
    : 0
}

export function usePreviewLayout(
  { thumbnailPlacement, orientation, showThumbnails, showNavArrows, imageCount }:
    & Pick<PreviewImgProps, 'thumbnailPlacement' | 'orientation' | 'showThumbnails' | 'showNavArrows'>
    & {
      imageCount: number
    },
) {
  const placement = thumbnailPlacement ?? (orientation === 'vertical'
    ? 'right'
    : 'top')
  const thumbnailsOrientation: ImgThumbnailsOrientation = placement === 'left' || placement === 'right'
    ? 'vertical'
    : 'horizontal'
  const showThumbnailList = showThumbnails && imageCount > 1

  /**
   * 工具栏与缩略图都是 fixed 浮层，大图在遮罩里居中，彼此不知道对方多大，
   * 所以实测两者的尺寸（内容可被外部替换，写死高度必然失真），再从大图的可用空间里减掉
   */
  const thumbnailsRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const thumbnailsSize = useElBounding(thumbnailsRef)
  const toolbarSize = useElBounding(toolbarRef)

  /**
   * 预览挂在 Portal 里，首帧 ref 还是空的，useElBounding 的首次测量会落空且不再重跑，
   * 所以用回调 ref：DOM 一挂上就立刻量一次，首屏大图才会正确让位
   */
  const bindThumbnails = useLatestCallback((node: HTMLDivElement | null) => {
    thumbnailsRef.current = node
    if (node) thumbnailsSize.update()
  })

  const bindToolbar = useLatestCallback((node: HTMLDivElement | null) => {
    toolbarRef.current = node
    if (node) toolbarSize.update()
  })

  const toolbarBand = band(toolbarSize.height)

  /** 缩略图也贴底时要叠在工具栏之上，否则两个浮层挤在一起 */
  const thumbnailsStyle = useMemo(() => (placement === 'bottom'
    ? { bottom: SAFE_GAP + toolbarBand }
    : undefined), [placement, toolbarBand])

  const insets = useMemo(() => {
    const thumbnailBand = showThumbnailList
      ? band(
        thumbnailsOrientation === 'vertical'
          ? thumbnailsSize.width
          : thumbnailsSize.height,
      )
      : 0

    const arrowBand = showNavArrows && imageCount > 1
      ? band(PREVIEW_ARROW_SIZE)
      : 0

    return {
      /** 关闭按钮与顶端缩略图分别占据同一边的空间，取较大值 */
      top: SAFE_GAP + Math.max(
        band(PREVIEW_CLOSE_SIZE),
        placement === 'top'
          ? thumbnailBand
          : 0,
      ),
      bottom: SAFE_GAP + toolbarBand + (placement === 'bottom'
        ? thumbnailBand
        : 0),
      left: SAFE_GAP + Math.max(
        arrowBand,
        placement === 'left'
          ? thumbnailBand
          : 0,
      ),
      right: SAFE_GAP + Math.max(
        arrowBand,
        placement === 'right'
          ? thumbnailBand
          : 0,
      ),
    }
  }, [placement, showThumbnailList, thumbnailsOrientation, thumbnailsSize, toolbarBand, showNavArrows, imageCount])

  return { placement, thumbnailsOrientation, showThumbnailList, bindThumbnails, bindToolbar, thumbnailsStyle, insets }
}
