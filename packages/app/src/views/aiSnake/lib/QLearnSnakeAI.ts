import type { Snake } from './Snake'
import { DirEnum } from './Snake'

/**
 * 贪吃蛇 AI 强化学习类
 */
export class QLearnSnakeAI {
  private config: Required<QLearnSnakeAIConfig>
  private qTable: QTable
  private prevDistance = 0

  trainCount: number
  totalScore: number

  constructor(config: QLearnSnakeAIConfig = {}) {
    const defaultConfig = {
      learningRate: 0.1,
      discountFactor: 0.9,
      explorationRate: 0.3,
      minExplorationRate: 0.1,
      explorationDecay: 0.99,
    }

    this.config = {
      ...defaultConfig,
      ...config,
    }

    this.qTable = this.loadQTable() || {}
    this.trainCount = this.loadTrainCount() || 0
    this.totalScore = this.loadTotalScore() || 0
  }

  /**
   * 从 localStorage 加载 Q 表
   * @returns Q 表或 null
   */
  private loadQTable(): QTable | null {
    const savedQTable = localStorage.getItem('snakeAI_qTable')
    return savedQTable
      ? JSON.parse(savedQTable)
      : null
  }

  /**
   * 保存 Q 表到 localStorage
   */
  saveQTable(): void {
    localStorage.setItem('snakeAI_qTable', JSON.stringify(this.qTable))
  }

  /**
   * 从 localStorage 加载训练次数
   * @returns 训练次数
   */
  private loadTrainCount(): number {
    return Number(localStorage.getItem('snakeAI_trainCount') || '0')
  }

  /**
   * 保存训练次数到 localStorage
   */
  saveTrainCount(): void {
    localStorage.setItem('snakeAI_trainCount', this.trainCount.toString())
  }

  /**
   * 从 localStorage 加载总分数
   * @returns 总分数
   */
  private loadTotalScore(): number {
    return Number(localStorage.getItem('snakeAI_totalScore') || '0')
  }

  /**
   * 保存总分数到 localStorage
   */
  saveTotalScore(): void {
    localStorage.setItem('snakeAI_totalScore', this.totalScore.toString())
  }

  /**
   * 重置 AI 状态
   */
  reset(): void {
    this.qTable = {}
    this.trainCount = 0
    this.totalScore = 0
    localStorage.removeItem('snakeAI_qTable')
    localStorage.removeItem('snakeAI_trainCount')
    localStorage.removeItem('snakeAI_totalScore')
  }

  /**
   * 将游戏状态转换为字符串键
   * @param state 游戏状态
   * @returns 状态键
   */
  private getStateKey(state: ReturnType<Snake['getState']>): string {
    /** 稍微优化一下键的生成，减少 JSON.stringify 的开销和长度 */
    const parts = [
      state.dangers[DirEnum.Up]
        ? '1'
        : '0',
      state.dangers[DirEnum.Right]
        ? '1'
        : '0',
      state.dangers[DirEnum.Down]
        ? '1'
        : '0',
      state.dangers[DirEnum.Left]
        ? '1'
        : '0',
      state.foodDirection[DirEnum.Up]
        ? '1'
        : '0',
      state.foodDirection[DirEnum.Right]
        ? '1'
        : '0',
      state.foodDirection[DirEnum.Down]
        ? '1'
        : '0',
      state.foodDirection[DirEnum.Left]
        ? '1'
        : '0',
      state.currentDirection[DirEnum.Up]
        ? '1'
        : '0',
      state.currentDirection[DirEnum.Right]
        ? '1'
        : '0',
      state.currentDirection[DirEnum.Down]
        ? '1'
        : '0',
      state.currentDirection[DirEnum.Left]
        ? '1'
        : '0',
    ]
    /** 用简单的 0/1 字符串代替 JSON */
    return parts.join('')
  }

  /**
   * 获取 AI 决策动作
   * @param state 当前游戏状态
   * @returns 动作方向
   */
  getAction(state: ReturnType<Snake['getState']>): DirEnum {
    const stateKey = this.getStateKey(state)

    /** 探索：随机选择动作 */
    if (Math.random() < this.config.explorationRate) {
      const actions: (DirEnum)[] = [DirEnum.Up, DirEnum.Right, DirEnum.Down, DirEnum.Left]
      return actions[Math.floor(Math.random() * actions.length)]
    }

    if (!this.qTable[stateKey]) {
      this.qTable[stateKey] = this.getInitQValue()
    }

    const qValues = this.qTable[stateKey]
    let bestAction: DirEnum = DirEnum.Right
    let bestValue = -Infinity

    /** 选择期望值最高的动作 */
    for (const action in qValues) {
      const a = action as keyof typeof qValues
      if (qValues[a] > bestValue) {
        bestValue = qValues[a]
        bestAction = action as DirEnum
      }
    }

    return bestAction
  }

  /**
   * 更新 Q 值的函数
   * ### Q(s,a) = Q(s,a) + α [r + γ max(Q(s',a')) - Q(s,a)]
   * ### 新 Q 值 = 旧 Q 值 + 学习率 * ( 当前奖励 + 折扣因子 * (下一个状态最好的 Q 值) - 旧 Q 值 )
   *
   * - **学习率 (Learning Rate, α)**：表示 AI 对新学到的知识有多“信任”。值越大，越容易被新经验改变；值越小，越“固执”，更相信过去的经验。
   * - **折扣因子 (Discount Factor, γ)**：表示 AI 对“未来奖励”的重视程度。值越接近 1，说明 AI 越有“远见”，会为了未来的大奖励而放弃眼前的小奖励；值越接近 0，说明 AI 越“短视”，只关心眼前的奖励。
   * 接近 1 时更重视长期回报，接近 0 时更关注即时奖励。
   *
   * @param state 当前状态
   * @param action 执行的动作
   * @param reward 获得的奖励
   * @param nextState 下一状态
   */
  updateQValue(
    state: ReturnType<Snake['getState']>,
    action: DirEnum,
    reward: number,
    nextState: ReturnType<Snake['getState']>,
  ): void {
    const stateKey = this.getStateKey(state)
    const nextStateKey = this.getStateKey(nextState)

    if (!this.qTable[stateKey]) {
      this.qTable[stateKey] = this.getInitQValue()
    }
    if (!this.qTable[nextStateKey]) {
      this.qTable[nextStateKey] = this.getInitQValue()
    }

    const maxNextQ = Math.max(...Object.values(this.qTable[nextStateKey]))

    /**
     * 键为当前的环境情况，如：
     * ```json
     * {
     *   "dangerUp": false,
     *   "dangerRight": false,
     *   "dangerDown": false,
     *   "dangerLeft": false,
     *   "foodUp": false,
     *   "foodRight": false,
     *   "foodDown": false,
     *   "foodLeft": true,
     *   "dirUp": false,
     *   "dirRight": false,
     *   "dirDown": false,
     *   "dirLeft": true
     * }
     * ```
     *
     * 值为当前环境情况下，四个方向的 Q 值，如：
     * ```json
     * {
     *   "up": 7.811,
     *   "right": 12.154,
     *   "down": 7.376,
     *   "left": 12.981
     * }
     * ```
     *
     * 通过不断更新某个环境下的 Q 值，可以使 AI 学会更好的决策
     */
    this.qTable[stateKey][action] += this.config.learningRate * (
      reward + this.config.discountFactor
      * maxNextQ - this.qTable[stateKey][action]
    )
  }

  /**
   * 计算奖励值
   * @param snake 蛇实例
   * @param prevScore 前一次得分
   * @param didMove 是否成功移动 (没撞墙/自己)
   * @returns 奖励值
   */
  calculateReward(snake: Snake, prevScore: number, didMove: boolean): number {
    /** 游戏结束，狠狠地惩罚 */
    if (!didMove)
      return -10
    /** 吃到食物，狠狠地奖励 */
    if (snake.score > prevScore)
      return 10

    /** 计算蛇头与食物的距离 */
    const head = snake.snake[0]
    const food = snake.food
    const distance = Math.abs(head.x - food.x) + Math.abs(head.y - food.y)

    const prevDistance = this.prevDistance
    /** 如果蛇头距离食物更近，返回微小正奖励（+0.1） */
    if (prevDistance && distance < prevDistance) {
      this.prevDistance = distance
      return 0.1
    }

    /** 如果距离变远，则返回微小负奖励（-0.1） */
    this.prevDistance = distance
    return -0.1
  }

  /**
   * 训练 AI
   * @param snake 蛇实例
   * @param episodes 训练轮数
   */
  async train(snake: Snake, episodes: number, cb?: VoidFunction): Promise<void> {
    console.log(`开始训练 ${episodes} 次...`)
    const initialExplorationRate = this.config.explorationRate

    for (let i = 0; i < episodes; i++) {
      snake.reset()
      /** 重置距离比较基准 */
      this.prevDistance = 0
      /** 记录当前局的步数 */
      let step = 0

      while (!snake.gameOver) {
        const state = snake.getState()
        const action = this.getAction(state)
        const prevScore = snake.score

        snake.changeDirection(action)
        const didMove = snake.move()
        const reward = this.calculateReward(snake, prevScore, didMove)
        const nextState = snake.getState()
        this.updateQValue(state, action, reward, nextState)

        snake.draw()
        cb?.()

        step++
        /** 可以加一个最大步数限制，防止蛇陷入死循环或无意义的绕圈 */
        if (step > snake.config.gridSize * snake.config.gridSize * 2) {
          console.log(`Episode ${this.trainCount + 1} reached max steps, ending.`)
          snake.gameOver = true // 强制结束本局
        }

        /** 每 10 局，每 100 步延时一次，避免完全卡死 */
        if (i % 10 === 0 && step % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }

      // --- 每局结束后的处理 ---
      this.trainCount++
      this.totalScore += snake.score

      /** 每隔一定局数保存一次，避免频繁 IO 操作，也减少数据丢失风险 */
      if (i % 10 === 0 || i === episodes - 1) {
        this.saveQTable()
        this.saveTrainCount()
        this.saveTotalScore()
      }

      /** 随着训练进行，减少探索率 */
      this.config.explorationRate = Math.max(
        this.config.minExplorationRate,
        initialExplorationRate * this.config.explorationDecay ** i,
      )
    }
  }

  /**
   * AI 执行一步游戏
   * @param snake 蛇实例
   * @returns 是否成功移动
   */
  playStep(snake: Snake): boolean {
    const state = snake.getState()
    const tempExplorationRate = this.config.explorationRate

    /** 临时关闭随机探索 */
    this.config.explorationRate = 0
    const action = this.getAction(state)
    this.config.explorationRate = tempExplorationRate

    snake.changeDirection(action)
    return snake.move()
  }

  private getInitQValue() {
    return {
      [DirEnum.Up]: 0,
      [DirEnum.Right]: 0,
      [DirEnum.Down]: 0,
      [DirEnum.Left]: 0,
    }
  }
}

export interface QTable {
  [state: string]: {
    [DirEnum.Up]: number
    [DirEnum.Right]: number
    [DirEnum.Down]: number
    [DirEnum.Left]: number
  }
}

export interface QLearnSnakeAIConfig {
  /**
   * 学习率，决定了新信息在更新中的权重
   * @default 0.1
   */
  learningRate?: number

  /**
   * 折扣因子，反映了未来奖励的重要性。接近 1 时更重视长期回报，接近 0 时更关注即时奖励
   * @default 0.9
   */
  discountFactor?: number

  /**
   * 初始探索率，决定了 AI 在开始时对新动作的探索程度
   * @default 0.3
   */
  explorationRate?: number

  /**
   * 最小探索率，当探索率低于该值时，AI 停止探索
   * @default 0.1
   */
  minExplorationRate?: number

  /**
   * 探索率衰减因子，决定了探索率随着训练的进行而衰减
   * @default 0.99
   */
  explorationDecay?: number
}
