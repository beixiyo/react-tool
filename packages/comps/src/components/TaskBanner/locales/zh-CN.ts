export const zhCN = {
  taskBanner: {
    retry: '重试',
    close: '关闭',
    failed: '处理失败',
    expand: '展开',
    collapse: '收起',
    /** 中文无单复数变化，仅需 other 形态（Intl.PluralRules 对中文恒返回 other） */
    failedSummary: {
      other: '{{count}} 条处理失败',
    },
  },
} as const
