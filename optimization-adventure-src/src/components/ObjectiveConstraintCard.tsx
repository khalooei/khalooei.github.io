import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../i18n/I18nContext'

export function ObjectiveConstraintCard({
  objectiveLabel,
  objectiveValue,
  constraintLabel,
  constraintValue,
}: {
  objectiveLabel: string
  objectiveValue: string
  constraintLabel: string
  constraintValue: string
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(true)

  return (
    <div className="card-surface rounded-2xl p-4">
      <button
        type="button"
        className="focus-ring flex w-full items-center justify-between gap-2 text-start"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-bold text-brand-800">
          <span aria-hidden="true">🎓</span>
          {t('terminology.title')}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-brand-500">
          ▾
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl bg-leaf-500/10 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-leaf-600">{objectiveLabel}</p>
                <p className="text-sm font-semibold text-slate-700">{objectiveValue}</p>
              </div>
              <div className="rounded-xl bg-sunset-500/10 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-sunset-600">{constraintLabel}</p>
                <p className="text-sm font-semibold text-slate-700">{constraintValue}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
