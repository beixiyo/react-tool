/**
 * 通用无障碍（aria）文案资源 —— 英语
 *
 * 供各组件的 aria-label / title 等无障碍标签默认值统一取用；
 * 键按「动作 + 宾语」的完整短语组织，避免调用方自行拼接导致翻译语序错误
 */
export const enUS = {
  aria: {
    /** 通用关闭 */
    close: 'Close',
    /** 清除内容 */
    clear: 'Clear',
    /** 清除已选项 */
    clearSelection: 'Clear selection',
    /** 关闭抽屉 */
    closeDrawer: 'Close drawer',
    /** 关闭引导 */
    closeTour: 'Close tour',
    /** 跳过引导 */
    skipTour: 'Skip tour',
    /** 完成引导 */
    completeTour: 'Complete tour',
    /** 引导步骤容器 */
    guideSteps: 'Guide steps',
    /** 第 N 步指示器 */
    step: 'Step {{index}}',
    /** 跳转到第 N 步 */
    goToStep: 'Go to step {{index}}',
    /** 上一张幻灯片 */
    previousSlide: 'Previous slide',
    /** 下一张幻灯片 */
    nextSlide: 'Next slide',
    /** 上一步 */
    previousStep: 'Previous step',
    /** 下一步 */
    nextStep: 'Next step',
    /** 上一页 */
    previousPage: 'Previous page',
    /** 下一页 */
    nextPage: 'Next page',
    /** 向前滚动 */
    scrollPrevious: 'Scroll previous',
    /** 向后滚动 */
    scrollNext: 'Scroll next',
    /** 展开侧边栏 */
    expandSidebar: 'Expand sidebar',
    /** 收起侧边栏 */
    collapseSidebar: 'Collapse sidebar',
    /** 展开详情区 */
    expandDetails: 'Expand details',
    /** 收起详情区 */
    collapseDetails: 'Collapse details',
    /** 切换到浅色模式 */
    switchToLightMode: 'Switch to light mode',
    /** 切换到深色模式 */
    switchToDarkMode: 'Switch to dark mode',
    /** 拖动调整面板大小 */
    resizePanel: 'Resize panel',
    /** 旋转图片 */
    rotateImage: 'Rotate image',
    /** 重置图片变换 */
    resetImage: 'Reset image',
    /** 下载图片 */
    downloadImage: 'Download image',
    /** 切换到第 N 张图片 */
    goToImage: 'Go to image {{index}}',
    /** 跳转到第 N 张幻灯片 */
    goToSlide: 'Go to slide {{index}}',
    /** 选择日期 */
    selectDate: 'Select date',
    /** 追加文件 */
    addFiles: 'Add files',
    /** 上传文件 */
    uploadFiles: 'Upload files',
    /** 更多标签页 */
    moreTabs: 'More tabs',
    /** 最小化窗口 */
    minimize: 'Minimize',
    /** 最大化窗口 */
    maximize: 'Maximize',
    /** 查看页面源码 */
    viewSourceOnGitHub: 'View source on GitHub',
    /** 单元格编辑提示 */
    clickOrDoubleClickToEdit: 'Click or double-click to edit',
    /** 搜索结果容器 */
    searchResults: 'Search results',
    /** 选项列表容器 */
    options: 'Options',
    /** 工具栏容器 */
    toolbar: 'toolbar',
  },
} as const

export type AriaTranslations = typeof enUS.aria
