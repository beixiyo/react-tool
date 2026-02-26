'use client'

import type { Variants } from 'motion/react'
import type { DateTickerProps } from './types'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useRef } from 'react'

function DateTickerInner({ currentIndex, labels, visible }: DateTickerProps) {
  const prevIndexRef = useRef(currentIndex)
  const direction = currentIndex >= prevIndexRef.current
    ? 1
    : -1
  prevIndexRef.current = currentIndex

  if (!visible || labels.length === 0) {
    return null
  }

  const variants: Variants = {
    initial: (dir: number) => ({
      y: dir > 0
        ? 15
        : -15,
      opacity: 0,
    }),
    animate: {
      y: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      y: dir > 0
        ? -15
        : 15,
      opacity: 0,
    }),
  }

  const springTransition = {
    type: 'spring' as const,
    stiffness: 400,
    damping: 35,
  }

  return (
    <motion.div
      className="overflow-hidden rounded-full bg-background/80 backdrop-blur-md text-text px-4 py-1 shadow-lg border border-border/50"
      layout
    >
      <div className="flex items-center justify-center h-6 min-w-fit">
        <AnimatePresence custom={ direction } mode="popLayout">
          <motion.span
            animate="animate"
            className="whitespace-nowrap font-medium text-sm inline-block px-1"
            custom={ direction }
            exit="exit"
            initial="initial"
            key={ currentIndex }
            transition={ springTransition }
            variants={ variants }
          >
            { labels[currentIndex] }
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export const DateTicker = memo(DateTickerInner)

DateTicker.displayName = 'DateTicker'
