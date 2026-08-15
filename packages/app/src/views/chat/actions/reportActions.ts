import { currentReport } from '../store'
import type { ReportData } from '../types'
import type { Updater } from './updater'
import { resolveUpdater } from './updater'

/** 写入当前报告 */
export function setCurrentReport(updater: Updater<ReportData | null>) {
  currentReport.value = resolveUpdater(currentReport.value, updater)
}

/** 当前报告 signal */
export { currentReport }
