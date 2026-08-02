/**
 * 页面分类映射表
 *
 * 定义了所有可用的页面分类，用于筛选和展示
 */
export const CATEGORIES = {
  /** 全部页面 */
  全部: 'all',
  /** 表单相关组件 */
  表单: 'form',
  /** 功能性组件 */
  功能: 'functional',
  /** 布局相关组件 */
  布局: 'layout',
  /** 动画效果组件 */
  动画: 'animation',
  /** 高级功能组件 */
  高级: 'advanced',
  /** 完整页面 */
  页面: 'pages',
} as const

/** 分类键名类型 */
export type CategoryKey = keyof typeof CATEGORIES
/** 分类值类型 */
export type CategoryValue = (typeof CATEGORIES)[keyof typeof CATEGORIES]

/**
 * 组件分类映射表
 *
 * 将具体的组件/页面名称映射到对应的分类
 * 用于自动分类和筛选功能
 */
export const COMPONENT_CATEGORIES: Record<string, CategoryValue> = {
  // ========== 表单相关组件 ==========
  form: 'form',
  input: 'form',
  textarea: 'form',
  checkbox: 'form',
  radio: 'form',
  switch: 'form',
  select: 'form',
  chatInput: 'form',
  searchBar: 'form',
  steps: 'form',
  uploader: 'form',
  slider: 'form',

  // ========== 功能性组件 ==========
  audio: 'functional',
  button: 'functional',
  badge: 'functional',
  cascader: 'functional',
  dropdown: 'functional',
  keyboardLayer: 'functional',
  contextMenu: 'functional',
  copy: 'functional',
  message: 'functional',
  taskBanner: 'functional',
  modal: 'functional',
  pagination: 'functional',
  progress: 'functional',
  tabs: 'functional',
  tooltip: 'functional',
  tourGuide: 'functional',
  loading: 'functional',
  icon: 'functional',
  closeBtn: 'functional',
  navbar: 'functional',
  arrow: 'functional',
  announcementbar: 'functional',
  countdownBorder: 'functional',
  countdownRing: 'functional',
  pageSwiper: 'functional',
  notification: 'functional',
  phoneCarousel: 'functional',
  separator: 'functional',
  stackButton: 'functional',
  table: 'functional',
  themeToggle: 'functional',
  toolbar: 'functional',

  // ========== 布局相关组件 ==========
  card: 'layout',
  drawer: 'layout',
  popover: 'layout',
  sidebar: 'layout',
  keepalive: 'layout',
  slot: 'layout',
  border: 'layout',
  gridbg: 'layout',
  phoneFrame: 'layout',
  pixelStyle: 'layout',
  splitPane: 'layout',
  spacer: 'layout',

  // ========== 动画效果组件 ==========
  animate: 'animation',
  aurora: 'animation',
  autoScrollAnimate: 'animation',
  bgPaths: 'animation',
  carousel: 'animation',
  carousel3d: 'animation',
  flipItem: 'animation',
  heroEnterText: 'animation',
  imgTransition: 'animation',
  liquidGlass: 'animation',
  textFadeIn: 'animation',
  textReveal: 'animation',
  transitionItem: 'animation',
  seamlessScroll: 'animation',
  typewriter: 'animation',
  gradientText: 'animation',
  glowClock: 'animation',
  dyBgc: 'animation',
  blurBgImg: 'animation',
  gradientBoundary: 'animation',
  imgThumbnails: 'animation',
  liveWaveAudio: 'animation',
  skeleton: 'animation',
  scrollCarousel: 'animation',
  scrollReveal: 'animation',
  splitText: 'animation',

  // ========== 高级功能组件 ==========
  codeMirrorEditor: 'advanced',
  mdEditor: 'advanced',
  htmlPreview: 'advanced',
  moveable: 'advanced',
  sortable: 'advanced',
  videoTimeline: 'advanced',
  virtualizedMarkdown: 'advanced',
  virtualScroll: 'advanced',
  virtualWaterfall: 'advanced',
  virtualDyScroll: 'advanced',
  tanstackVirtual: 'advanced',
  infiniteScroll: 'advanced',
  lazyimg: 'advanced',
  pageSnapshots: 'advanced',
  smartSelection: 'advanced',
  noteBoard: 'advanced',
  cutoutImg: 'advanced',
  discount: 'advanced',
  titleBarButtons: 'functional',
  mask: 'advanced',
  previewImg: 'advanced',
  retryImg: 'advanced',
  textOverflow: 'advanced',
  landing: 'advanced',

  // ========== 完整页面 ==========
  aiSnake: 'pages',
  canvasComposite: 'pages',
  chat: 'pages',
  fabricEditor: 'pages',
  ffmpeg: 'pages',
  i18n: 'pages',
  motionPrinciples: 'pages',
  perlinNoise: 'pages',
  pricing: 'pages',
  pyramidingTradingCalc: 'pages',
  scrollAnimate: 'pages',
  scrollTrigger: 'pages',
  starport: 'pages',
  trainModel: 'pages',
  useGetStateTest: 'pages',
  zoomCvs: 'pages',
}
