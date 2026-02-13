import { getColor } from '@jl-org/tool'
import { Button, Card } from 'comps'
import { createContext, memo, use, useCallback, useMemo, useRef, useState } from 'react'

/**
 * useState 手动优化 - 最简示例
 * 演示如何通过独立状态管理避免不必要的重新渲染
 */

type Item = {
  id: number
  name: string
  value: number
}

const initialItems: Item[] = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  value: i * 10,
}))

// ========== 方式 1: 传递单个 Item（正确）==========
/**
 * ✅ 优化方案：只传递单个 item 对象
 *
 * 工作原理：
 * 1. 每个 GoodItem 只接收自己对应的 item 对象和 onUpdate 回调
 * 2. 当更新某个 item 时（例如 id=2），setGoodItems 会创建新数组：
 *    - id=2 的 item 对象引用改变（新对象：{ ...it, value: it.value + 1 }）
 *    - 其他 item 对象引用保持不变（直接返回原对象：it）
 * 3. React.memo 进行浅比较：
 *    - GoodItem(id=2): item 引用改变 → 重新渲染 ✅
 *    - GoodItem(id=1): item 引用未变 → 跳过渲染 ✅
 *    - GoodItem(id=3): item 引用未变 → 跳过渲染 ✅
 *
 * 结果：只有被更新的组件重新渲染
 */
const GoodItem = memo(({ item, onUpdate }: { item: Item, onUpdate: (id: number) => void }) => {
  const renderCount = useRef(0)
  renderCount.current++

  return (
    <div
      className="p-3 rounded border-2 transition-colors"
      style={ { backgroundColor: getColor() } }
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="font-semibold">{ item.name }</div>
          <div className="text-sm text-text2">
            Value:
            { item.value }
          </div>
          <div className="text-xs text-text3">
            渲染次数:
            { renderCount.current }
          </div>
        </div>
        <Button size="sm" onClick={ () => onUpdate(item.id) }>
          更新
        </Button>
      </div>
    </div>
  )
})

// ========== 方式 2: 重新渲染所有组件 ==========
/**
 * ❌ 问题方案：传递整个 items 数组
 *
 * 为什么所有 BadItem 都会重新渲染？
 *
 * 1. 每个 BadItem 接收整个 items 数组作为 prop
 * 2. 当更新某个 item 时（例如 id=2），setBadItems 会创建新数组：
 *    ```ts
 *    prev.map((it) => it.id === itemId ? { ...it, value: it.value + 1 } : it)
 *    ```
 *    即使其他 item 内容没变，但整个数组的引用改变了（新数组）
 *
 * 3. React.memo 进行浅比较：
 *    - BadItem(id=1): items 引用改变（新数组）→ 重新渲染 ❌
 *    - BadItem(id=2): items 引用改变（新数组）→ 重新渲染 ✅（这个需要渲染）
 *    - BadItem(id=3): items 引用改变（新数组）→ 重新渲染 ❌
 *
 * 核心问题：
 * - React.memo 只做浅比较（shallow comparison）
 * - 它比较的是 props 的引用，而不是内容
 * - 即使数组内容大部分相同，只要数组引用改变，memo 就认为 props 改变了
 *
 * 解决方案：
 * - 方案 1（推荐）：只传递单个 item 对象（如 GoodItem）
 * - 方案 2：使用自定义比较函数 memo((props, prevProps) => {...})
 * - 方案 3：使用状态管理库（如 Jotai、Zustand）将状态拆分到原子级别
 */
const BadItem = memo(({ itemId, items, setItems }: {
  itemId: number
  items: Item[]
  setItems: React.Dispatch<React.SetStateAction<Item[]>>
}) => {
  const renderCount = useRef(0)
  renderCount.current++

  /** 从 items 中找到对应的项 */
  const item = items.find(it => it.id === itemId)!

  const updateItem = useCallback(() => {
    setItems(prev =>
      prev.map(it =>
        it.id === itemId
          ? { ...it, value: it.value + 1 }
          : it,
      ),
    )
  }, [itemId, setItems])

  return (
    <div
      className="p-3 rounded border-2 transition-colors"
      style={ { backgroundColor: getColor() } }
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="font-semibold">{ item.name }</div>
          <div className="text-sm text-text2">
            Value:
            { item.value }
          </div>
          <div className="text-xs text-text3">
            渲染次数:
            { renderCount.current }
          </div>
        </div>
        <Button size="sm" onClick={ updateItem }>
          更新
        </Button>
      </div>
    </div>
  )
})

// ========== 方式 3: 使用 Context（导致 Rerender 所有组件）==========
/**
 * ❌ 问题方案：使用 Context 传递状态和更新函数
 *
 * 为什么所有 ContextItem 都会重新渲染？
 *
 * 核心原因：Context 的工作机制
 *
 * 1. Context 值的创建：
 *    ```ts
 *    const contextValue = useMemo(() => ({
 *      getItem: (id) => contextItems.find(it => it.id === id),
 *      updateItem: (id, updater) => { ... }
 *    }), [contextItems])  // ⚠️ 依赖 contextItems
 *    ```
 *
 * 2. 当更新某个 item 时（例如 id=2）：
 *    ```ts
 *    setContextItems((prev) =>
 *      prev.map((it) => it.id === id ? { ...it, value: it.value + 1 } : it)
 *    )
 *    ```
 *    即使其他 item 内容没变，但整个数组的引用改变了（新数组）
 *
 * 3. 引用改变导致连锁反应：
 *    - contextItems 引用改变（新数组）
 *    - contextItems 改变 → contextValue 的 useMemo 重新计算
 *    - contextValue 引用改变（新对象）
 *    - Context.Provider 的 value 改变
 *
 * 4. React Context 的渲染机制：
 *    - 当 Context.Provider 的 value 改变时
 *    - 所有使用 useContext(ItemContext) 的组件都会重新渲染
 *    - 即使使用了 memo，也无法阻止 Context 导致的重新渲染
 *    - 因为 memo 只比较 props，而 useContext 的重新渲染是 React 内部机制
 *
 * 5. 为什么 memo 无效？
 *    - memo 只能优化 props 变化导致的重新渲染
 *    - useContext 的重新渲染是 Context 机制决定的，不受 memo 影响
 *    - 即使 ContextItem 的 props（itemId）没变，Context 值改变也会触发重新渲染
 *
 * 解决方案：
 * - 方案 1（推荐）：拆分 Context，每个 item 使用独立的 Context
 * - 方案 2：使用 Context Selector 模式（需要第三方库如 use-context-selector）
 * - 方案 3：使用状态管理库（如 Jotai、Zustand）将状态原子化
 * - 方案 4：避免在 Context 中存储频繁变化的状态，只存储稳定的函数引用
 */
type ItemContextValue = {
  getItem: (id: number) => Item | undefined
  updateItem: (id: number) => void
}

const ItemContext = createContext<ItemContextValue | null>(null)

const ContextItem = memo(({ itemId }: { itemId: number }) => {
  /**
   * ⚠️ 当 Context 值改变时，所有使用 useContext 的组件都会重新渲染
   * 即使使用了 memo，也无法阻止 Context 导致的重新渲染
   */
  const context = use(ItemContext)
  if (!context)
    throw new Error('ItemContext not provided')

  const { getItem, updateItem } = context
  const item = getItem(itemId)!

  const renderCount = useRef(0)
  renderCount.current++

  return (
    <div
      className="p-3 rounded border-2 transition-colors"
      style={ { backgroundColor: getColor() } }
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="font-semibold">{ item.name }</div>
          <div className="text-sm text-text2">
            Value:
            { item.value }
          </div>
          <div className="text-xs text-text3">
            渲染次数:
            { renderCount.current }
          </div>
        </div>
        <Button size="sm" onClick={ () => updateItem(itemId) }>
          更新
        </Button>
      </div>
    </div>
  )
})

/** 主组件 */
export const UseStateDemo = memo(() => {
  /** 方式 1: 传递单个 Item - 整个数组作为一个 state */
  // ✅ 虽然整个数组是 state，但通过只传递单个 item 对象给子组件来优化
  const [goodItems, setGoodItems] = useState(initialItems)

  const updateGoodItem = useCallback((id: number) => {
    setGoodItems(prev =>
      prev.map(it =>
        it.id === id
          ? { ...it, value: it.value + 1 }
          : it,
      ),
    )
    /**
     * 注意：这里创建了新数组，但只有被更新的 item 对象是新引用
     * 其他 item 对象保持原引用，所以其他 GoodItem 不会重新渲染
     */
  }, [])

  /** 方式 2: 传递单个 Item */
  // ❌ 传递整个数组给子组件，导致所有子组件都会重新渲染
  const [badItems, setBadItems] = useState(initialItems)

  /** 方式 3: Context 方式的状态管理 */
  /**
   * ⚠️ 问题根源：contextValue 依赖 contextItems
   *
   * 当更新任何一个 item 时：
   * 1. setContextItems 创建新数组（新引用）
   * 2. contextItems 引用改变
   * 3. contextValue 的 useMemo 重新计算（因为依赖 [contextItems]）
   * 4. contextValue 引用改变（新对象）
   * 5. Context.Provider 的 value 改变
   * 6. 所有使用 useContext(ItemContext) 的组件重新渲染
   *
   * 即使其他 item 的内容没变，但因为整个数组引用变了，导致所有组件都重新渲染
   */
  const [contextItems, setContextItems] = useState(initialItems)

  const contextValue = useMemo<ItemContextValue>(() => ({
    getItem: (id: number) => contextItems.find(it => it.id === id),
    updateItem: (id: number) => {
      setContextItems(prev =>
        prev.map(it =>
          it.id === id
            ? { ...it, value: it.value + 1 }
            : it,
        ),
      )
    },
  }), [contextItems]) // ⚠️ 依赖 contextItems，这是问题的根源

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-text mb-2">
            useState 手动优化 - 最简示例
          </h2>
          <p className="text-text2">
            演示如何通过独立状态管理避免不必要的重新渲染。
            点击"更新"按钮，观察渲染次数的变化。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 方式 1: 传递单个 Item（正确） */ }
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text">
              方式 1: 传递单个 Item
            </h3>
            <div className="text-sm text-text2 mb-2">
              ✅ 更新任意一项时，只有对应的组件重新渲染
            </div>
            <div className="space-y-2">
              { goodItems.map(item => (
                <GoodItem
                  key={ item.id }
                  item={ item }
                  onUpdate={ updateGoodItem }
                />
              )) }
            </div>
          </div>

          {/* 方式 2: 传递整个数组 */ }
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text">
              方式 2: 传递整个数组
            </h3>
            <div className="text-sm text-text2 mb-2">
              ⚠️ 更新任意一项时，所有组件都会重新渲染
            </div>
            <div className="space-y-2">
              { badItems.map(item => (
                <BadItem
                  key={ item.id }
                  itemId={ item.id }
                  items={ badItems }
                  setItems={ setBadItems }
                />
              )) }
            </div>
          </div>

          {/* 方式 3: Context 方式 */ }
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text">
              方式 3: Context
            </h3>
            <div className="text-sm text-text2 mb-2">
              ⚠️ 更新任意一项时，所有组件都会重新渲染
            </div>
            <ItemContext value={ contextValue }>
              <div className="space-y-2">
                { contextItems.map(item => (
                  <ContextItem key={ item.id } itemId={ item.id } />
                )) }
              </div>
            </ItemContext>
          </div>
        </div>
      </Card>
    </div>
  )
})
