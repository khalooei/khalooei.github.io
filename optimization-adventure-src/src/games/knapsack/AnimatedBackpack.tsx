import { motion } from 'framer-motion'
import { clamp } from '../../utils/format'

export function AnimatedBackpack({ fillPct, shake, overflow }: { fillPct: number; shake: boolean; overflow: boolean }) {
  const clamped = clamp(fillPct, 0, 100)

  return (
    <div className={'relative flex flex-col items-center ' + (shake ? 'animate-shake' : '')}>
      <motion.div
        className={
          'animate-breathe relative flex h-40 w-36 items-end justify-center overflow-hidden rounded-b-[2.5rem] rounded-t-2xl border-4 shadow-xl sm:h-48 sm:w-44 ' +
          (overflow ? 'border-rose-400 bg-rose-50' : 'border-brand-400 bg-white')
        }
      >
        <motion.div
          className={'absolute inset-x-0 bottom-0 ' + (overflow ? 'bg-rose-300/70' : 'bg-gradient-to-t from-brand-400 to-brand-300/70')}
          animate={{ height: `${clamped}%` }}
          transition={{ type: 'spring', stiffness: 110, damping: 16 }}
        />
        <span className="relative z-10 mb-3 text-5xl" aria-hidden="true">
          🎒
        </span>
      </motion.div>
      <div className="mt-2 h-2 w-20 rounded-full bg-brand-200/60" aria-hidden="true" />
    </div>
  )
}
