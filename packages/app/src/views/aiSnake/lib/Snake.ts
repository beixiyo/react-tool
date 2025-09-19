/**
 * 贪吃蛇游戏核心类
 */
export class Snake {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  config: Required<SnakeConfig>

  cellSize: number
  snake: Position[] = []
  food: Position = { x: 0, y: 0 }

  private direction: DirEnum = DirEnum.Right
  private nextDirection: DirEnum = DirEnum.Right

  score = 0
  gameOver = false

  timer?: number
  aiTimer?: number

  constructor(canvas: HTMLCanvasElement, config: SnakeConfig) {
    const defaultConfig: Required<SnakeConfig> = {
      gridSize: 20,
      canvasSize: 400,
      headColor: '#2E7D32',
      bodyColor: '#4CAF50',
      foodColor: '#F44336',
      backgroundColor: '#222',
    }

    this.config = {
      ...defaultConfig,
      ...config,
    }

    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.cellSize = this.config.canvasSize / this.config.gridSize

    this.reset()
  }

  startGame(gameSpeed = 150, cb?: VoidFunction) {
    this.stopGame()
    this.reset()

    this.timer = window.setInterval(() => {
      if (!this.move()) {
        this.stopGame()
      }

      this.draw()
      cb?.()
    }, gameSpeed)
  }

  stopGame() {
    window.clearInterval(this.timer)
  }

  startAiGame(
    customMove: () => boolean,
    gameSpeed = 150,
    cb?: VoidFunction,
  ) {
    this.stopAiGame()
    this.reset()

    this.timer = window.setInterval(() => {
      if (!customMove()) {
        this.stopAiGame()
      }

      this.draw()
      cb?.()
    }, gameSpeed)
  }

  stopAiGame() {
    window.clearInterval(this.aiTimer)
  }

  /**
   * 重置游戏状态
   */
  reset(): void {
    this.snake = [{ x: 10, y: 10 }]
    this.direction = DirEnum.Right
    this.nextDirection = DirEnum.Right
    this.food = this.generateFood()
    this.score = 0
    this.gameOver = false
    this.updateScore()
  }

  /**
   * 生成食物位置
   * @returns 食物坐标
   */
  private generateFood(): Position {
    let food: Position
    do {
      food = {
        x: Math.floor(Math.random() * this.config.gridSize),
        y: Math.floor(Math.random() * this.config.gridSize),
      }
    }
    while (this.isOnSnake(food))

    return food
  }

  /**
   * 检查位置是否在蛇身上，排除最后一个尾巴段
   * @param position 要检查的坐标
   * @returns 是否在蛇身上
   */
  private isOnSnake(position: Position): boolean {
    return this.snake.slice(0, -1).some(segment => segment.x === position.x && segment.y === position.y)
  }

  /**
   * 改变蛇的移动方向
   * @param direction 新方向
   */
  changeDirection(direction: DirEnum): void {
    const opposites: { [K in DirEnum]: DirEnum } = {
      [DirEnum.Up]: DirEnum.Down,
      [DirEnum.Down]: DirEnum.Up,
      [DirEnum.Left]: DirEnum.Right,
      [DirEnum.Right]: DirEnum.Left,
    }

    /** 只有当新方向不是当前方向的相反方向时才更新 */
    if (this.direction !== opposites[direction]) {
      this.nextDirection = direction
    }
  }

  /**
   * 执行一步移动
   * @returns 是否成功移动
   */
  move(): boolean {
    if (this.gameOver)
      return false

    this.direction = this.nextDirection
    const head = { ...this.snake[0] }

    switch (this.direction) {
      case DirEnum.Up: head.y--; break
      case DirEnum.Down: head.y++; break
      case DirEnum.Left: head.x--; break
      case DirEnum.Right: head.x++; break
    }

    if (
      head.x < 0
      || head.x >= this.config.gridSize
      || head.y < 0
      || head.y >= this.config.gridSize
    ) {
      this.gameOver = true
      return false
    }

    if (this.isOnSnake(head)) {
      this.gameOver = true
      return false
    }

    this.snake.unshift(head)

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++
      this.updateScore()
      this.food = this.generateFood()
    }
    else {
      this.snake.pop()
    }

    return true
  }

  /**
   * 更新分数和最高分
   */
  private updateScore(): void {
    const highScore = Number(localStorage.getItem('snakeHighScore') || 0)
    if (this.score > highScore) {
      localStorage.setItem('snakeHighScore', this.score.toString())
    }
  }

  /**
   * 绘制游戏画面
   */
  draw(): void {
    this.ctx.fillStyle = this.config.backgroundColor
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.snake.forEach((segment, index) => {
      this.ctx.fillStyle = index === 0
        ? this.config.headColor
        : this.config.bodyColor

      this.ctx.fillRect(
        segment.x * this.cellSize,
        segment.y * this.cellSize,
        this.cellSize,
        this.cellSize,
      )

      this.ctx.strokeStyle = this.config.backgroundColor
      this.ctx.strokeRect(
        segment.x * this.cellSize,
        segment.y * this.cellSize,
        this.cellSize,
        this.cellSize,
      )
    })

    this.ctx.fillStyle = this.config.foodColor
    this.ctx.beginPath()
    this.ctx.arc(
      /** 中心点 */
      this.food.x * this.cellSize + this.cellSize / 2,
      this.food.y * this.cellSize + this.cellSize / 2,
      this.cellSize / 2,
      0,
      Math.PI * 2,
    )
    this.ctx.fill()

    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.fillStyle = '#fff'
      this.ctx.font = '30px Arial'
      this.ctx.textAlign = 'center'
      this.ctx.fillText('游戏结束', this.canvas.width / 2, this.canvas.height / 2)
      this.ctx.font = '20px Arial'
      this.ctx.fillText(`得分: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40)
    }
  }

  /**
   * 获取当前游戏状态，用于 AI 决策
   * @returns 游戏状态对象
   */
  getState(): {
    dangers: { [K in DirEnum]: boolean }
    foodDirection: { [K in DirEnum]: boolean }
    currentDirection: { [K in DirEnum]: boolean }
  } {
    const head = this.snake[0]

    return {
      /** 蛇头在四个方向是否会撞到墙壁或自身 */
      dangers: {
        [DirEnum.Up]: this.isDanger(head.x, head.y - 1),
        [DirEnum.Right]: this.isDanger(head.x + 1, head.y),
        [DirEnum.Down]: this.isDanger(head.x, head.y + 1),
        [DirEnum.Left]: this.isDanger(head.x - 1, head.y),
      },
      /** 食物相对于蛇头的位置 */
      foodDirection: {
        [DirEnum.Up]: this.food.y < head.y,
        [DirEnum.Right]: this.food.x > head.x,
        [DirEnum.Down]: this.food.y > head.y,
        [DirEnum.Left]: this.food.x < head.x,
      },
      /** 蛇当前的移动方向 */
      currentDirection: {
        [DirEnum.Up]: this.direction === DirEnum.Up,
        [DirEnum.Right]: this.direction === DirEnum.Right,
        [DirEnum.Down]: this.direction === DirEnum.Down,
        [DirEnum.Left]: this.direction === DirEnum.Left,
      },
    }
  }

  /**
   * 检查指定位置是否危险
   * @param x x坐标
   * @param y y坐标
   * @returns 是否危险
   */
  private isDanger(x: number, y: number): boolean {
    return (
      x < 0
      || x >= this.config.gridSize
      || y < 0
      || y >= this.config.gridSize
      || this.isOnSnake({ x, y })
    )
  }
}

export interface SnakeConfig {
  /**
   * 网格大小
   * @default  20
   */
  gridSize?: number

  /**
   * 画布大小（像素）
   * @default  400
   */
  canvasSize?: number

  /**
   * 蛇头颜色
   * @default  '#2E7D32'
   */
  headColor?: string

  /**
   * 蛇身颜色
   * @default  '#4CAF50'
   */
  bodyColor?: string

  /**
   * 食物颜色
   * @default  '#F44336'
   */
  foodColor?: string

  /**
   * 背景颜色
   * @default  '#222'
   */
  backgroundColor?: string
}

export interface Position {
  x: number
  y: number
}

export enum DirEnum {
  Up = '0',
  Down = '1',
  Left = '2',
  Right = '3',
}
