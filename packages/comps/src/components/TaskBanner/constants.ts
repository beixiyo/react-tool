import type { TaskBannerMotionProps, TaskBannerPlacement } from './types'

/**
 * 提示条（notice）的默认驻留时长
 *
 * 取 5 秒对齐「撤销」类提示的常见窗口；传 0 表示常驻，交由业务自己关闭——
 * 当业务本身已经有一份同长度的计时器（例如撤销窗口在管音频的存活）时，
 * 让彩条也跑一份会变成两个时钟各走各的，届时以 0 关掉这里的计时更可靠
 */
export const TASK_BANNER_NOTICE_DURATION = 5000

/** 底部定位（`bottom` / `bottom-left` / `bottom-right`）的判定 */
export function isBottomPlacement(placement: TaskBannerPlacement): boolean {
  return placement.startsWith('bottom')
}

/**
 * 按定位给出进出场动画
 *
 * 位移方向跟随容器锚定的那条边：顶部定位从上方进场，底部定位从下方进场，
 * 否则底部彩条会「先往上冒再落回来」，看着像是从屏幕中间钻出来的
 */
export function getEnterMotion(placement: TaskBannerPlacement): TaskBannerMotionProps {
  const sign = isBottomPlacement(placement)
    ? 1
    : -1

  return {
    initial: { opacity: 0, y: 16 * sign, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 12 * sign, scale: 0.96 },
    transition: { duration: 0.3, ease: 'easeOut' },
  }
}
