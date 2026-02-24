export const GameControls = memo<GameControlsProps>(({
  onStartGame,
  onStartAIPlay,
  onTrainAI,
  onResetAI,
  score,
  highScore,
  trainCount,
  aiAvgScore,
}) => {
  const [isTraining, setIsTraining] = useState(false)

  const handleTrainAI = async () => {
    setIsTraining(true)
    await onTrainAI()
    setIsTraining(false)
  }

  return (
    <div className="min-w-[200px] flex flex-col gap-3 rounded-lg bg-white p-4 shadow-md">
      <button
        onClick={ onStartGame }
        className="rounded-sm bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
      >
        开始游戏
      </button>
      <button
        onClick={ onStartAIPlay }
        className="rounded-sm bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
      >
        AI 游戏
      </button>
      <button
        onClick={ handleTrainAI }
        disabled={ isTraining }
        className="rounded-sm bg-green-500 px-4 py-2 text-white transition-colors disabled:bg-gray-400 hover:bg-green-600"
      >
        { isTraining
          ? '训练中...'
          : '训练 AI' }
      </button>
      <button
        onClick={ onResetAI }
        className="rounded-sm bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
      >
        重置 AI
      </button>
      <div className="mt-5 border-t border-gray-200 pt-4">
        <p className="mb-2 text-sm">
          <span>分数:</span>
          { ' ' }
          <span className="text-blue-400 font-bold">{ score }</span>
        </p>
        <p className="mb-2 text-sm">
          <span>最高分:</span>
          { ' ' }
          <span className="text-blue-400 font-bold">{ highScore }</span>
        </p>
        <p className="mb-2 text-sm">
          <span>AI 训练次数:</span>
          { ' ' }
          <span className="text-blue-400 font-bold">{ trainCount }</span>
        </p>
        <p className="text-sm">
          <span>AI 平均分:</span>
          { ' ' }
          <span className="text-blue-400 font-bold">{ aiAvgScore }</span>
        </p>
      </div>
    </div>
  )
})

interface GameControlsProps {
  onStartGame: () => void
  onStartAIPlay: () => void
  onTrainAI: () => Promise<void>
  onResetAI: () => void
  score: number
  highScore: number
  trainCount: number
  aiAvgScore: number
}
