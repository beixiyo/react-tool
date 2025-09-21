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
  uploader: 'form',
  slider: 'form',
  chatinput: 'form',
  searchbar: 'form',
  steps: 'form',

  // ========== 功能性组件 ==========
  button: 'functional',
  badge: 'functional',
  dropdown: 'functional',
  menu: 'functional',
  message: 'functional',
  modal: 'functional',
  pagination: 'functional',
  progress: 'functional',
  tabs: 'functional',
  tooltip: 'functional',
  tourguide: 'functional',
  loading: 'functional',
  icon: 'functional',
  rmbtn: 'functional',
  navbar: 'functional',
  arrow: 'functional',
  countdownring: 'functional',

  // ========== 布局相关组件 ==========
  card: 'layout',
  drawer: 'layout',
  popover: 'layout',
  sidebar: 'layout',
  keepalive: 'layout',
  splitline: 'layout',
  slot: 'layout',
  border: 'layout',
  gridbg: 'layout',
  phoneframe: 'layout',
  pixelstyle: 'layout',
  resizable: 'layout',

  // ========== 动画效果组件 ==========
  animate: 'animation',
  aurora: 'animation',
  autoscrollanimate: 'animation',
  bgpaths: 'animation',
  carousel: 'animation',
  carousel3d: 'animation',
  flipitem: 'animation',
  heroentertext: 'animation',
  imgtransition: 'animation',
  liquidglass: 'animation',
  textfadein: 'animation',
  textreveal: 'animation',
  transitionitem: 'animation',
  seamlessscroll: 'animation',
  typewriter: 'animation',
  gradienttext: 'animation',
  glowclock: 'animation',
  dybgc: 'animation',
  blurbgimg: 'animation',

  // ========== 高级功能组件 ==========
  codemirroreditor: 'advanced',
  mdeditor: 'advanced',
  htmlpreview: 'advanced',
  moveable: 'advanced',
  sortable: 'advanced',
  videotimeline: 'advanced',
  virtualizedmarkdown: 'advanced',
  virtualscroll: 'advanced',
  virtualwaterfall: 'advanced',
  virtualdyscroll: 'advanced',
  infinitescroll: 'advanced',
  lazyimg: 'advanced',
  pagesnapshots: 'advanced',
  smartselection: 'advanced',
  noteboard: 'advanced',
  cutoutimg: 'advanced',
  discount: 'advanced',
  macrabdot: 'advanced',
  mask: 'advanced',
  previewimg: 'advanced',
  retryimg: 'advanced',
  textoverflow: 'advanced',
  landing: 'advanced',

  // ========== 完整页面 ==========
  aisnake: 'pages',
  canvascomposite: 'pages',
  chat: 'pages',
  fabriceditor: 'pages',
  ffmpeg: 'pages',
  i18n: 'pages',
  motionprinciples: 'pages',
  perlinnoise: 'pages',
  pricing: 'pages',
  pyramidingtradingcalc: 'pages',
  scrollanimate: 'pages',
  scrolltrigger: 'pages',
  starport: 'pages',
  trainmodel: 'pages',
  usegetstatetest: 'pages',
  zoomcvs: 'pages',
}
