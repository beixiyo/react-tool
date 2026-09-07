'use client'

import { memo, useRef, useSyncExternalStore } from 'react'
import { TaskBannerStack } from './TaskBannerStack'
import { taskBannerStore } from './taskBannerStore'
import type { TaskBannerItemData, TaskBannerPlacement } from './types'

/** 栈的 DOM 顺序固定按这张表，不随条目出现的先后漂移 */
const PLACEMENT_ORDER: readonly TaskBannerPlacement[] = [
  'top',
  'top-left',
  'top-right',
  'bottom',
  'bottom-left',
  'bottom-right',
]

const EMPTY_ITEMS: TaskBannerItemData[] = []

/**
 * 全局唯一的任务彩条容器（首次命令式调用时挂载一次）
 *
 * 它本身只做一件事：按定位把条目分组，每组交给一个 {@link TaskBannerStack}
 *
 * 分组是必要的而不是为了通用性——`placement` 从前是全局配置，
 * 一处业务想把彩条挪到别的角落就会连带把其他业务的彩条一起挪走
 * 现在 `placement` 落到条目上（不指定则跟随全局配置），
 * 建卡任务留在顶部、语音取消提示落到底部这类组合才成立
 *
 * 排列、收拢与展开的规则见 {@link TaskBannerStack}
 */
export const TaskBannerContainer = memo(() => {
  const items = useSyncExternalStore(
    taskBannerStore.subscribe,
    taskBannerStore.getSnapshot,
    taskBannerStore.getSnapshot,
  )
  const config = useSyncExternalStore(
    taskBannerStore.subscribe,
    taskBannerStore.getConfig,
    taskBannerStore.getConfig,
  )

  /** 用 Map 而不是先收集定位再过滤：一次遍历即可，且天然保住「最新在前」的组内顺序 */
  const groups = new Map<TaskBannerPlacement, TaskBannerItemData[]>()
  for (const item of items) {
    const placement = item.placement ?? config.placement
    const group = groups.get(placement)

    if (group) {
      group.push(item)
    }
    else {
      groups.set(placement, [item])
    }
  }

  /**
   * 出现过的定位一直保留栈，空了也不卸
   *
   * 实测症状：关掉最后一条彩条（✕ 或 Esc）时它当场消失，没有退场动画
   * 根因：按「当前有条目的定位」渲染栈，最后一条出栈那一刻这组为空，整个 `TaskBannerStack`
   * 连同里面的 `AnimatePresence` 一起被卸载，退场动画没有机会播；只有栈里还剩别的条目时才正常
   *
   * 记在 ref 里而不是 state：这是「见过就记住」的幂等集合，渲染期写入不影响本次输出，
   * 走 state 要多一轮渲染，而卸载在第一轮就已经发生了
   */
  const mountedPlacements = useRef(new Set<TaskBannerPlacement>()).current
  for (const placement of groups.keys()) mountedPlacements.add(placement)

  return (
    <>
      { PLACEMENT_ORDER
        .filter((placement) => mountedPlacements.has(placement))
        .map((placement) => (
          <TaskBannerStack
            key={ placement }
            placement={ placement }
            items={ groups.get(placement) ?? EMPTY_ITEMS }
            config={ config }
          />
        )) }
    </>
  )
})

TaskBannerContainer.displayName = 'TaskBannerContainer'
