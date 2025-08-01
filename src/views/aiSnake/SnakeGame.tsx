import type { QLearnSnakeAIConfig } from './lib/QLearnSnakeAI'
import type { SnakeConfig } from './lib/Snake'
import { GameControls } from './GameControls'
import { QLearnSnakeAI } from './lib/QLearnSnakeAI'
import { DirEnum, Snake } from './lib/Snake'

export const SnakeGame = memo(({
  gridSize = 20,
  canvasSize = 400,
  gameSpeed = 150,
  aiPlaySpeed = 100,
  trainingEpisodes = 2000,
  snakeConfig = {},
  aiConfig = {},
}: SnakeGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const snakeRef = useRef<Snake | null>(null)
  const aiRef = useRef(new QLearnSnakeAI(aiConfig))

  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [trainCount, setTrainCount] = useState(0)
  const [aiAvgScore, setAiAvgScore] = useState(0)

  const updateStats = useCallback(() => {
    if (!snakeRef.current)
      return

    setScore(snakeRef.current.score)
    setHighScore(Number(localStorage.getItem('snakeHighScore') || 0))
    setTrainCount(aiRef.current.trainCount)

    setAiAvgScore(
      aiRef.current.trainCount > 0
        ? Number((aiRef.current.totalScore / aiRef.current.trainCount).toFixed(2))
        : 0,
    )
  }, [])

  const startGame = useCallback(() => {
    if (!snakeRef.current)
      return

    snakeRef.current.startGame(gameSpeed, updateStats)
  }, [gameSpeed, updateStats])

  const startAIGame = useCallback(() => {
    if (!snakeRef.current || !aiRef.current)
      return

    snakeRef.current.startAiGame(
      () => aiRef.current.playStep(snakeRef.current!),
      aiPlaySpeed,
      updateStats,
    )
  }, [aiPlaySpeed, updateStats])

  const trainAI = useCallback(async () => {
    if (!snakeRef.current)
      return

    snakeRef.current.reset()

    aiRef.current?.train(
      snakeRef.current,
      trainingEpisodes,
      updateStats,
    )
  }, [trainingEpisodes, updateStats])

  const resetAI = useCallback(() => {
    aiRef.current.reset()
    updateStats()
  }, [updateStats])

  /** 初始化 Snake */
  useEffect(() => {
    if (!canvasRef.current)
      return

    snakeRef.current = new Snake(canvasRef.current, {
      gridSize,
      canvasSize,
      ...snakeConfig,
    })
    updateStats()
  }, [gridSize, canvasSize, snakeConfig, updateStats])

  /** 键盘控制 */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!snakeRef.current || snakeRef.current.gameOver)
        return

      switch (e.key) {
        case 'w':
          snakeRef.current.changeDirection(DirEnum.Up)
          break
        case 'd':
          snakeRef.current.changeDirection(DirEnum.Right)
          break
        case 's':
          snakeRef.current.changeDirection(DirEnum.Down)
          break
        case 'a':
          snakeRef.current.changeDirection(DirEnum.Left)
          break
      }
    }

    snakeRef.current!.draw()
    updateStats()

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [updateStats])

  return (
    <div className="mx-auto max-w-4xl w-full p-5">
      <h1 className="mb-5 text-center text-3xl text-gray-800">贪吃蛇 AI 强化学习</h1>
      <div className="flex flex-col items-center gap-5 md:flex-row md:items-start">
        <canvas
          ref={ canvasRef }
          height={ canvasSize }
          width={ canvasSize }
          className="border-1 border-black bg-gray-800"
        />

        <GameControls
          onStartGame={ startGame }
          onStartAIPlay={ startAIGame }
          onTrainAI={ trainAI }
          onResetAI={ resetAI }
          score={ score }
          highScore={ highScore }
          trainCount={ trainCount }
          aiAvgScore={ aiAvgScore }
        />
      </div>
    </div>
  )
})

interface SnakeGameProps {
  /** 网格大小，默认 20 */
  gridSize?: number
  /** 画布大小（像素），默认 400 */
  canvasSize?: number
  /** 游戏速度（毫秒），默认 150 */
  gameSpeed?: number
  /** AI 游戏速度（毫秒），默认 100 */
  aiPlaySpeed?: number
  /** 训练轮数，默认 Number.MAX_SAFE_INTEGER */
  trainingEpisodes?: number
  /** Snake 配置 */
  snakeConfig?: Omit<SnakeConfig, 'canvas'>
  /** SnakeAI 配置 */
  aiConfig?: QLearnSnakeAIConfig
}
