/**
 * 更新 Q 值的函数
 * ### Q(s,a) = Q(s,a) + α [r + γ max(Q(s',a')) - Q(s,a)]
 * ### 新 Q 值 = 旧 Q 值 + 学习率 * ( 当前奖励 + 折扣因子 * (下一个状态最好的 Q 值) - 旧 Q 值 )
 *
 * - **学习率 (Learning Rate, α)**：表示 AI 对新学到的知识有多“信任”。值越大，越容易被新经验改变；值越小，越“固执”，更相信过去的经验。
 * - **折扣因子 (Discount Factor, γ)**：表示 AI 对“未来奖励”的重视程度。值越接近 1，说明 AI 越有“远见”，会为了未来的大奖励而放弃眼前的小奖励；值越接近 0，说明 AI 越“短视”，只关心眼前的奖励。
 *
 * @param qTable - 存储所有状态-动作对的 Q 值的表
 * @param state - 当前的状态 s
 * @param action - 在当前状态下采取的动作 a
 * @param nextState - 执行动作后到达的下一个状态 s'
 * @param reward - 执行动作后立即获得的奖励 r
 * @param alpha - 学习率 α，表示 AI 对新学到的知识有多“信任”。值越大，越容易被新经验改变；值越小，越“固执”，更相信过去的经验
 * @param gamma - 折扣因子 γ，反映了未来奖励的重要性。接近 1 时更重视长期回报，接近 0 时更关注即时奖励
 * @param possibleActions - 下一个状态中所有可能的动作集合
 */
function updateQValue(
  qTable: Map<string, number>,
  state: string,
  action: string,
  nextState: string,
  reward: number,
  alpha: number,
  gamma: number,
  possibleActions: string[],
): void {
  /** 获取当前 Q 值 */
  const currentStateActionKey = `${state}-${action}`
  const currentQValue = qTable.get(currentStateActionKey) || 0

  /** 计算下一个状态的最大 Q 值 */
  let maxNextQValue = 0
  for (const nextAction of possibleActions) {
    const nextStateActionKey = `${nextState}-${nextAction}`
    const nextQValue = qTable.get(nextStateActionKey) || 0
    if (nextQValue > maxNextQValue) {
      maxNextQValue = nextQValue
    }
  }

  /** 根据 Q-learning 公式更新 Q 值 */
  const updatedQValue = currentQValue + alpha * (reward + gamma * maxNextQValue - currentQValue)

  /** 更新 Q 表中的值 */
  qTable.set(currentStateActionKey, updatedQValue)
}

/** 示例使用 */
const qTable = new Map<string, number>()
const state = 'room1' /** 当前状态为 room1 */
const action = 'openDoor' /** 动作为 openDoor */
const nextState = 'room2' /** 下一个状态为 room2 */
const reward = 5 /** 立即获得的奖励为 5 */
const alpha = 0.1 /** 学习率为 0.1 */
const gamma = 0.9 /** 折扣因子为 0.9 */
const possibleActions = ['pickupCoin', 'moveForward'] /** 可能的动作 */

updateQValue(qTable, state, action, nextState, reward, alpha, gamma, possibleActions)

console.log(qTable) /** 输出更新后的 Q 表 */
