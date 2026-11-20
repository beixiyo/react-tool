/** 列表项默认入场位移，单位为 px */
export const LIST_ENTER_DISTANCE = 20

/** 生成淡入和淡出状态，不指定曲线、时长或错峰。无参数时从下方入场 */
export function createListItemEnter({ x, y, exit }: ListItemEnterOptions = { y: LIST_ENTER_DISTANCE }) {
  const enterOffset = {
    ...(x !== undefined && { x }),
    ...(y !== undefined && { y }),
  }

  return {
    hidden: { ...enterOffset, opacity: 0 },
    visible: {
      opacity: 1,
      ...((x !== undefined || exit?.x !== undefined) && { x: 0 }),
      ...((y !== undefined || exit?.y !== undefined) && { y: 0 }),
    },
    exit: { ...(exit ?? enterOffset), opacity: 0 },
  }
}

type ListItemOffset = {
  /** 起始水平偏移，单位为 px；负值从左侧进入 */
  x?: number
  /**
   * 起始垂直偏移，单位为 px；正值从下方进入
   */
  y?: number
}

/** 列表项入场与退场的位移配置，单位为 px */
export type ListItemEnterOptions = ListItemOffset & {
  /** 退场终点偏移；默认回到入场起点，传空对象则原地淡出 */
  exit?: ListItemOffset
}

/** 默认列表入场的错峰间隔，单位为秒 */
export const LIST_ENTER_INTERVAL = 0.1
