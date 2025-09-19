import { onMounted, useGetState, useNotifyParentReady } from 'hooks'
import { useImmer } from 'use-immer'

function UseGetStateTest() {
  /** 通知父窗口组件准备就绪（用于截图） */
  useNotifyParentReady()

  onMounted(() => {
    console.log('UseGetStateTest Mounted')
  })

  const [count, setCount] = useGetState(0, true)
  const [data, setData] = useGetState({ a: 1, b: 2 }, true)

  const [immer, setImmer] = useImmer([
    [{ data: 1, obj: { data: 10 } }, { data: 3, obj: { data: 10 } }],
    [{ data: 2, obj: { data: 10 } }, { data: 4, obj: { data: 10 } }],
  ])

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {immer.map((items, index) => (
        <div key={ index }>
          {items.map((item, index) => (
            <div key={ index }>
              {item.obj.data}
            </div>
          ),
          )}
        </div>
      ),
      )}

      <button onClick={ () => {
        setImmer((draft) => {
          draft[0][0].obj.data++
        })
      } }
      >
        immer set
      </button>

      <div className="h-1 w-full bg-orange-600"></div>

      <p>{JSON.stringify(count)}</p>

      <button onClick={ () => {
        setCount(count + 1)
        console.log(`count: ${count}, getLatest: ${setCount.getLatest()}`) // 0 1
      } }
      >
        ++
      </button>

      <p>{JSON.stringify(data)}</p>
      <button onClick={ () => {
        const log = () => console.log({
          getLatest: JSON.stringify(setData.getLatest()),
          data: JSON.stringify(data),
        })

        // {
        //   const latestState = setData.getLatest()
        //   latestState.a++
        //   setData(latestState)
        //   log()
        // }

        // {
        //   setData(pre => { return { a: pre.a + 1 } })
        //   log()
        // }

        // {
        //   setData({ a: data.a + 1 })
        //   log()
        // }

        /**
         * 多次设置值
         */
        {
          const latestState = setData.getLatest()
          latestState.a++
          setData(latestState)
          log()

          latestState.a++
          setData(latestState)
          log()
        }
      } }
      >
        set
      </button>

      <button onClick={ setData.reset }>reset</button>
    </div>
  )
}

export default UseGetStateTest
