import { getColor } from '@jl-org/tool'
import { Button, Card } from 'comps'
import { atom, useAtom } from 'jotai'
import { atomWithReset, splitAtom } from 'jotai/utils'
import { memo, useCallback, useRef } from 'react'

/** 初始数据 */
const initialItems = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  value: i * 10,
}))

// ========== 方式 1: 不使用 splitAtom ==========
/**
 * 不使用 splitAtom 的方案：
 * - 通过 props 传递单个 item 和更新函数
 * - 类似 UseStateDemo1 的方式 1（传递单个 Item）
 * - 需要手动管理更新逻辑
 */
const itemsAtomWithoutSplit = atom(initialItems)

type Item = typeof initialItems[number]

/** 子组件（不使用 splitAtom） */
const ItemWithoutSplit = memo(({
  item,
  onUpdate,
}: {
  item: Item
  onUpdate: (id: number) => void
}) => {
  const renderCount = useRef(0)
  renderCount.current++

  const updateItem = useCallback(() => {
    onUpdate(item.id)
  }, [item.id, onUpdate])

  return (
    <div
      className="p-3 rounded-sm border-2 transition-colors"
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

// ========== 方式 2: 使用 splitAtom ==========
/**
 * 使用 splitAtom 的方案：
 * - 通过 atom 订阅单个 item
 * - splitAtom 将数组拆分为独立的 item atoms
 * - Jotai 自动处理更新逻辑，只有对应的组件重新渲染
 */
const itemsAtomWithSplit = atomWithReset(initialItems)
const itemAtomsAtom = splitAtom(itemsAtomWithSplit)

/** 子组件（使用 splitAtom） */
const ItemWithSplit = memo(({ itemAtom }: { itemAtom: any }) => {
  // ✅ 每个组件只订阅自己对应的 item atom
  const [item, setItem] = useAtom<Item>(itemAtom)
  const renderCount = useRef(0)
  renderCount.current++

  const updateItem = useCallback(() => {
    setItem(prev => ({ ...prev, value: prev.value + 1 }))
  }, [setItem])

  return (
    <div
      className="p-3 rounded-sm border-2 transition-colors"
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

/** 主组件 */
export const SplitAtomDemo = memo(() => {
  const [itemsWithoutSplit, setItemsWithoutSplit] = useAtom(itemsAtomWithoutSplit)
  const [itemAtoms, dispatch] = useAtom(itemAtomsAtom)

  /** 更新单个 item 的函数（不使用 splitAtom） */
  const updateItemWithoutSplit = useCallback((id: number) => {
    setItemsWithoutSplit(prev =>
      prev.map(it =>
        it.id === id
          ? { ...it, value: it.value + 1 }
          : it,
      ),
    )
  }, [setItemsWithoutSplit])

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-text mb-2">
            splitAtom 演示
          </h2>
          <p className="text-text2">
            两个方案都只传递单个 item 相关的数据，区别在于：
            不使用 splitAtom 通过 props 传递，使用 splitAtom 通过 atom 订阅。
            点击"更新"按钮时，观察哪些组件重新渲染了（查看"渲染次数"增加）。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 不使用 splitAtom */ }
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text">
              不使用 splitAtom
            </h3>
            <div className="text-sm text-text2 mb-2">
              ✅ 通过 props 传递单个 item，更新时只有对应的组件重新渲染
            </div>
            <div className="space-y-2">
              { itemsWithoutSplit.map(item => (
                <ItemWithoutSplit
                  key={ item.id }
                  item={ item }
                  onUpdate={ updateItemWithoutSplit }
                />
              )) }
            </div>
          </div>

          {/* 使用 splitAtom */ }
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text">
              使用 splitAtom
            </h3>
            <div className="text-sm text-text2 mb-2">
              ✅ 通过 atom 订阅单个 item，更新时只有对应的组件重新渲染
            </div>
            <div className="space-y-2">
              { itemAtoms.map(itemAtom => (
                <ItemWithSplit key={ `${itemAtom}` } itemAtom={ itemAtom } />
              )) }
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-background2 rounded-lg">
          <h4 className="font-semibold text-text mb-2">说明：</h4>
          <ul className="text-sm text-text2 space-y-1 list-disc list-inside">
            <li>
              <strong>不使用 splitAtom</strong>
              ：
              <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                <li>通过 props 传递单个 item 和更新函数</li>
                <li>需要手动管理更新逻辑（类似 UseStateDemo1 的方式 1）</li>
                <li>更新时只有对应的组件重新渲染</li>
              </ul>
            </li>
            <li>
              <strong>使用 splitAtom</strong>
              ：
              <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                <li>splitAtom 将数组拆分为独立的 item atoms</li>
                <li>每个组件通过 atom 订阅单个 item</li>
                <li>Jotai 自动处理更新逻辑，只有对应的组件重新渲染</li>
                <li>优势：不需要手动传递 props，状态管理更简洁</li>
              </ul>
            </li>
            <li className="mt-2">
              <strong>结论</strong>
              ：两种方案性能相同，但使用 splitAtom 可以让代码更简洁，不需要手动传递 props 和更新函数
            </li>
          </ul>
        </div>
      </Card>
    </div>
  )
})
