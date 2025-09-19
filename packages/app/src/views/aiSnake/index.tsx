import { SnakeGame } from './SnakeGame'

/**

开始训练
   │
   ▼
重置游戏（snake.reset()）
   │
   ▼
获取当前状态 state = snake.getState()
   │
   ▼
判断是否探索：如果随机值 < 探索率，则随机选择动作，否则选择 Q 值最高的动作
   │
   ▼
执行动作：snake.changeDirection(action) -> snake.move()
   │
   ▼
判断是否游戏结束
   ├── 是 → 游戏结束，给予负奖励，更新 Q 表，结束当前回合
   └── 否 → 计算奖励 reward（根据是否吃到食物、是否接近食物等）
            │
            ▼
      获取下一状态 nextState = snake.getState()
            │
            ▼
  更新 Q 值：Q(s, a) = Q(s, a) + α (reward + γ max(Q(nextState)) - Q(s, a))
            │
            ▼
      绘制游戏（snake.draw()）
            │
            ▼
         继续循环

### `Snake`类：游戏的地盘

`Snake`类负责画蛇、移动蛇、生成食物。比如：

- `move()`：让蛇走一步，吃到食物就变长，撞墙就游戏结束。
- `draw()`：把蛇和食物画在屏幕上，游戏结束还显示得分。

### `QLearnSnakeAI`类：AI的大脑

`QLearnSnakeAI`类是AI的核心，里面有几个关键方法：

- **`getAction`**：根据状态选动作，像AI的“决策中心”。
- **`updateQValue`**：用Q-learning公式更新Q表，像AI的“记笔记”。
- **`calculateReward`**：算奖励，像AI的“老师”。
- **`train`**：让AI玩很多轮游戏，每次都学一点。

训练时，AI会玩好多次游戏（比如1000轮），每轮都记下经验，更新Q表。慢慢地，它就从“乱撞”变成“高手”了。

 */
function App() {
  return (
    <div className="h-screen overflow-auto bg-gray-100">
      <SnakeGame
        gridSize={ 20 }
        canvasSize={ 400 }
        gameSpeed={ 150 }
        aiPlaySpeed={ 100 }
        snakeConfig={ {
          headColor: '#2E7D32',
          bodyColor: '#4CAF50',
          foodColor: '#F44336',
          backgroundColor: '#222',
        } }
        aiConfig={ {
          learningRate: 0.1,
          discountFactor: 0.9,
          explorationRate: 0.3,
          minExplorationRate: 0.1,
          explorationDecay: 0.99,
        } }
      />
    </div>
  )
}

export default App
