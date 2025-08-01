/** 模拟对话数据 */
export const MOCK_CONVERSATIONS = [
  { text: '您好！我是智能助手，有什么可以帮您的吗？', sender: 'system' },
  { text: '我想了解一下最新的前端技术趋势', sender: 'user' },
  { text: '目前最热门的前端技术包括React 18、Vue 3、Svelte、Next.js和Tailwind CSS等。React 18引入了并发渲染功能，Vue 3完全采用了Composition API，Svelte的编译时优化备受关注。', sender: 'system' },
  { text: '这些框架各有什么特点？', sender: 'user' },
  { text: 'React专注于组件化和虚拟DOM，Vue平衡了易用性和性能，Svelte通过编译时优化减少运行时开销，Next.js提供了服务端渲染和静态生成的能力。', sender: 'system' },
  { text: '有没有值得学习的新工具？', sender: 'user' },
  { text: 'Vite作为构建工具越来越受欢迎，基于ESM的开发服务器使热更新非常快。Pnpm作为包管理器节省磁盘空间且效率更高。CSS方面，除了Tailwind，还有CSS Modules和CSS-in-JS解决方案如styled-components。', sender: 'system' },
]

/** 更多随机对话内容 */
export const RANDOM_USER_MESSAGES = [
  '如何优化React应用性能？',
  '你能解释一下虚拟DOM的原理吗？',
  'TypeScript有什么优势？',
  '前端状态管理最佳实践是什么？',
  '如何处理大规模前端项目？',
  'WebAssembly的应用场景有哪些？',
  '前端微服务架构怎么实现？',
  '响应式设计的核心原则是什么？',
  '如何有效管理前端依赖？',
  '现代浏览器的渲染流程是怎样的？',
]

export const RANDOM_SYSTEM_RESPONSES = [
  '性能优化可以从多个方面入手：使用React.memo避免不必要的渲染；通过useMemo和useCallback缓存计算结果和函数；使用虚拟列表处理长列表；代码分割减小初始加载体积；使用Web Workers处理耗CPU的任务。',
  '虚拟DOM是React的核心概念，它是真实DOM的轻量级JavaScript表示。当状态变化时，React首先更新虚拟DOM，然后通过差异比较算法（Diffing）计算出最小的变化集，最后只更新需要变化的真实DOM部分，减少了DOM操作，提高了性能。',
  'TypeScript为JavaScript添加了静态类型检查，主要优势包括：编译时错误检测；更好的IDE支持和代码补全；代码可维护性提高；类型定义作为文档；更安全的重构。',
  '前端状态管理最佳实践：区分本地状态和全局状态；对于简单应用使用React Context + useReducer；复杂应用考虑Redux、MobX或Zustand；使用不可变数据模式；按领域或功能划分状态；减少状态变化的副作用。',
  '大型前端项目管理策略：采用模块化架构；使用Monorepo管理多包；建立组件库；制定代码规范；自动化测试；性能监控；团队协作规范；文档完善。',
  'WebAssembly使JavaScript能够以接近原生的速度运行C、C++等语言编写的代码。应用场景包括：图像/视频处理；游戏开发；音频处理；大数据可视化；复杂计算如机器学习、加密算法；将现有的C/C++库移植到Web。',
  '前端微服务可以通过以下方式实现：使用Module Federation实现运行时集成；Web Components提供技术无关性；采用微前端框架如single-spa；构建时集成；通过iframes隔离；路由分发；共享依赖管理。',
  '响应式设计核心原则：流动网格布局；灵活的图片和媒体；媒体查询；移动优先设计；内容优先；性能考虑；用户体验一致性；使用相对单位如em、rem、%。',
  '前端依赖管理最佳实践：定期更新依赖；锁定版本号；使用依赖分析工具检测问题；删除未使用的依赖；理解语义化版本；考虑使用pnpm的内容寻址存储；进行依赖审计；优化打包体积。',
  '现代浏览器渲染流程：解析HTML生成DOM树；解析CSS生成CSSOM；将DOM和CSSOM合并成渲染树；布局计算（回流）确定元素位置和大小；绘制填充像素；合成处理分层和动画。优化应该减少回流和重绘操作。',
]
