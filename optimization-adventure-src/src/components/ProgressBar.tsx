import { motion } from 'framer-motion'
import { clamp } from '../utils/format'

interface ProgressBarProps {
  value: number
  max: number
  danger?: boolean
  label?: string
  valueLabel?: string
}

export function ProgressBar({ value, max, danger, label, valueLabel }: ProgressBarProps) {
  const pct = clamp(max > 0 ? (value / max) * 100 : 0, 0, 100)
  const isNearFull = pct >= 85 && !danger

  return (
    <div className="w-full">
      {(label || valueLabel) && (
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>{label}</span>
          <span>{valueLabel}</span>
        </div>
      )}
      <div
        className="h-4 w-full overflow-hidden rounded-full bg-slate-200/70"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <motion.div
          className={
            'h-full rounded-full ' +
            (danger
              ? 'bg-gradient-to-r from-rose-500 to-red-500'
              : isNearFull
                ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                : 'bg-gradient-to-r from-violet-500 to-fuchsia-500')
          }
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
      </div>
    </div>
  )
}
