import type { ComponentInfo } from './getPageSnaps'

/**
 * 页面信息接口
 */
export interface PageInfo {
  /** 页面路径 */
  path: string
  /** 页面名称/标题 */
  name: string
  /** 页面描述 */
  description?: string
  /** 页面类型 */
  type: 'view' | 'component'
  /** 页面分类 */
  category?: string
}

/**
 * 自动扫描并获取所有测试页面信息
 */
export async function getAllPageInfo(): Promise<PageInfo[]> {
  const pages: PageInfo[] = []

  /** 获取所有 views 页面 */
  const viewModules = import.meta.glob('/src/views/**/index.tsx')
  for (const path in viewModules) {
    const routePath = path
      .replace('/src/views', '')
      .replace('/index.tsx', '')
      .replace(/\/+/g, '/') || '/'

    /** 跳过根路径，因为它会重定向 */
    if (routePath === '/')
      continue

    const name = getPageNameFromPath(routePath, 'view')
    pages.push({
      path: routePath,
      name,
      type: 'view',
      category: getPageCategory(routePath),
      description: `${name} 页面展示`,
    })
  }

  /** 获取所有 components 测试页面 */
  const componentModules = import.meta.glob('/src/components/**/Test.tsx')
  for (const path in componentModules) {
    const routePath = path
      .replace('/src/components', '')
      .replace('/Test.tsx', '')
      .replace(/\/+/g, '/') || '/'

    const name = getPageNameFromPath(routePath, 'component')
    pages.push({
      path: routePath,
      name,
      type: 'component',
      category: 'Components',
      description: `${name} 组件演示`,
    })
  }

  return pages.sort((a, b) => {
    /** 先按类型排序，views 在后 */
    if (a.type !== b.type) {
      return a.type === 'component'
        ? -1
        : 1
    }
    /** 再按名称排序 */
    return a.path.localeCompare(b.path)
  })
}

/**
 * 将页面信息转换为截图组件信息
 */
export function pageInfoToComponentInfo(pageInfo: PageInfo): ComponentInfo {
  return {
    path: pageInfo.path,
    name: pageInfo.name,
    delay: 300, // 默认延迟300ms等待页面渲染完成
  }
}

/**
 * 批量将页面信息转换为截图组件信息
 */
export function pageInfosToComponentInfos(pageInfos: PageInfo[]): ComponentInfo[] {
  return pageInfos.map(pageInfoToComponentInfo)
}

/**
 * 从路径中提取页面名称
 */
function getPageNameFromPath(path: string, type: 'view' | 'component'): string {
  /** 移除开头的斜杠 */
  const cleanPath = path.replace(/^\/+/, '')

  if (!cleanPath) {
    return type === 'view'
      ? '首页'
      : '组件'
  }

  /** 分割路径并取最后一部分作为名称 */
  const parts = cleanPath.split('/')
  const lastName = parts[parts.length - 1]

  /** 转换为更友好的显示名称 */
  return formatDisplayName(lastName)
}

/**
 * 格式化显示名称
 */
function formatDisplayName(name: string): string {
  /** 处理驼峰命名 */
  const formatted = name
    /** 在大写字母前添加空格 */
    .replace(/([A-Z])/g, ' $1')
    /** 移除开头的空格 */
    .trim()
    /** 首字母大写 */
    .replace(/^./, str => str.toUpperCase())

  /** 特殊名称映射 */
  const nameMap: Record<string, string> = {
    aiSnake: 'AI 贪吃蛇',
    ffmpeg: 'FFmpeg 工具',
    ffmpegDemo: 'FFmpeg 演示',
    i18n: '国际化',
    keepAliveTest: 'Keep Alive 测试',
    scrollAnimate: '滚动动画',
    useGetStateTest: 'useGetState 测试',
    zoomCvs: '缩放画布',
    canvasComposite: '画布合成',
    trainModel: '训练模型',
    MotionPrinciples: '动画原理',
    PerlinNoise: '柏林噪声',
    ProductGenerator: '产品生成器',
    VirtualWaterfall: '虚拟瀑布流',
    VirtualScroll: '虚拟滚动',
    VirtualDyScroll: '动态虚拟滚动',
    VirtualizedMarkdown: '虚拟化 Markdown',
    AutoScrollAnimate: '自动滚动动画',
    BlurBgImg: '模糊背景图',
    CutoutImg: '裁剪图片',
    DisCount: '折扣组件',
    DyBgc: '动态背景',
    FlipItem: '翻转项目',
    GlowClock: '发光时钟',
    GradientBoundary: '渐变边框',
    GradientText: '渐变文字',
    GridBg: '网格背景',
    HeroEnterText: '英雄入场文字',
    HtmlPreview: 'HTML 预览',
    ImgTransition: '图片过渡',
    InfiniteScroll: '无限滚动',
    InteractiveEmoji: '交互表情',
    LazyImg: '懒加载图片',
    LiquidGlass: '液体玻璃',
    MacTabDot: 'Mac 标签点',
    MdEditor: 'Markdown 编辑器',
    NavBar: '导航栏',
    PixelStyle: '像素风格',
    PreviewImg: '预览图片',
    RetryImg: '重试图片',
    RmBtn: '删除按钮',
    SeamlessScroll: '无缝滚动',
    SearchBar: '搜索栏',
    SmartSelection: '智能选择',
    SplitLine: '分割线',
    SplitText: '分割文字',
    TextFadeIn: '文字淡入',
    TextOverflow: '文字溢出',
    TextReveal: '文字揭示',
    ThemeToggle: '主题切换',
    ThinkingStep: '思考步骤',
    TourGuide: '导览指南',
    TransitionItem: '过渡项目',
    Typewriter: '打字机效果',
    VideoTimeline: '视频时间轴',
  }

  return nameMap[name] || formatted
}

/**
 * 获取页面分类
 */
function getPageCategory(path: string): string {
  const cleanPath = path.replace(/^\/+/, '')

  if (!cleanPath)
    return '首页'

  /** 根据路径第一级目录确定分类 */
  const firstLevel = cleanPath.split('/')[0]

  const categoryMap: Record<string, string> = {
    ai: 'AI 相关',
    canvas: '画布相关',
    chat: '聊天相关',
    editor: '编辑器',
    ffmpeg: '视频处理',
    motion: '动画效果',
    noise: '噪声算法',
    pricing: '定价页面',
    product: '产品相关',
    theme: '主题相关',
    scroll: '滚动相关',
    test: '测试页面',
    virtual: '虚拟化',
    zoom: '缩放相关',
  }

  /** 检查是否匹配已知分类 */
  for (const [key, category] of Object.entries(categoryMap)) {
    if (firstLevel.toLowerCase().includes(key)) {
      return category
    }
  }

  return '其他'
}
