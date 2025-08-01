'use client'

// --- Constants ---
/**
 * @constant INITIAL_HUE_DEG - 初始色相角度
 */
const INITIAL_HUE_DEG = 49
/**
 * @constant INITIAL_CHEEK_ALPHA - 初始脸颊透明度
 */
const INITIAL_CHEEK_ALPHA = 1
/**
 * @constant INITIAL_EYE_BALL_SCALE - 初始眼球缩放比例
 */
const INITIAL_EYE_BALL_SCALE = 1
/**
 * @constant INITIAL_MOUTH_RADIUS - 初始嘴巴圆角半径 [上左, 上右, 下右, 下左]
 */
const INITIAL_MOUTH_RADIUS: [number, number, number, number] = [5, 5, 50, 50]
/**
 * @constant INITIAL_EYE_BALL_MOVE - 初始眼球位置百分比 [左眼X, 左眼Y, 右眼X, 右眼Y]
 */
const INITIAL_EYE_BALL_MOVE: [number, number, number, number] = [50, 50, 50, 50] // 居中

// --- Props Interface ---
export type InteractiveEmojiProps = {
  /**
   * 组件容器的宽度，用于计算鼠标交互比例。
   * @default 600
   */
  containerWidth?: number
  /**
   * 组件容器的高度（或交互区域的高度），用于计算鼠标交互比例。
   * @default 300
   */
  containerHeight?: number
  /**
   * 传递给组件根元素的额外 CSS 类名。
   */
  className?: string
  /**
   * 传递给组件根元素的内联样式。
   */
  style?: React.CSSProperties
}

/**
 * @component InteractiveEmoji
 * @description 一个独立的、可根据鼠标悬停位置进行交互的表情组件。
 * @param {InteractiveEmojiProps} props - 组件属性
 */
export const InteractiveEmoji: React.FC<InteractiveEmojiProps> = ({
  containerWidth = 600, // 使用 props 或默认值
  containerHeight = 300, // 使用 props 或默认值 (注意：这主要影响 Y 轴计算)
  className = '',
  style = {},
}) => {
  // --- State ---
  const [hueDeg, setHueDeg] = useState<number>(INITIAL_HUE_DEG)
  const [cheekAlpha, setCheekAlpha] = useState<number>(INITIAL_CHEEK_ALPHA)
  const [eyeBallDiameterScale, setEyeBallDiameterScale] = useState<number>(INITIAL_EYE_BALL_SCALE)
  const [mouthRadius, setMouthRadius] = useState<[number, number, number, number]>(INITIAL_MOUTH_RADIUS)
  const [eyeBallMove, setEyeBallMove] = useState<[number, number, number, number]>(INITIAL_EYE_BALL_MOVE)
  const [isLeaving, setIsLeaving] = useState<boolean>(false)

  // --- Refs ---
  const containerRef = useRef<HTMLDivElement>(null)

  // --- Callbacks ---
  /**
   * @function resetState
   * @description 重置所有表情相关的状态到初始值
   */
  const resetState = useCallback(() => {
    setHueDeg(INITIAL_HUE_DEG)
    setCheekAlpha(INITIAL_CHEEK_ALPHA)
    setEyeBallDiameterScale(INITIAL_EYE_BALL_SCALE)
    setMouthRadius(INITIAL_MOUTH_RADIUS)
    setEyeBallMove(INITIAL_EYE_BALL_MOVE)
  }, [])

  /**
   * @function handleMouseEnter
   * @description 鼠标进入组件容器时的处理函数
   */
  const handleMouseEnter = useCallback(() => {
    setIsLeaving(false)
  }, [])

  /**
   * @function handleMouseLeave
   * @description 鼠标离开组件容器时的处理函数
   */
  const handleMouseLeave = useCallback(() => {
    setIsLeaving(true)
    resetState()
  }, [resetState])

  /**
   * @function handleMouseMove
   * @description 鼠标在组件容器内移动时的处理函数，更新表情状态
   * @param {React.MouseEvent<HTMLDivElement>} e - 鼠标事件对象
   */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current)
      return

    /**
     * 获取鼠标相对于容器左上角的位置
     * 使用 e.nativeEvent.offsetX/Y 更直接，但 getBoundingClientRect + clientX/Y 更稳健
     */
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    /** 使用传入的或默认的容器尺寸进行比例计算 */
    const width = containerWidth
    const height = containerHeight // 高度主要影响 Y 轴

    /** 限制 x, y 在 0 到 width/height 之间 */
    const layerX = Math.max(0, Math.min(x, width))
    const layerY = Math.max(0, Math.min(y, height)) // 限制 Y 在定义的交互高度内

    // 1. 更新脸部色相 (49deg -> 140deg)
    const maxHue = 140; const minHue = 49
    const faceRatio = (maxHue - minHue) / width
    setHueDeg(minHue + faceRatio * layerX)

    // 2. 更新脸颊透明度 (1 -> 0.1) - 使其在容器中心附近最不透明
    const centerDistX = Math.abs(layerX - width / 2) // 距离中心 X 的距离
    const maxDistX = width / 2
    const alphaRatio = centerDistX / maxDistX // 0 (中心) to 1 (边缘)
    const newCheekAlpha = 0.1 + (1 - alphaRatio) * 0.9 // 边缘 0.1, 中心 1
    setCheekAlpha(Math.max(0.1, Math.min(1, newCheekAlpha)))

    // 3. 更新眼球缩放比例 (中心 1, 边缘变大 ~1.33)
    const scaleRatio = centerDistX / maxDistX // 0 (中心) to 1 (边缘)
    setEyeBallDiameterScale(1 + scaleRatio * 0.33)

    // 4. 更新眼球位置 (0% -> 100%)
    const moveXPercent = (layerX / width) * 100
    const moveYPercent = (layerY / height) * 100 // 使用 height 计算 Y 轴比例
    /** 限制眼球在眼眶内移动，例如 15% 到 85% */
    const clampedMoveX = Math.max(15, Math.min(moveXPercent, 85))
    const clampedMoveY = Math.max(15, Math.min(moveYPercent, 85))
    setEyeBallMove([clampedMoveX, clampedMoveY, clampedMoveX, clampedMoveY])

    // 5. 更新嘴巴圆角 (左右移动时变化)
    const mouthRatio = layerX / width // 0 到 1
    let mrx = 5 + mouthRatio * 45 // 上排: 左5 -> 右50
    mrx = Math.max(5, Math.min(mrx, 50))
    let mry = 50 - mouthRatio * 45 // 下排: 左50 -> 右5
    mry = Math.max(5, Math.min(mry, 50))
    setMouthRadius([mrx, mrx, mry, mry])
  }, [containerWidth, containerHeight]) // 依赖项包含 props

  // --- Dynamic Styles ---
  const headStyle: React.CSSProperties = {
    background: `linear-gradient(to bottom, hsl(${hueDeg}deg 100% 65.29%), rgb(255, 223, 78))`,
    transition: isLeaving
      ? 'background 0.3s ease'
      : 'none', // 添加离开时的过渡
  }

  const eyeBallBaseStyle: React.CSSProperties = {
    position: 'absolute',
    borderRadius: '50%',
    backgroundColor: 'rgb(95, 3, 3)', // 或 Tailwind: bg-[#5f0303]
    width: '22px',
    height: '22px',
    transition: isLeaving
      ? 'transform 0.3s ease, left 0.3s ease, top 0.3s ease'
      : 'none',
  }

  const eyeBallStyle: React.CSSProperties = {
    ...eyeBallBaseStyle,
    transform: `scale(${eyeBallDiameterScale}) translate(-50%, -50%)`, // 使用 50% 来居中
    left: `${eyeBallMove[0]}%`,
    top: `${eyeBallMove[1]}%`,
  }

  const rightEyeBallStyle: React.CSSProperties = {
    ...eyeBallBaseStyle,
    transform: `scale(${eyeBallDiameterScale}) translate(-50%, -50%)`, // 使用 50% 来居中
    left: `${eyeBallMove[2]}%`,
    top: `${eyeBallMove[3]}%`,
  }

  const mouthStyle: React.CSSProperties = {
    borderRadius: `${mouthRadius[0]}px ${mouthRadius[1]}px ${mouthRadius[2]}px ${mouthRadius[3]}px`,
    transition: isLeaving
      ? 'border-radius 0.3s ease'
      : 'none',
  }

  /** 脸颊位置稍微跟随眼球，制造视差感 */
  const cheekStyle: React.CSSProperties = {
    left: `calc(50% + ${(eyeBallMove[0] - 50) * 0.2}px)`, // 跟随幅度减小
    top: `calc(52% + ${(eyeBallMove[1] - 50) * 0.2}px)`,
    transition: isLeaving
      ? 'opacity 0.3s ease, left 0.3s ease, top 0.3s ease'
      : 'none',
    opacity: cheekAlpha, // 直接用 opacity 控制显隐比背景色 alpha 好
  }

  const cheekItemStyle: React.CSSProperties = {
    /** 使用固定颜色，通过父级的 opacity 控制透明度 */
    background: `radial-gradient(ellipse at center, rgba(250, 147, 147, 1) 60%, rgba(202, 40, 40, 0.6) 90%)`,
  }

  return (
    /** 组件根容器 */
    <div
      ref={ containerRef }
      className={ `relative flex flex-col items-center justify-center p-5 bg-gray-100 rounded-lg shadow-md overflow-hidden ${isLeaving
        ? 'transition-all duration-300 ease-out'
        : ''} ${className}` }
      style={ { width: `${containerWidth}px`, height: `${containerHeight + 100}px`, ...style } } // 总高度比交互高度大，给表情留空间
      onMouseMove={ handleMouseMove }
      onMouseEnter={ handleMouseEnter }
      onMouseLeave={ handleMouseLeave }
    >
      {/* 表情头部 - 调整了 margin/padding 以适应容器 */ }
      <div
        className="relative h-[200px] w-[200px] flex flex-col items-center justify-start border-[3px] border-yellow-400 rounded-full shadow-md" // 移除 mt-80, justify-around 改为 start
        style={ headStyle }
      >
        {/* 眼睛容器 - 调整 pt */ }
        <div className="relative w-[120px] flex justify-between pt-[45px]">
          {/* 左眼白 */ }
          <div className="relative h-[50px] w-[50px] overflow-hidden rounded-full bg-white shadow-inner">
            {/* 左眼球 */ }
            <div style={ eyeBallStyle }></div>
          </div>
          {/* 右眼白 */ }
          <div className="relative h-[50px] w-[50px] overflow-hidden rounded-full bg-white shadow-inner">
            {/* 右眼球 */ }
            <div style={ rightEyeBallStyle }></div>
          </div>
        </div>

        {/* 嘴巴 - 调整 mt */ }
        <div
          className="relative mt-[15px] h-[40px] w-[90px] overflow-hidden border-2 border-[#ac0c0c] bg-[#ad2424]" // 添加上间距
          style={ mouthStyle }
        >
          {/* 牙齿 */ }
          <div className="absolute right-[20%] top-0 h-[8px] w-[15px] rounded-b-md bg-white"></div>
          {/* 舌头 */ }
          <div className="absolute bottom-[-20px] left-[10%] h-[45px] w-[40px] rotate-[-60deg] rounded-full bg-[#941313]"></div>
        </div>

        {/* 脸颊容器 */ }
        <div
          className="pointer-events-none absolute left-1/2 w-[180px] flex transform justify-between -translate-x-1/2" // 添加 pointer-events-none 防止干扰鼠标事件
          style={ cheekStyle }
        >
          {/* 脸颊元素 */ }
          <div className="h-[25px] w-[60px] rounded-full" style={ cheekItemStyle }></div>
          <div className="h-[25px] w-[60px] rounded-full" style={ cheekItemStyle }></div>
        </div>
      </div>
    </div>
  )
}
