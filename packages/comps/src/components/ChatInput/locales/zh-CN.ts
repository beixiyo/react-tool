export const zhCN = {
  chatInput: {
    autoCompletePanel: {
      labels: {
        history: '历史',
        keyword: '关键词',
        template: '模板',
      },
      loading: '正在搜索建议...',
      select: '选择',
      suggestionCount: '{{count}} 个建议',
    },
    buttons: {
      help: '帮助',
      inputHistory: '输入历史',
      promptTemplates: '提示词模板',
      quickMode: '快速模式',
      uploadFile: '上传文件',
    },
    categories: {
      code: '代码相关',
      custom: '自定义',
      debug: '调试相关',
      document: '文档相关',
      explain: '解释说明',
      optimize: '性能优化',
      test: '测试相关',
      translate: '翻译转换',
    },
    historyPanel: {
      clearAll: '🗑️ 清空',
      emptyState: {
        noHistory: '📝 暂无输入历史',
        noHistoryDesc: '开始输入内容来创建历史记录',
        noResults: '🔍 没有找到匹配的历史记录',
        noResultsDesc: '尝试使用其他关键词搜索',
      },
      labels: {
        daysAgo: '{{count}}天前',
        hoursAgo: '{{count}}小时前',
        justNow: '刚刚',
        minutesAgo: '{{count}}分钟前',
        quickFill: '快速填充',
        template: '⭐ 模板',
      },
      recordCount: '{{count}} 条记录',
      searchPlaceholder: '搜索历史记录...',
      shortcuts: {
        cancel: '取消',
        confirm: '确认',
        history: '历史',
        select: '选择',
      },
      title: '📚 输入历史',
    },
    placeholder: '输入您的问题或选择提示词模板...',
    promptPanel: {
      allCategories: '🌟 全部',
      emptyState: {
        noResults: '🔍 没有找到匹配的模板',
        noResultsDesc: '尝试使用其他关键词搜索',
        noTemplates: '📝 暂无可用模板',
        noTemplatesDesc: '您可以创建自定义模板',
      },
      labels: {
        custom: '⭐ 自定义',
      },
      searchPlaceholder: '搜索模板...',
      shortcuts: {
        cancel: '取消',
        confirm: '确认',
        select: '选择',
      },
      templateCount: '{{count}} 个模板',
      title: '✨ 提示词模板',
    },
    shortcuts: {
      history: '历史',
      send: '发送',
      templates: '模板',
    },
  },
} as const
