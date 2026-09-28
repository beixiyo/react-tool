export type Step = {
  title: string
  description: string
  links?: string[]
  image?: string
}

export type GuideProps = {
  steps: Step[]
  onClose?: () => void
  isOpen: boolean
  className?: string
  /**
   * 上一步按钮文案
   * @default '上一步'
   */
  prevText?: React.ReactNode
  /**
   * 下一步按钮文案
   * @default '下一步'
   */
  nextText?: React.ReactNode
  /**
   * 复制链接成功后的提示文案，仅在未传入 onLinkClick 时使用
   * @default '链接已复制'
   */
  copySuccessText?: string
  /**
   * 点击链接的回调。传入后将覆盖默认的「复制 + Toast」行为
   */
  onLinkClick?: (link: string) => void
  /**
   * 图片区域高度（Tailwind 类名）
   * @default 'h-72'
   */
  imageHeight?: string
  /**
   * 从关闭切换到打开时是否重置到第一步
   * @default true
   */
  resetOnOpen?: boolean
}
