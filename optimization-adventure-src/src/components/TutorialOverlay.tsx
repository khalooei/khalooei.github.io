import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../i18n/I18nContext'

export function TutorialOverlay({
  open,
  title,
  steps,
  onClose,
}: {
  open: boolean
  title: string
  steps: string[]
  onClose: () => void
}) {
  const { t } = useI18n()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tutorial-title"
        >
          <motion.div
            className="card-surface w-full max-w-md rounded-3xl p-6"
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
          >
            <h3 id="tutorial-title" className="flex items-center gap-2 text-lg font-extrabold text-brand-800">
              <span aria-hidden="true">✨</span>
              {title}
            </h3>
            <ol className="mt-4 space-y-3">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="focus-ring rounded-full bg-gradient-to-r from-brand-500 to-sunset-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-105"
                onClick={onClose}
              >
                {t('common.start')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
