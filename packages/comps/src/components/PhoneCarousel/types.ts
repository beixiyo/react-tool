/**
 * PhoneCarousel 类型声明
 */

/**
 * 移动端轮播组件属性
 */
export type PhoneCarouselProps = {
  /**
   * 图片高度
   * @default 400
   */
  imgHeight?: number
  /** 是否显示预览图 */
  showPreview?: boolean
  /** 预览图数量 */
  previewCount?: number
  /** 图片数组 */
  imgs: string[]
  /** 自动播放间隔（毫秒），设为0禁用自动播放 */
  autoPlayInterval?: number
  /** 初始图片索引 */
  initialIndex?: number
  /** 标题文本 */
  title?: string
  /** 描述文本 */
  description?: string
  /** 是否显示分享按钮 */
  showShareButton?: boolean
  /** 是否显示关注按钮 */
  showFollowButton?: boolean
  /** 关注按钮文本 */
  followButtonText?: string
  /** 初始点赞数 */
  initialLikeCount?: number
  /** 初始收藏数 */
  initialFavoriteCount?: number
  /** 初始评论数 */
  initialCommentCount?: number
  /** 评论占位文本 */
  commentPlaceholder?: string
  /**
   * 组件整体缩放比例
   * @default 1
   */
  scale?: number
  /**
   * 头部用户名
   * @default '无乐城编织学'
   */
  userName?: string
  /**
   * 头部头像内容（不传则渲染默认渐变圆形占位）
   */
  avatar?: React.ReactNode
  /**
   * 预览图加载失败 / 缺失时的占位图路径
   * @default '/placeholder.svg'
   */
  placeholderSrc?: string
  /**
   * 自定义整个头部区域。传入后将覆盖默认头部（返回按钮 / 头像 / 用户名 / 关注 / 分享）
   */
  headerSlot?: React.ReactNode
}
