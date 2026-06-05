import type { ReportData } from '../../types'
import { currentReport } from '../../store'

/**
 * 报告管理相关的 Hook
 */
export function useReport() {
  const setCurrentReport = (
    updater: ReportData | null | ((prev: ReportData | null) => ReportData | null),
  ) => {
    currentReport.value = typeof updater === 'function'
      ? updater(currentReport.value)
      : updater
  }

  return {
    currentReport: currentReport.value,
    setCurrentReport,
  }
}
