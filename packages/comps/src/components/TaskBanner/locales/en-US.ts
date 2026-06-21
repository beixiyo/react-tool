export const enUS = {
  taskBanner: {
    retry: 'Retry',
    failed: 'Failed',
    /** 英语区分单复数：count=1 用单数，其余用复数（由 i18n 的 Intl.PluralRules 选择） */
    failedSummary: {
      one: '1 failure',
      other: '{{count}} failures',
    },
  },
} as const
