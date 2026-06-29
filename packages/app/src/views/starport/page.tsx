import { uniqueId } from '@jl-org/tool'
import { Button } from 'comps'
import { ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { cn } from 'utils'
import { GithubSourceLink } from '@/components/GithubSourceLink'

const id = uniqueId()

function Test() {
  const [showPageA, setShowPageA] = useState(true)

  return (
    <>
      { showPageA
        ? (
            <PageA />
          )
        : (
            <PageB />
          ) }

      <button
        className={ cn('rounded-full bg-gray-800 p-4 text-white') }
        onClick={ () => setShowPageA(prev => !prev) }
      >
        切换页面
      </button>

      <GithubSourceLink />
    </>
  )
}

const Counter = memo(() => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p className="text-white">
        Count:
        { count }
      </p>
      <ChevronRight className={ cn('h-full w-full text-white') } />
      <Button
        variant="primary"
        onClick={ () => setCount(prev => prev + 1) }
      >
        Increment
      </Button>
    </div>
  )
})

function PageA() {
  return (
    <div className={ cn('w-full bg-gray-50 p-8') }>
      <div className={ cn('mx-auto max-w-md') }>
        <h1 className={ cn('mb-8 text-2xl font-medium text-gray-800') }>页面A</h1>

        <div className={ cn('flex items-center gap-4') }>
          <motion.div layoutId={ id } className={ cn('h-24 w-24 rounded-lg bg-blue-500 p-4') }>
            <Counter />
          </motion.div>

          <div className={ cn('flex-1') }>
            <p className={ cn('text-gray-600') }>点击按钮切换到页面B</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PageB() {
  return (
    <div className={ cn('w-full bg-gray-900 p-8') }>
      <div className={ cn('mx-auto max-w-md') }>
        <h1 className={ cn('mb-8 text-2xl font-medium text-white') }>页面B</h1>

        <div className={ cn('flex flex-col gap-4') }>
          <div className={ cn('flex-1') }>
            <p className={ cn('text-gray-400') }>点击按钮返回页面A</p>
          </div>

          <motion.div layoutId={ id } className={ cn('ml-auto h-16 w-16 rounded-full bg-red-500 p-3') }>
            <Counter />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Test
