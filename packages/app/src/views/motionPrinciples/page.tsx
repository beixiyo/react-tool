import type {
  ReactElement,
  ReactNode,
} from 'react'
import { getColor } from '@jl-org/tool'
import React, {
  cloneElement,
  memo,
  useEffect,
  useRef,
  useState,
} from 'react'
import { filterValidComps, getCompKey } from 'utils'

/** 测试组件 */
export default function DemoComponent() {
  const [components, setComponents] = useState<React.ReactElement[]>([
    <Box key={ crypto.randomUUID() } color={ getColor() } text="组件 1" />,
    <Box key={ crypto.randomUUID() } color={ getColor() } text="组件 2" />,
  ])

  const addComponent = () => {
    const newIndex = crypto.randomUUID()
    const color = getColor()
    setComponents([...components, <Box key={ `${newIndex}` } color={ color } text={ `组件 ${newIndex}` } />])
  }

  const removeComponent = (index: number) => {
    setComponents(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-8 text-center text-2xl text-gray-800 font-bold">
        React 组件卸载动画演示
      </h1>

      <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
        <button
          onClick={ addComponent }
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          添加随机组件
        </button>
        <button
          onClick={ () => setComponents([]) }
          className="rounded-lg bg-red-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-red-700"
        >
          移除所有组件
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="p-6">
          <UnmountController animationDuration={ 400 }>
            { components.map((comp, index) => (
              <div key={ comp.key } className="group relative">
                { comp }
                <button
                  onClick={ () => removeComponent(index) }
                  className="absolute rounded-full bg-red-500 p-1 text-white opacity-0 shadow-lg transition-opacity -right-2 -top-2 hover:bg-red-600 group-hover:opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )) }
          </UnmountController>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <p className="text-sm text-gray-600">
            共
            { ' ' }
            { components.length }
            { ' ' }
            个组件 | 移除组件时会执行退出动画
          </p>
        </div>
      </div>
    </div>
  )
}

/** 动画包裹器组件 */
const AnimatedWrapper = memo(({
  isActive,
  isLeaving,
  isNew,
  animationDuration,
  onAnimationEnd,
  children,
}: AnimatedWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [animationClasses, setAnimationClasses] = useState('')

  useEffect(() => {
    const element = ref.current
    if (!element)
      return

    let animationTimeout: NodeJS.Timeout

    /** 处理新添加元素的进入动画 */
    if (isNew && !isLeaving) {
      /** 设置初始状态 */
      element.classList.add('opacity-0', 'translate-y-4')
      /** 下一帧应用动画 */
      requestAnimationFrame(() => {
        setAnimationClasses('opacity-100 translate-y-0')
      })
    }

    /** 处理元素的离开动画 */
    if (isLeaving) {
      setAnimationClasses('opacity-0 -translate-y-4')
      animationTimeout = setTimeout(() => {
        onAnimationEnd()
      }, animationDuration)
    }

    return () => {
      if (animationTimeout)
        clearTimeout(animationTimeout)
    }
  }, [isLeaving, isNew, animationDuration, onAnimationEnd])

  /** 动态计算类名 */
  const getContainerClasses = () => {
    let baseClasses = 'transition-transform duration-300 ease-in-out '

    if (isActive && !isLeaving) {
      baseClasses += ''
    }
    else if (isLeaving) {
      baseClasses += 'pointer-events-none '
    }
    else if (!isActive && !isNew) {
      baseClasses += 'hidden '
    }

    return baseClasses + animationClasses
  }

  return (
    <div
      ref={ ref }
      className={ getContainerClasses() }
      style={ {
        transitionDuration: `${animationDuration}ms`,
        transitionProperty: 'opacity, transform',
      } }
    >
      { children }
    </div>
  )
})

/** 主控制器组件 */
export const UnmountController = memo(({
  children,
  animationDuration = 300,
  onAnimationEnd,
}: UnmountControllerProps) => {
  /** 管理所有显示的子元素状态 */
  const [displayedChildren, setDisplayedChildren] = useState<ChildState[]>([])

  /** 存储上一个子元素数组（用于比较） */
  const prevChildrenRef = useRef<ReactElement[]>([])

  /** 处理子元素的变化 */
  useEffect(() => {
    const currentChildrenArray = filterValidComps(children)
    const prevChildrenArray = prevChildrenRef.current

    /** 获取当前和之前子元素的 keys */
    const currentKeys = new Set(currentChildrenArray.map(comp => getCompKey(comp)))

    /** 更新显示中的子元素 */
    setDisplayedChildren((prevDisplayed) => {
      const nextDisplayed = [...prevDisplayed]

      /** 处理新添加的子元素 */
      currentChildrenArray.forEach((child) => {
        const key = child.key?.toString() || ''
        if (!key)
          return

        /** 检查是否已经存在 */
        const existingIndex = nextDisplayed.findIndex(dc => dc.key === key)

        if (existingIndex === -1) {
          /** 新元素 - 添加到数组 */
          nextDisplayed.push({
            child,
            key,
            animationKey: `${key}-${Date.now()}`,
            isActive: true,
            isLeaving: false,
            isNew: true,
          })
        }
        else if (!nextDisplayed[existingIndex].isActive) {
          /** 之前标记为离开的元素再次出现 */
          nextDisplayed[existingIndex] = {
            ...nextDisplayed[existingIndex],
            child,
            isActive: true,
            isLeaving: false,
            isNew: false,
          }
        }
      })

      /** 处理被移除的子元素 */
      prevChildrenArray.forEach((prevChild) => {
        const key = prevChild.key?.toString() || ''
        if (!key)
          return

        if (!currentKeys.has(key)) {
          const index = nextDisplayed.findIndex(dc => dc.key === key)
          if (index !== -1 && !nextDisplayed[index].isLeaving) {
            /** 标记为离开，而不是直接移除 */
            nextDisplayed[index] = {
              ...nextDisplayed[index],
              isActive: false,
              isLeaving: true,
            }
          }
        }
      })

      return nextDisplayed
    })

    /** 更新引用以备下次比较 */
    prevChildrenRef.current = currentChildrenArray
  }, [children])

  /** 当一个子元素的离开动画结束时调用 */
  const handleChildAnimationEnd = (key: string) => {
    setDisplayedChildren(prev =>
      prev.filter(child => child.key !== key),
    )

    /** 如果有回调则调用 */
    if (onAnimationEnd) {
      onAnimationEnd()
    }
  }

  return (
    <div className="relative min-h-[100px] w-full border border-gray-200 rounded-xl bg-gray-50 p-4 shadow-xs">
      { displayedChildren.length === 0
        ? (
          <div className="py-10 text-center text-gray-500">
            <p>添加一些组件来查看动画效果</p>
            <div className="mt-2 text-sm">
              移除组件时将触发退出动画
            </div>
          </div>
        )
        : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            { displayedChildren.map(({ child, key, animationKey, isActive, isLeaving, isNew }) => (
              <AnimatedWrapper
                key={ animationKey }
                isActive={ isActive }
                isLeaving={ isLeaving }
                isNew={ isNew }
                animationDuration={ animationDuration }
                onAnimationEnd={ () => handleChildAnimationEnd(key) }
              >
                { cloneElement(child, {
                  style: {
                    ...(child as any).props.style,
                    transition: `all ${animationDuration}ms ease-in-out`,
                  },
                } as any) }
              </AnimatedWrapper>
            )) }
          </div>
        ) }
    </div>
  )
})

/** 可复用的盒子组件 */
const Box = memo(({ color, text }: { color: string, text: string }) => (
  <div
    style={ { backgroundColor: color } }
    className="border border-gray-200 rounded-lg p-6 shadow-sm transition-all"
  >
    <div className="flex items-center space-x-3">
      <div className="h-16 w-16 border-2 rounded-xl border-dashed bg-gray-200" />
      <div>
        <h3 className="text-lg text-gray-800 font-medium">{ text }</h3>
        <p className="mt-1 text-sm text-gray-600">
          这是动画演示的可移除组件
        </p>
      </div>
    </div>
  </div>
))

/** 为每个子元素的状态定义类型 */
interface ChildState {
  child: ReactElement
  key: string // 原始 key
  animationKey: string // 用于动画的特殊 key
  isActive: boolean // 是否是活动状态
  isLeaving: boolean // 是否正在离开
  isNew: boolean // 是否是新添加的
}

/** 组件的 props */
interface UnmountControllerProps {
  children: ReactNode
  animationDuration?: number // 动画持续时间（毫秒）
  onAnimationEnd?: () => void // 所有动画结束的回调
}

/** 每个动画包裹器的 props */
interface AnimatedWrapperProps {
  isActive: boolean
  isLeaving: boolean
  isNew: boolean
  animationDuration: number
  onAnimationEnd: () => void
  children: ReactElement
}
