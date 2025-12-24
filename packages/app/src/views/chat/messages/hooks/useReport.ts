import { useChatAtoms } from '../../store'

/**
 * 报告管理相关的 Hook
 */
export function useReport() {
  const { currentReport, setCurrentReport } = useChatAtoms(['currentReport'] as const)

  return {
    currentReport,
    setCurrentReport,
  }
}
