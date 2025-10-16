import { motion } from 'framer-motion'

export const ScrollIndicator = memo(() => {
  return (
    <motion.div
      className="absolute bottom-10 left-1/2 flex flex-col transform items-center -translate-x-1/2"
      initial={ { opacity: 0, y: -10 } }
      animate={ { opacity: 1, y: 0 } }
      transition={ { delay: 1, duration: 0.5 } }
    >
      <p className="mb-2 text-textSecondary">向下滚动查看更多</p>
      <motion.div
        className="h-10 w-6 flex justify-center border-2 border-border rounded-full p-1"
        initial={ { opacity: 0.5 } }
        animate={ { opacity: 1 } }
        transition={ { duration: 1, repeat: Infinity, repeatType: 'reverse' } }
      >
        <motion.div
          className="h-2 w-1 rounded-full bg-primary"
          animate={ {
            y: [0, 12, 0],
          } }
          transition={ {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          } }
        />
      </motion.div>
    </motion.div>
  )
})
