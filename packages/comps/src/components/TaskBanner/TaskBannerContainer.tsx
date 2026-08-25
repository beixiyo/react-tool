'use client'

import type { TaskBannerItemData, TaskBannerPlacement } from './types'
import { memo, useSyncExternalStore } from 'react'
import { taskBannerStore } from './taskBannerStore'
import { TaskBannerStack } from './TaskBannerStack'

/**
 * 全局唯一的任务彩条容器（首次命令式调用时挂载一次）
 *
 * 它本身只做一件事：按定位把条目分组，每组交给一个 {@link TaskBannerStack}
 *
 * 分组是必要的而不是为了通用性——`placement` 从前是全局配置，
 * 一处业务想把彩条挪到别的角落就会连带把其他业务的彩条一起挪走。
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

  return (
    <>
      { [...groups].map(([placement, groupItems]) => (
        <TaskBannerStack
          key={ placement }
          placement={ placement }
          items={ groupItems }
          config={ config }
        />
      )) }
    </>
  )
})

TaskBannerContainer.displayName = 'TaskBannerContainer'
