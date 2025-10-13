import type { AnimationConfig, CardRenderConfig, DetailModalConfig, FeedItem, SettingsPanelConfig } from './types'

/**
 * 默认卡片渲染配置
 */
export const DEFAULT_CARD_RENDER_CONFIG: Required<CardRenderConfig> = {
  className: '',
  hoverScale: 1.02,
  tapScale: 0.98,
  showAvatar: true,
  showTimestamp: true,
  contentMaxLines: 2,
}

/**
 * 默认动画配置
 *
 * 通过 framer-motion 控制卡片的进入和退出动画，实现流畅的滚动效果
 */
export const DEFAULT_ANIMATION_CONFIG: Required<AnimationConfig> = {
  /**
   * 入场动画初始 Y 偏移（像素）
   *
   * 新卡片从下方（y: 100）向上滑入到正常位置（y: 0）
   * - 正值：从下方进入
   * - 负值：从上方进入
   * @default 100
   */
  initialY: 100,
  /**
   * 入场动画初始缩放比例
   *
   * 配合 Y 轴移动，卡片从 0.8 倍大小渐变到正常大小（1.0）
   * @default 0.8
   */
  initialScale: 0.8,
  /**
   * 入场动画 X 轴旋转角度（度）
   *
   * 卡片带有 15° 的 3D 翻转效果，营造空间感
   * @default 15
   */
  initialRotateX: 15,
  /**
   * 退出动画 Y 偏移（像素）
   *
   * 旧卡片向上滑出（y: -100）并淡出
   * - 负值：向上退出
   * - 正值：向下退出
   * @default -100
   */
  exitY: -100,
  /**
   * 退出动画缩放比例
   *
   * 配合向上移动，卡片缩小到 0.8 倍并消失
   * @default 0.8
   */
  exitScale: 0.8,
  /**
   * 弹簧动画刚度
   *
   * 值越大，弹簧越硬，动画越快速
   * @default 100
   */
  stiffness: 100,
  /**
   * 弹簧动画阻尼
   *
   * 值越大，阻力越大，减少弹跳效果
   * @default 20
   */
  damping: 20,
  /**
   * 弹簧动画质量
   *
   * 影响惯性，值越大越有"重量感"
   * @default 1
   */
  mass: 1,
  /**
   * 退出动画时长（秒）
   *
   * 控制卡片退出的速度，配合缓动曲线实现平滑退出
   * @default 0.5
   */
  exitDuration: 0.5,
}

/**
 * 默认详情弹窗配置
 */
export const DEFAULT_DETAIL_MODAL_CONFIG: Required<DetailModalConfig> = {
  enabled: true,
  backdropClassName: '',
  contentClassName: '',
  initialScale: 0.8,
  initialRotateY: -15,
}

/**
 * 默认设置面板配置
 */
export const DEFAULT_SETTINGS_PANEL_CONFIG: Required<SettingsPanelConfig> = {
  enabled: true,
  position: 'right',
  maxWidth: '420px',
  showSpeedControl: true,
  speedRange: {
    min: 0.2,
    max: 10,
    step: 0.2,
  },
  showAddContent: true,
}

/**
 * 默认主题色列表
 */
export const DEFAULT_COLORS = [
  '#a78bfa',
  '#60a5fa',
  '#f472b6',
  '#34d399',
  '#fbbf24',
  '#fb923c',
  '#f87171',
  '#a855f7',
]

/**
 * 默认标题列表
 */
export const DEFAULT_TITLES = [
  '新产品发布',
  '重要通知',
  '系统更新',
  '用户反馈',
  '活动预告',
  '技术分享',
  '行业动态',
  '热门话题',
]

/**
 * 默认内容列表
 */
export const DEFAULT_CONTENTS = [
  '我们很高兴地宣布推出全新功能，这将大大提升您的使用体验。该功能经过精心设计，充分考虑了用户需求。',
  '系统将在今晚进行维护升级，预计持续2小时。维护期间部分功能可能暂时不可用，请您提前做好准备。',
  '感谢所有用户的宝贵建议！我们已经收集整理，并将在下个版本中实现最受欢迎的功能改进。',
  '本月精彩活动即将开启，丰富奖品等你来拿！活动详情请关注后续推送，不要错过这次机会。',
  '深度解析前端性能优化技巧，从加载速度到用户体验，全方位提升应用表现。包含实战案例分享。',
  '行业最新趋势报告出炉，数据显示市场正在经历重大变革。了解趋势，把握机遇，抢占先机。',
]

/**
 * 默认作者列表
 */
export const DEFAULT_AUTHORS = [
  '张伟',
  '李娜',
  '王芳',
  '刘洋',
  '陈静',
  '杨明',
  '赵丽',
  '周强',
]

/**
 * 生成随机的信息流项
 */
export function generateRandomFeedItem(id: number): FeedItem {
  return {
    id,
    title: DEFAULT_TITLES[Math.floor(Math.random() * DEFAULT_TITLES.length)],
    content: DEFAULT_CONTENTS[Math.floor(Math.random() * DEFAULT_CONTENTS.length)],
    timestamp: new Date().toLocaleTimeString('zh-CN'),
    author: DEFAULT_AUTHORS[Math.floor(Math.random() * DEFAULT_AUTHORS.length)],
    color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
  }
}
