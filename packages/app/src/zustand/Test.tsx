import type { CreateState } from './type'
import PopoverExample from 'comps'
import { create } from '.'

const initState = {
  aaa: 'TestMyZustand',
  bbb: '',
}

const useXxxStore = create<typeof initState>(logMiddleware(
  (set, get, api) => ({
    ...initState,
  }),
),
)

/**
 * 这种写法无法触发中间件
 */
const updateAaa = (v: string) => useXxxStore.setState(state => ({ aaa: v }))

/**
 * 外部更新触发变化
 */
setInterval(() => {
  updateAaa(Math.random().toString(36).substring(7))
}, 2000)

export default function TestMyZustand() {
  const store = useXxxStore(state => state)

  return (
    <div className="flex flex-col gap-4 p-4">
      <div
        h-5
        text-red-5
        cursor-pointer
        transition-all
        className="font-(light mono) hover:(bg-gray-400 font-medium)"
      >
        {store.aaa}
      </div>
      <input
        onChange={ e => updateAaa(e.currentTarget.value) }
        value={ store.aaa }
        className="border border-black border-solid"
      />

      <PopoverExample />
    </div>
  )
}

function logMiddleware<S extends object>(
  createState: CreateState<S>,
) {
  type P = Parameters<CreateState<S>>

  return (
    set: P[0],
    get: P[1],
    api: P[2],
  ) => {
    const newSet: P[0] = (state, replace) => {
      console.log('设置值前', api.getState())
      set(state, replace)
      console.log('设置值后', api.getState())
    }

    return createState(newSet, get, api)
  }
}
