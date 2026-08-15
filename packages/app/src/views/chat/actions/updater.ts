/** 支持直接替换，或基于执行时最新值计算下一状态 */
export type Updater<T> = T | ((previous: T) => T)

/** 解析直接值或函数式 updater */
export function resolveUpdater<T>(current: T, updater: Updater<T>): T {
  return typeof updater === 'function'
    ? (updater as (previous: T) => T)(current)
    : updater
}
